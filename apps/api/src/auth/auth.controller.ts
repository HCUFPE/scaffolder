import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentSession, CurrentUser, Public } from '../access/access.decorators';
import { AUTH_CONFIG, type AuthConfig } from '../config/auth.config';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';
import {
  assertTrustedOrigin,
  clearCorrelationCookieOptions,
  clearSessionCookieOptions,
  correlationCookieOptions,
  readCookie,
  sessionCookieOptions,
} from './auth.cookies';
import { AuthMeResponseDto, LoginRequestDto } from './auth.dto';
import { AuthService } from './auth.service';
import type { ResolvedSession, SafeUserProfile } from './auth.types';
import { OidcService } from './oidc.service';
import { SessionService } from './session.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly oidc: OidcService,
    private readonly sessions: SessionService,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Autenticar com credenciais de forma direta (inicia sessão segura)' })
  @ApiResponse({ status: 200, type: AuthMeResponseDto, description: 'Autenticação concluída e sessão local criada' })
  @ApiResponse({ status: 400, type: ProblemDetailsDto, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, type: ProblemDetailsDto, description: 'Credenciais incorretas' })
  async directLogin(
    @Body() credentials: LoginRequestDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthMeResponseDto> {
    this.checkOrigin(request);
    const identity = await this.oidc.loginWithCredentials(credentials.username, credentials.password);
    const login = await this.auth.completeLogin(identity);
    response.cookie(this.config.sessionCookieName, login.token, sessionCookieOptions(this.config));
    return { user: login.user };
  }

  @Public()
  @Get('login')
  @ApiOperation({ summary: 'Iniciar autenticação OIDC (redireciona para o provedor)' })
  @ApiQuery({ name: 'returnTo', required: false, description: 'Caminho seguro de retorno após login' })
  @ApiResponse({ status: 302, description: 'Redirecionamento para tela de login do provedor' })
  async login(@Query('returnTo') returnTo: string | undefined, @Res() response: Response): Promise<void> {
    const authorization = await this.oidc.createAuthorizationRequest(returnTo);
    response.cookie(
      this.config.correlationCookieName,
      authorization.correlationCookie,
      correlationCookieOptions(this.config),
    );
    response.redirect(302, authorization.url);
  }

  @Public()
  @Get('callback')
  @ApiOperation({ summary: 'Receber callback OIDC e criar sessão local em cookie' })
  @ApiQuery({ name: 'code', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'error', required: false })
  @ApiResponse({ status: 303, description: 'Redirecionamento para a rota solicitada no frontend' })
  @ApiResponse({ status: 400, type: ProblemDetailsDto })
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') providerError: string | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const correlationCookie = readCookie(request, this.config.correlationCookieName);
    response.clearCookie(this.config.correlationCookieName, clearCorrelationCookieOptions(this.config));

    const callback = await this.oidc.consumeCallback({ code, state, providerError, correlationCookie });
    const login = await this.auth.completeLogin(callback.identity);
    response.cookie(this.config.sessionCookieName, login.token, sessionCookieOptions(this.config));
    response.redirect(303, new URL(callback.returnTo, `${this.config.webBaseUrl}/`).toString());
  }

  @Get('me')
  @ApiCookieAuth('appstart_session')
  @ApiOperation({ summary: 'Consultar perfil do usuário autenticado atual' })
  @ApiResponse({ status: 200, type: AuthMeResponseDto })
  @ApiResponse({ status: 401, type: ProblemDetailsDto })
  me(@CurrentUser() user: SafeUserProfile): AuthMeResponseDto {
    return { user };
  }

  @Post('logout')
  @HttpCode(303)
  @ApiCookieAuth('appstart_session')
  @ApiOperation({ summary: 'Encerrar sessão atual e executar logout federado' })
  @ApiResponse({ status: 303, description: 'Redirecionamento para logout federado ou aplicação' })
  @ApiResponse({ status: 401, type: ProblemDetailsDto })
  @ApiResponse({ status: 403, type: ProblemDetailsDto })
  async logout(
    @CurrentSession() _session: ResolvedSession,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    this.checkOrigin(request);
    await this.sessions.revokeCurrent(readCookie(request, this.config.sessionCookieName)!);
    response.clearCookie(this.config.sessionCookieName, clearSessionCookieOptions(this.config));
    const federatedUrl = await this.oidc.federatedLogoutUrl();
    response.redirect(303, federatedUrl ?? this.config.webBaseUrl);
  }

  @Post('logout-all')
  @HttpCode(204)
  @ApiCookieAuth('appstart_session')
  @ApiOperation({ summary: 'Encerrar todas as sessões locais ativas do usuário' })
  @ApiResponse({ status: 204, description: 'Todas as sessões encerradas com sucesso' })
  @ApiResponse({ status: 401, type: ProblemDetailsDto })
  @ApiResponse({ status: 403, type: ProblemDetailsDto })
  async logoutAll(
    @CurrentSession() session: ResolvedSession,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    this.checkOrigin(request);
    await this.sessions.revokeAll(session.userProfileId);
    response.clearCookie(this.config.sessionCookieName, clearSessionCookieOptions(this.config));
    response.status(204).send();
  }

  @Get('account')
  @ApiCookieAuth('appstart_session')
  @ApiOperation({ summary: 'Redirecionar para gerenciamento central de conta' })
  @ApiResponse({ status: 302, description: 'Redirecionamento para painel de gerenciamento' })
  account(@Res() response: Response): void {
    response.redirect(302, this.oidc.accountUrl());
  }

  private checkOrigin(request: Request): void {
    try {
      assertTrustedOrigin(request, this.config);
    } catch {
      throw new ForbiddenException('Origem da requisição não permitida.');
    }
  }
}
