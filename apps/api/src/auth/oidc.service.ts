import {
  BadGatewayException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { AUTH_CONFIG, type AuthConfig } from '../config/auth.config';
import type { OidcIdentity } from './auth.types';

interface OidcDiscovery {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  end_session_endpoint?: string;
}

interface CorrelationData {
  state: string;
  nonce: string;
  verifier: string;
  returnTo: string;
  expiresAt: number;
}

interface KeycloakClaims extends JWTPayload {
  email?: string;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles?: string[] };
}

export interface AuthorizationRequest {
  url: string;
  correlationCookie: string;
}

export interface CallbackResult {
  identity: OidcIdentity;
  returnTo: string;
}

function randomBase64Url(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

function equalStrings(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function safeInternalPath(value: string | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/';
  try {
    const parsed = new URL(value, 'http://appstart.internal');
    if (parsed.origin !== 'http://appstart.internal') return '/';
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/';
  }
}

@Injectable()
export class OidcService {
  private discoveryPromise?: Promise<OidcDiscovery>;
  private jwksUri?: string;
  private jwks?: ReturnType<typeof createRemoteJWKSet>;

  constructor(@Inject(AUTH_CONFIG) private readonly config: AuthConfig) {}

  async createAuthorizationRequest(returnToInput?: string): Promise<AuthorizationRequest> {
    const discovery = await this.discovery();
    const verifier = randomBase64Url(64);
    const state = randomBase64Url();
    const nonce = randomBase64Url();
    const correlation: CorrelationData = {
      state,
      nonce,
      verifier,
      returnTo: safeInternalPath(returnToInput),
      expiresAt: Date.now() + this.config.correlationTtlMs,
    };
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    const url = new URL(discovery.authorization_endpoint);
    url.search = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackUrl,
      response_type: 'code',
      scope: 'openid profile email',
      state,
      nonce,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    }).toString();

    return { url: url.toString(), correlationCookie: this.encodeCorrelation(correlation) };
  }

  async consumeCallback(input: {
    code?: string;
    state?: string;
    correlationCookie?: string;
    providerError?: string;
  }): Promise<CallbackResult> {
    if (input.providerError) throw new UnauthorizedException('Não foi possível concluir a autenticação.');
    if (!input.code || !input.state || !input.correlationCookie) {
      throw new UnauthorizedException('Callback de autenticação inválido ou expirado.');
    }

    const correlation = this.decodeCorrelation(input.correlationCookie);
    if (correlation.expiresAt < Date.now() || !equalStrings(correlation.state, input.state)) {
      throw new UnauthorizedException('Callback de autenticação inválido ou expirado.');
    }

    const discovery = await this.discovery();
    const response = await this.fetchWithTimeout(discovery.token_endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: input.code,
        redirect_uri: this.config.callbackUrl,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code_verifier: correlation.verifier,
      }),
    });

    if (!response.ok) throw new BadGatewayException('O provedor de identidade rejeitou o callback.');
    const tokenResponse = (await response.json()) as { id_token?: unknown };
    if (typeof tokenResponse.id_token !== 'string') {
      throw new BadGatewayException('Resposta inválida do provedor de identidade.');
    }

    const jwks = this.remoteJwks(discovery.jwks_uri);
    let payload: KeycloakClaims;
    try {
      const verified = await jwtVerify<KeycloakClaims>(tokenResponse.id_token, jwks, {
        issuer: this.config.issuer,
        audience: this.config.clientId,
      });
      payload = verified.payload;
    } catch {
      throw new UnauthorizedException('Identidade retornada pelo provedor é inválida.');
    }

    if (typeof payload.nonce !== 'string' || !equalStrings(payload.nonce, correlation.nonce)) {
      throw new UnauthorizedException('Identidade retornada pelo provedor é inválida.');
    }
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      throw new UnauthorizedException('O provedor não retornou a identidade mínima necessária.');
    }

    const claimedName = payload.name
      ?? [payload.given_name, payload.family_name]
        .filter((part): part is string => typeof part === 'string')
        .join(' ');
    const displayName = claimedName || payload.preferred_username || payload.email;
    const roles = Array.isArray(payload.realm_access?.roles)
      ? payload.realm_access.roles.filter((role): role is string => typeof role === 'string')
      : [];

    return {
      identity: {
        subject: payload.sub,
        email: payload.email.trim().toLowerCase(),
        name: displayName,
        roles,
      },
      returnTo: correlation.returnTo,
    };
  }

  async loginWithCredentials(username: string, password: string): Promise<OidcIdentity> {
    const discovery = await this.discovery();
    const bodyParams = new URLSearchParams({
      grant_type: 'password',
      client_id: this.config.clientId,
      username: username.trim(),
      password,
      scope: 'openid profile email',
    });
    if (this.config.clientSecret) {
      bodyParams.set('client_secret', this.config.clientSecret);
    }

    const response = await this.fetchWithTimeout(discovery.token_endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: bodyParams,
    });

    if (!response.ok) {
      if (response.status === 400 || response.status === 401) {
        throw new UnauthorizedException('E-mail ou senha incorretos.');
      }
      throw new BadGatewayException('O provedor de autenticação rejeitou a solicitação de login.');
    }

    const tokenResponse = (await response.json()) as { id_token?: unknown; access_token?: unknown };
    if (typeof tokenResponse.id_token !== 'string') {
      throw new BadGatewayException('Resposta inválida do provedor de identidade.');
    }

    const jwks = this.remoteJwks(discovery.jwks_uri);
    let payload: KeycloakClaims;
    try {
      const verified = await jwtVerify<KeycloakClaims>(tokenResponse.id_token, jwks, {
        issuer: this.config.issuer,
        audience: this.config.clientId,
      });
      payload = verified.payload;
    } catch {
      throw new UnauthorizedException('Identidade retornada pelo provedor é inválida.');
    }

    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      throw new UnauthorizedException('O provedor não retornou a identidade mínima necessária.');
    }

    const claimedName = payload.name
      ?? [payload.given_name, payload.family_name]
        .filter((part): part is string => typeof part === 'string')
        .join(' ');
    const displayName = claimedName || payload.preferred_username || payload.email;
    const roles = Array.isArray(payload.realm_access?.roles)
      ? payload.realm_access.roles.filter((role): role is string => typeof role === 'string')
      : [];

    return {
      subject: payload.sub,
      email: payload.email.trim().toLowerCase(),
      name: displayName,
      roles,
    };
  }

  async federatedLogoutUrl(): Promise<string | undefined> {
    try {
      const endpoint = (await this.discovery()).end_session_endpoint;
      if (!endpoint) return undefined;
      const url = new URL(endpoint);
      url.searchParams.set('client_id', this.config.clientId);
      url.searchParams.set('post_logout_redirect_uri', this.config.webBaseUrl);
      return url.toString();
    } catch {
      return undefined;
    }
  }

  accountUrl(): string {
    return `${this.config.issuer}/account`;
  }

  private async discovery(): Promise<OidcDiscovery> {
    this.discoveryPromise ??= this.loadDiscovery().catch((error) => {
      this.discoveryPromise = undefined;
      throw error;
    });
    return this.discoveryPromise;
  }

  private async loadDiscovery(): Promise<OidcDiscovery> {
    const response = await this.fetchWithTimeout(`${this.config.issuer}/.well-known/openid-configuration`);
    if (!response.ok) throw new ServiceUnavailableException('Keycloak indisponível para discovery OIDC.');
    const value = (await response.json()) as Partial<OidcDiscovery>;
    if (value.issuer !== this.config.issuer) throw new ServiceUnavailableException('Issuer OIDC inesperado.');
    for (const key of ['authorization_endpoint', 'token_endpoint', 'jwks_uri'] as const) {
      if (typeof value[key] !== 'string') throw new ServiceUnavailableException(`Discovery OIDC sem ${key}.`);
      try {
        new URL(value[key]);
      } catch {
        throw new ServiceUnavailableException(`Discovery OIDC contém ${key} inválido.`);
      }
    }
    return value as OidcDiscovery;
  }

  private remoteJwks(uri: string): ReturnType<typeof createRemoteJWKSet> {
    if (!this.jwks || this.jwksUri !== uri) {
      this.jwksUri = uri;
      this.jwks = createRemoteJWKSet(new URL(uri), { timeoutDuration: 5_000 });
    }
    return this.jwks;
  }

  private encodeCorrelation(value: CorrelationData): string {
    const payload = Buffer.from(JSON.stringify(value)).toString('base64url');
    const signature = createHmac('sha256', this.config.clientSecret).update(payload).digest('base64url');
    return `${payload}.${signature}`;
  }

  private decodeCorrelation(value: string): CorrelationData {
    const [payload, signature, extra] = value.split('.');
    if (!payload || !signature || extra) throw new UnauthorizedException('Correlação OIDC inválida.');
    const expected = createHmac('sha256', this.config.clientSecret).update(payload).digest('base64url');
    if (!equalStrings(expected, signature)) throw new UnauthorizedException('Correlação OIDC inválida.');
    try {
      const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<CorrelationData>;
      if (
        typeof decoded.state !== 'string'
        || typeof decoded.nonce !== 'string'
        || typeof decoded.verifier !== 'string'
        || typeof decoded.returnTo !== 'string'
        || typeof decoded.expiresAt !== 'number'
      ) throw new Error('shape');
      return decoded as CorrelationData;
    } catch {
      throw new UnauthorizedException('Correlação OIDC inválida.');
    }
  }

  private async fetchWithTimeout(input: string, init?: RequestInit): Promise<Response> {
    try {
      return await fetch(input, { ...init, signal: AbortSignal.timeout(5_000) });
    } catch {
      throw new ServiceUnavailableException('Keycloak indisponível.');
    }
  }
}
