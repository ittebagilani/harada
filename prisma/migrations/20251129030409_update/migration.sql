/*
  Warnings:

  - You are about to drop the column `answer` on the `Answer` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Answer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "answer",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "value" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Answer_userId_idx" ON "Answer"("userId");
