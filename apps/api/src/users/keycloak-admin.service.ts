import {
  BadGatewayException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { UserRole } from '@prisma/client';
import { AUTH_CONFIG, type AuthConfig } from '../config/auth.config';

interface KeycloakUserRepresentation {
  id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  emailVerified?: boolean;
  requiredActions?: string[];
  attributes?: Record<string, string[]>;
}

interface KeycloakRoleRepresentation {
  id: string;
  name: string;
  description?: string;
  composite?: boolean;
  clientRole?: boolean;
  containerId?: string;
}

export interface ProviderUserState {
  user: KeycloakUserRepresentation;
  applicationRole: UserRole;
}

export interface ProviderUserInput {
  name: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class KeycloakAdminService {
  private accessToken?: { value: string; expiresAt: number };

  constructor(@Inject(AUTH_CONFIG) private readonly config: AuthConfig) {}

  async createUser(input: ProviderUserInput): Promise<string> {
    const response = await this.request('/users', {
      method: 'POST',
      body: JSON.stringify({
        username: input.email,
        email: input.email,
        firstName: input.name,
        lastName: '',
        enabled: true,
        emailVerified: false,
        requiredActions: ['UPDATE_PASSWORD'],
      }),
    }, [201]);

    const location = response.headers.get('location');
    const userId = location?.split('/').filter(Boolean).at(-1);
    if (!userId) throw new BadGatewayException('Keycloak não retornou o identificador do usuário criado.');

    try {
      await this.setApplicationRole(userId, input.role);
      return userId;
    } catch (error) {
      await this.deleteUser(userId).catch(() => undefined);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    await this.request(`/users/${encodeURIComponent(userId)}`, { method: 'DELETE' }, [204, 404]);
  }

  async getUserState(userId: string): Promise<ProviderUserState> {
    const user = await this.json<KeycloakUserRepresentation>(`/users/${encodeURIComponent(userId)}`);
    const roles = await this.json<KeycloakRoleRepresentation[]>(
      `/users/${encodeURIComponent(userId)}/role-mappings/realm`,
    );
    return {
      user,
      applicationRole: roles.some((role) => role.name === 'admin') ? 'ADMIN' : 'USER',
    };
  }

  async updateUser(userId: string, input: Partial<ProviderUserInput>): Promise<ProviderUserState> {
    const previous = await this.getUserState(userId);
    const desiredRole = input.role ?? previous.applicationRole;
    try {
      if (input.name !== undefined || input.email !== undefined) {
        const email = input.email ?? previous.user.email ?? previous.user.username;
        if (!email) throw new BadGatewayException('Identidade Keycloak sem e-mail utilizável.');
        await this.putUser(userId, {
          ...previous.user,
          username: email,
          email,
          firstName: input.name ?? previous.user.firstName ?? '',
          lastName: input.name !== undefined ? '' : previous.user.lastName,
        });
      }
      if (desiredRole !== previous.applicationRole) await this.setApplicationRole(userId, desiredRole);
      return previous;
    } catch (error) {
      await this.restoreUser(previous).catch(() => undefined);
      throw error;
    }
  }

  async setEnabled(userId: string, enabled: boolean): Promise<ProviderUserState> {
    const previous = await this.getUserState(userId);
    try {
      await this.putUser(userId, { ...previous.user, enabled });
      return previous;
    } catch (error) {
      await this.restoreUser(previous).catch(() => undefined);
      throw error;
    }
  }

  async restoreUser(state: ProviderUserState): Promise<void> {
    await this.putUser(state.user.id, state.user);
    await this.setApplicationRole(state.user.id, state.applicationRole);
  }

  private async putUser(userId: string, user: KeycloakUserRepresentation): Promise<void> {
    await this.request(`/users/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    }, [204]);
  }

  private async setApplicationRole(userId: string, role: UserRole): Promise<void> {
    const mappingPath = `/users/${encodeURIComponent(userId)}/role-mappings/realm`;
    const assigned = await this.json<KeycloakRoleRepresentation[]>(mappingPath);
    const applicationRoles = assigned.filter((item) => item.name === 'admin' || item.name === 'user');
    if (applicationRoles.length > 0) {
      await this.request(mappingPath, {
        method: 'DELETE',
        body: JSON.stringify(applicationRoles),
      }, [204]);
    }

    const roleName = role === 'ADMIN' ? 'admin' : 'user';
    const desired = await this.json<KeycloakRoleRepresentation>(`/roles/${encodeURIComponent(roleName)}`);
    await this.request(mappingPath, {
      method: 'POST',
      body: JSON.stringify([desired]),
    }, [204]);
  }

  private async json<T>(path: string): Promise<T> {
    const response = await this.request(path, { method: 'GET' }, [200]);
    return response.json() as Promise<T>;
  }

  private async request(path: string, init: RequestInit, expectedStatuses: number[]): Promise<Response> {
    const token = await this.token();
    let response: Response;
    try {
      response = await fetch(
        `${this.config.keycloakBaseUrl}/admin/realms/${encodeURIComponent(this.config.realm)}${path}`,
        {
          ...init,
          signal: AbortSignal.timeout(5_000),
          headers: {
            authorization: `Bearer ${token}`,
            'content-type': 'application/json',
            ...init.headers,
          },
        },
      );
    } catch {
      throw new ServiceUnavailableException('Keycloak Admin API indisponível.');
    }

    if (expectedStatuses.includes(response.status)) return response;
    if (response.status === 401) {
      this.accessToken = undefined;
      throw new ServiceUnavailableException('Credenciais da integração administrativa do Keycloak foram rejeitadas.');
    }
    if (response.status === 404) throw new NotFoundException('Identidade não encontrada no Keycloak.');
    if (response.status === 409) throw new ConflictException('Já existe uma identidade com os dados informados.');
    throw new BadGatewayException(`Keycloak Admin API rejeitou a operação (${response.status}).`);
  }

  private async token(): Promise<string> {
    if (this.accessToken && this.accessToken.expiresAt > Date.now() + 30_000) return this.accessToken.value;

    let response: Response;
    try {
      response = await fetch(`${this.config.issuer}/protocol/openid-connect/token`, {
        method: 'POST',
        signal: AbortSignal.timeout(5_000),
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.adminClientId,
          client_secret: this.config.adminClientSecret,
        }),
      });
    } catch {
      throw new ServiceUnavailableException('Keycloak indisponível para autenticação administrativa.');
    }
    if (!response.ok) throw new ServiceUnavailableException('Não foi possível autenticar a integração administrativa.');

    const value = await response.json() as { access_token?: unknown; expires_in?: unknown };
    if (typeof value.access_token !== 'string') {
      throw new BadGatewayException('Keycloak retornou token administrativo inválido.');
    }
    const expiresIn = typeof value.expires_in === 'number' ? value.expires_in : 60;
    this.accessToken = { value: value.access_token, expiresAt: Date.now() + expiresIn * 1000 };
    return value.access_token;
  }
}
