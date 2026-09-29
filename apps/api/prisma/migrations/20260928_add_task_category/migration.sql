-- Migration: 20260928_add_task_category
-- Adiciona uma categoria opcional às tarefas.

ALTER TABLE "tasks" ADD COLUMN "category" TEXT;