/*
  Warnings:

  - You are about to drop the column `order` on the `Pillar` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Pillar_planId_order_key";

-- AlterTable
ALTER TABLE "Pillar" DROP COLUMN "order";
