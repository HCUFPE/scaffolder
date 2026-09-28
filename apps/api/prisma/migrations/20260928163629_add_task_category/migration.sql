-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('WORK', 'PERSONAL', 'STUDY', 'HEALTH', 'OTHER');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "category" "TaskCategory" NOT NULL DEFAULT 'OTHER';

-- CreateIndex
CREATE INDEX "tasks_category_idx" ON "tasks"("category");
