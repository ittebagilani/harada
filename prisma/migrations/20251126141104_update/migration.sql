/*
  Warnings:

  - You are about to drop the column `planId` on the `Task` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[planId,order]` on the table `Pillar` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pillarId,order]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Pillar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Made the column `pillarId` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Pillar" DROP CONSTRAINT "Pillar_planId_fkey";

-- DropForeignKey
ALTER TABLE "Plan" DROP CONSTRAINT "Plan_userId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_pillarId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_planId_fkey";

-- AlterTable
ALTER TABLE "Pillar" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "planId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "pillarId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Answer_userId_questionId_key" ON "Answer"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Pillar_planId_order_key" ON "Pillar"("planId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_userId_key" ON "Plan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_pillarId_order_key" ON "Task"("pillarId", "order");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pillar" ADD CONSTRAINT "Pillar_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_pillarId_fkey" FOREIGN KEY ("pillarId") REFERENCES "Pillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
