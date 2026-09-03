import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTaskDto,
  ListTasksQueryDto,
  PaginatedTasksResponseDto,
  TaskDto,
  TaskPriorityEnum,
  TaskStatusEnum,
  UpdateTaskDto,
} from './task.dto';

interface UserContext {
  id: string;
  role: string;
}

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateTaskDto): Promise<TaskDto> {
    if (dto.dueDate) {
      const due = new Date(dto.dueDate);
      if (isNaN(due.getTime())) {
        throw new BadRequestException('Data de entrega limite inválida.');
      }
      if (due < new Date(Date.now() - 60000)) {
        throw new BadRequestException('A data limite não pode ser anterior à data atual.');
      }
    }

    const created = await this.prisma.task.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        priority: (dto.priority as TaskPriorityEnum) || TaskPriorityEnum.MEDIUM,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return this.serializeTask(created);
  }

  async findAll(user: UserContext, query: ListTasksQueryDto): Promise<PaginatedTasksResponseDto> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    // Autorização: Usuários comuns veem apenas suas próprias tarefas; ADMIN pode ver todas
    if (user.role !== 'ADMIN') {
      where.ownerId = user.id;
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    const allowedSortFields = ['createdAt', 'dueDate', 'title', 'priority', 'status'];
    const sortBy = allowedSortFields.includes(query.sortBy || '') ? query.sortBy! : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, items] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      data: items.map((item) => this.serializeTask(item)),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  async findById(user: UserContext, id: string): Promise<TaskDto> {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada.');
    }

    if (user.role !== 'ADMIN' && task.ownerId !== user.id) {
      throw new ForbiddenException('Você não tem permissão para acessar esta tarefa.');
    }

    return this.serializeTask(task);
  }

  async update(user: UserContext, id: string, dto: UpdateTaskDto): Promise<TaskDto> {
    const existing = await this.prisma.task.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Tarefa não encontrada.');
    }

    if (user.role !== 'ADMIN' && existing.ownerId !== user.id) {
      throw new ForbiddenException('Você não tem permissão para modificar esta tarefa.');
    }

    // Regra de Negócio de Referência: Tarefas concluídas não podem ser alteradas sem reabrir
    const isReopening = dto.status && dto.status !== TaskStatusEnum.COMPLETED;
    const isAlreadyCompleted = existing.status === TaskStatusEnum.COMPLETED;
    const hasFieldChanges =
      (dto.title !== undefined && dto.title !== existing.title) ||
      (dto.description !== undefined && dto.description !== existing.description) ||
      (dto.priority !== undefined && dto.priority !== existing.priority) ||
      (dto.dueDate !== undefined);

    if (isAlreadyCompleted && !isReopening && hasFieldChanges) {
      throw new BadRequestException(
        'Tarefas com status COMPLETED não podem ter seus detalhes modificados sem antes serem reabertas (altere o status para PENDING ou IN_PROGRESS).',
      );
    }

    if (dto.dueDate) {
      const due = new Date(dto.dueDate);
      if (isNaN(due.getTime())) {
        throw new BadRequestException('Data de entrega limite inválida.');
      }
      if (due < new Date(Date.now() - 60000)) {
        throw new BadRequestException('A data limite não pode ser anterior à data atual.');
      }
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() || null } : {}),
        ...(dto.status !== undefined ? { status: dto.status as TaskStatusEnum } : {}),
        ...(dto.priority !== undefined ? { priority: dto.priority as TaskPriorityEnum } : {}),
        ...(dto.dueDate !== undefined ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null } : {}),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return this.serializeTask(updated);
  }

  async remove(user: UserContext, id: string): Promise<void> {
    const existing = await this.prisma.task.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Tarefa não encontrada.');
    }

    if (user.role !== 'ADMIN' && existing.ownerId !== user.id) {
      throw new ForbiddenException('Você não tem permissão para excluir esta tarefa.');
    }

    // Remoção lógica (Soft Delete)
    await this.prisma.task.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  private serializeTask(task: any): TaskDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status as TaskStatusEnum,
      priority: task.priority as TaskPriorityEnum,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      ownerId: task.ownerId,
      owner: task.owner
        ? {
            id: task.owner.id,
            name: task.owner.name,
            email: task.owner.email,
          }
        : undefined,
      createdAt: new Date(task.createdAt).toISOString(),
      updatedAt: new Date(task.updatedAt).toISOString(),
    };
  }
}
