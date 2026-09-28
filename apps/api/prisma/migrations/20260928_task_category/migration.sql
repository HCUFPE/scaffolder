-- Migration: 20260928_task_category
-- Description: Adiciona categoria às tarefas

-- Consulta 001: Criação do tipo enum de categoria
CREATE TYPE "TaskCategory" AS ENUM ('WORK', 'PERSONAL', 'STUDY', 'HEALTH', 'OTHER');

-- Consulta 002: Nova coluna (default OTHER preserva tarefas já existentes)
ALTER TABLE "tasks" ADD COLUMN "category" "TaskCategory" NOT NULL DEFAULT 'OTHER';

-- Consulta 003: Índice para filtro por categoria
CREATE INDEX "tasks_category_idx" ON "tasks"("category");
