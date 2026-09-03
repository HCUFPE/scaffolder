import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma, type UserProfile } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateUserInput, UpdateUserInput } from './user.inputs';
import { KeycloakAdminService, type ProviderUserState } from './keycloak-admin.service';
import { toManagedUser, type ManagedUserDto } from './user.types';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly keycloak: KeycloakAdminService,
  ) {}

  async list(input: { page: number; pageSize: number; search?: string }): Promise<{
    data: ManagedUserDto[];
    meta: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    const where: Prisma.UserProfileWhereInput | undefined = input.search
      ? {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' } },
            { email: { contains: input.search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [profiles, total] = await this.prisma.$transaction([
      this.prisma.userProfile.findMany({
        where,
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      }),
      this.prisma.userProfile.count({ where }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / input.pageSize));
    return {
      data: profiles.map(toManagedUser),
      meta: {
        page: input.page,
        pageSize: input.pageSize,
        total,
        totalPages,
      },
    };
  }

  async getById(id: string): Promise<ManagedUserDto> {
    return toManagedUser(await this.profile(id));
  }

  async create(input: CreateUserInput): Promise<ManagedUserDto> {
    if (await this.prisma.userProfile.findUnique({ where: { email: input.email } })) {
      throw new ConflictException('Já existe um perfil com o e-mail informado.');
    }

    const keycloakUserId = await this.keycloak.createUser(input);
    try {
      const profile = await this.prisma.userProfile.create({
        data: {
          keycloakUserId,
          name: input.name,
          email: input.email,
          roleSnapshot: input.role,
          isActiveLocal: true,
        },
      });
      return toManagedUser(profile);
    } catch (error) {
      await this.compensate(() => this.keycloak.deleteUser(keycloakUserId), 'remoção da identidade recém-criada');
      this.throwPersistenceError(error);
    }
  }

  async update(id: string, input: UpdateUserInput): Promise<ManagedUserDto> {
    const profile = await this.profile(id);
    if (input.email && input.email !== profile.email) await this.assertEmailAvailable(input.email, id);

    const previous = await this.keycloak.updateUser(profile.keycloakUserId, input);
    try {
      const updated = await this.prisma.userProfile.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.email !== undefined ? { email: input.email } : {}),
          ...(input.role !== undefined ? { roleSnapshot: input.role } : {}),
        },
      });
      return toManagedUser(updated);
    } catch (error) {
      await this.restore(previous);
      this.throwPersistenceError(error);
    }
  }

  async updateOwnName(id: string, name: string): Promise<ManagedUserDto> {
    const profile = await this.profile(id);
    const previous = await this.keycloak.updateUser(profile.keycloakUserId, { name });
    try {
      return toManagedUser(await this.prisma.userProfile.update({ where: { id }, data: { name } }));
    } catch (error) {
      await this.restore(previous);
      this.throwPersistenceError(error);
    }
  }

  async setActive(id: string, isActive: boolean): Promise<ManagedUserDto> {
    const profile = await this.profile(id);
    const previous = await this.keycloak.setEnabled(profile.keycloakUserId, isActive);
    try {
      const operations = [
        this.prisma.userProfile.update({
          where: { id },
          data: { isActiveLocal: isActive },
        }),
        ...(!isActive ? [this.prisma.session.deleteMany({ where: { userProfileId: id } })] : []),
      ];
      const [updated] = await this.prisma.$transaction(operations);
      return toManagedUser(updated as UserProfile);
    } catch (error) {
      await this.restore(previous);
      this.throwPersistenceError(error);
    }
  }

  private async profile(id: string): Promise<UserProfile> {
    const profile = await this.prisma.userProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Perfil de usuário não encontrado.');
    return profile;
  }

  private async assertEmailAvailable(email: string, currentId: string): Promise<void> {
    const owner = await this.prisma.userProfile.findUnique({ where: { email } });
    if (owner && owner.id !== currentId) throw new ConflictException('Já existe um perfil com o e-mail informado.');
  }

  private async restore(previous: ProviderUserState): Promise<void> {
    await this.compensate(() => this.keycloak.restoreUser(previous), 'restauração da identidade no Keycloak');
  }

  private async compensate(operation: () => Promise<void>, description: string): Promise<void> {
    try {
      await operation();
    } catch {
      this.logger.error(`Falha de compensação durante ${description}; reconciliação manual necessária.`);
      throw new ServiceUnavailableException('A operação falhou e requer reconciliação da identidade.');
    }
  }

  private throwPersistenceError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Já existe um perfil com os dados informados.');
    }
    throw error;
  }
}
