import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../access/access.decorators';
import type { SafeUserProfile } from '../auth/auth.types';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';
import {
  CreateTaskDto,
  ListTasksQueryDto,
  PaginatedTasksResponseDto,
  TaskDto,
  UpdateTaskDto,
} from './task.dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar nova tarefa',
    description: 'Cria uma nova tarefa associando-a ao usuário autenticado como proprietário.',
  })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso', type: TaskDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou data limite no passado', type: ProblemDetailsDto })
  @ApiResponse({ status: 401, description: 'Não autenticado', type: ProblemDetailsDto })
  async create(
    @CurrentUser() user: SafeUserProfile,
    @Body() dto: CreateTaskDto,
  ): Promise<TaskDto> {
    return this.tasksService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar tarefas paginadas',
    description: 'Lista tarefas com paginação, busca por texto, filtro por status/prioridade e ordenação.',
  })
  @ApiResponse({ status: 200, description: 'Lista paginada de tarefas', type: PaginatedTasksResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado', type: ProblemDetailsDto })
  async findAll(
    @CurrentUser() user: SafeUserProfile,
    @Query() query: ListTasksQueryDto,
  ): Promise<PaginatedTasksResponseDto> {
    return this.tasksService.findAll(user, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter detalhes de uma tarefa',
    description: 'Retorna os detalhes de uma tarefa específica pertencente ao usuário (ou qualquer tarefa para ADMIN).',
  })
  @ApiResponse({ status: 200, description: 'Dados da tarefa', type: TaskDto })
  @ApiResponse({ status: 401, description: 'Não autenticado', type: ProblemDetailsDto })
  @ApiResponse({ status: 403, description: 'Acesso negado (tarefa de outro proprietário)', type: ProblemDetailsDto })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada', type: ProblemDetailsDto })
  async findById(
    @CurrentUser() user: SafeUserProfile,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TaskDto> {
    return this.tasksService.findById(user, id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar tarefa',
    description: 'Atualiza os dados ou status de uma tarefa respeitando as regras de negócio e ownership.',
  })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada com sucesso', type: TaskDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou alteração inválida em tarefa concluída', type: ProblemDetailsDto })
  @ApiResponse({ status: 401, description: 'Não autenticado', type: ProblemDetailsDto })
  @ApiResponse({ status: 403, description: 'Acesso negado', type: ProblemDetailsDto })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada', type: ProblemDetailsDto })
  async update(
    @CurrentUser() user: SafeUserProfile,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskDto> {
    return this.tasksService.update(user, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir tarefa (remoção lógica)',
    description: 'Realiza a remoção lógica (soft delete) da tarefa.',
  })
  @ApiResponse({ status: 204, description: 'Tarefa excluída com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado', type: ProblemDetailsDto })
  @ApiResponse({ status: 403, description: 'Acesso negado', type: ProblemDetailsDto })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada', type: ProblemDetailsDto })
  async remove(
    @CurrentUser() user: SafeUserProfile,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.tasksService.remove(user, id);
  }
}
