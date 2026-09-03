-- Migration: 20260831_reference_tasks_module
-- Description: Módulo de referência Tasks com enum de status/prioridade, ownership e soft delete (remoção lógica)

-- Consulta 001: Criação dos tipos enum para status e prioridade
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Consulta 002: Criação da tabela tasks
CREATE TABLE "tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "ownerId" UUID NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- Consulta 003: Criação de índices para consultas rápidas por dono, status e soft delete
CREATE INDEX "tasks_ownerId_idx" ON "tasks"("ownerId");
CREATE INDEX "tasks_deletedAt_idx" ON "tasks"("deletedAt");
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- Consulta 004: Foreign key relacionando ao perfil do usuário
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
