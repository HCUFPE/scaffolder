-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('WORK', 'STUDY', 'PERSONAL', 'OTHER');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "category" "TaskCategory" NOT NULL DEFAULT 'OTHER';
