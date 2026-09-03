import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PaginationMetaDto, PaginationQueryDto } from '../common/dto/pagination.dto';

export enum TaskStatusEnum {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateTaskDto {
  @ApiProperty({ description: 'Título da tarefa', example: 'Configurar monitoramento de produção', minLength: 3, maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'O título deve ter no mínimo 3 caracteres.' })
  @MaxLength(150, { message: 'O título deve ter no máximo 150 caracteres.' })
  title!: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada da tarefa', example: 'Definir alertas para uso de CPU e memória.', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'A descrição deve ter no máximo 1000 caracteres.' })
  description?: string;

  @ApiPropertyOptional({ description: 'Prioridade da tarefa', enum: TaskPriorityEnum, default: TaskPriorityEnum.MEDIUM })
  @IsOptional()
  @IsEnum(TaskPriorityEnum, { message: 'Prioridade inválida.' })
  priority?: TaskPriorityEnum;

  @ApiPropertyOptional({ description: 'Data de entrega limite (ISO 8601)', example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString({}, { message: 'Data de entrega limite deve ser uma string ISO válida.' })
  dueDate?: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ description: 'Título da tarefa', example: 'Configurar monitoramento avançado', minLength: 3, maxLength: 150 })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'O título deve ter no mínimo 3 caracteres.' })
  @MaxLength(150, { message: 'O título deve ter no máximo 150 caracteres.' })
  title?: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada da tarefa', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'A descrição deve ter no máximo 1000 caracteres.' })
  description?: string;

  @ApiPropertyOptional({ description: 'Status atual da tarefa', enum: TaskStatusEnum })
  @IsOptional()
  @IsEnum(TaskStatusEnum, { message: 'Status inválido.' })
  status?: TaskStatusEnum;

  @ApiPropertyOptional({ description: 'Prioridade da tarefa', enum: TaskPriorityEnum })
  @IsOptional()
  @IsEnum(TaskPriorityEnum, { message: 'Prioridade inválida.' })
  priority?: TaskPriorityEnum;

  @ApiPropertyOptional({ description: 'Data de entrega limite (ISO 8601)' })
  @IsOptional()
  @IsDateString({}, { message: 'Data de entrega limite deve ser uma string ISO válida.' })
  dueDate?: string;
}

export class TaskOwnerDto {
  @ApiProperty({ description: 'Identificador único do proprietário', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ description: 'Nome do proprietário', example: 'Ada Lovelace' })
  name!: string;

  @ApiProperty({ description: 'E-mail do proprietário', example: 'ada@example.com' })
  email!: string;
}

export class TaskDto {
  @ApiProperty({ description: 'Identificador único da tarefa', example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  id!: string;

  @ApiProperty({ description: 'Título da tarefa', example: 'Configurar monitoramento' })
  title!: string;

  @ApiPropertyOptional({ description: 'Descrição da tarefa', nullable: true })
  description!: string | null;

  @ApiProperty({ description: 'Status da tarefa', enum: TaskStatusEnum, example: TaskStatusEnum.PENDING })
  status!: TaskStatusEnum;

  @ApiProperty({ description: 'Prioridade da tarefa', enum: TaskPriorityEnum, example: TaskPriorityEnum.MEDIUM })
  priority!: TaskPriorityEnum;

  @ApiPropertyOptional({ description: 'Data limite de entrega', nullable: true })
  dueDate!: string | null;

  @ApiProperty({ description: 'Identificador do usuário proprietário', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  ownerId!: string;

  @ApiPropertyOptional({ description: 'Dados resumidos do proprietário', type: () => TaskOwnerDto })
  owner?: TaskOwnerDto;

  @ApiProperty({ description: 'Data de criação' })
  createdAt!: string;

  @ApiProperty({ description: 'Data de última atualização' })
  updatedAt!: string;
}

export class PaginatedTasksResponseDto {
  @ApiProperty({ description: 'Lista de tarefas paginadas', type: [TaskDto] })
  data!: TaskDto[];

  @ApiProperty({ description: 'Metadados de paginação', type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class ListTasksQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtro por status', enum: TaskStatusEnum })
  @IsOptional()
  @IsEnum(TaskStatusEnum)
  status?: TaskStatusEnum;

  @ApiPropertyOptional({ description: 'Filtro por prioridade', enum: TaskPriorityEnum })
  @IsOptional()
  @IsEnum(TaskPriorityEnum)
  priority?: TaskPriorityEnum;

  @ApiPropertyOptional({ description: 'Campo de ordenação', enum: ['createdAt', 'dueDate', 'title', 'priority', 'status'], default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'dueDate' | 'title' | 'priority' | 'status' = 'createdAt';

  @ApiPropertyOptional({ description: 'Direção da ordenação', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
