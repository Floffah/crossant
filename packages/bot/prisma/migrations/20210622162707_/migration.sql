/*
  Warnings:

  - You are about to drop the column `count` on the `WordUse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WordUse" DROP COLUMN "count",
ADD COLUMN     "total" INTEGER NOT NULL DEFAULT 0;
