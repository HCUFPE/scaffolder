import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser, Roles } from '../access/access.decorators';
import type { SafeUserProfile } from '../auth/auth.types';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';
import {
  CreateUserDto,
  ManagedUserDto,
  PaginatedUsersResponseDto,
  SetUserStatusDto,
  UpdateSelfUserDto,
  UpdateUserDto,
} from './user.dto';
import { UserService } from './user.service';

@ApiTags('users')
@ApiCookieAuth('appstart_session')
@Controller('users')
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar usuários com paginação e busca (ADMIN)' })
  @ApiResponse({ status: 200, type: PaginatedUsersResponseDto })
  @ApiResponse({ status: 401, type: ProblemDetailsDto })
  @ApiResponse({ status: 403, type: ProblemDetailsDto })
  list(@Query() query: PaginationQueryDto): Promise<PaginatedUsersResponseDto> {
    return this.users.list({
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      ...(query.search ? { search: query.search } : {}),
    });
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar usuário e provisionar perfil (ADMIN)' })
  @ApiResponse({ status: 201, type: ManagedUserDto })
  @ApiResponse({ status: 400, type: ProblemDetailsDto })
  @ApiResponse({ status: 401, type: ProblemDetailsDto })
  @ApiResponse({ status: 403, type: ProblemDetailsDto })
  @ApiResponse({ status: 409, type: ProblemDetailsDto })
  create(@Body() dto: CreateUserDto): Promise<ManagedUserDto> {
    return this.users.create(dto);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar dados permitidos do próprio perfil' })
  @ApiResponse({ status: 200, type: ManagedUserDto })
  @ApiResponse({ status: 400, type: ProblemDetailsDto })
  @ApiResponse({ status: 401, type: ProblemDetailsDto })
  updateMe(
    @CurrentUser() currentUser: SafeUserProfile,
    @Body() dto: UpdateSelfUserDto,
  ): Promise<ManagedUserDto> {
    return this.users.updateOwnName(currentUser.id, dto.name);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obter detalhes de um usuário por ID (ADMIN)' })
  @ApiResponse({ status: 200, type: ManagedUserDto })
  @ApiResponse({ status: 401, type: ProblemDetailsDto })
  @ApiResponse({ status: 403, type: ProblemDetailsDto })
  @ApiResponse({ status: 404, type: ProblemDetailsDto })
  getById(@Param('id') id: string): Promise<ManagedUserDto> {
    return this.users.getById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar usuário e sincronizar perfil (ADMIN)' })
  @ApiResponse({ status: 200, type: ManagedUserDto })
  @ApiResponse({ status: 400, type: ProblemDetailsDto })
  @ApiResponse({ status: 401, type: ProblemDetailsDto })
  @ApiResponse({ status: 403, type: ProblemDetailsDto })
  @ApiResponse({ status: 404, type: ProblemDetailsDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<ManagedUserDto> {
    return this.users.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: 'Ativar ou desativar usuário (ADMIN)' })
  @ApiResponse({ status: 200, type: ManagedUserDto })
  @ApiResponse({ status: 400, type: ProblemDetailsDto })
  @ApiResponse({ status: 401, type: ProblemDetailsDto })
  @ApiResponse({ status: 403, type: ProblemDetailsDto })
  @ApiResponse({ status: 404, type: ProblemDetailsDto })
  setStatus(
    @Param('id') id: string,
    @Body() dto: SetUserStatusDto,
  ): Promise<ManagedUserDto> {
    return this.users.setActive(id, dto.isActive);
  }
}
