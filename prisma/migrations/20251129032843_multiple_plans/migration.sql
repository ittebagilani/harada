-- DropIndex
DROP INDEX "Plan_userId_key";

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Pillar_planId_idx" ON "Pillar"("planId");

-- CreateIndex
CREATE INDEX "Plan_userId_idx" ON "Plan"("userId");

-- CreateIndex
CREATE INDEX "Plan_userId_isActive_idx" ON "Plan"("userId", "isActive");
