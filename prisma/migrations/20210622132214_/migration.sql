-- AlterTable
ALTER TABLE "WordUse" ADD COLUMN     "count" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "isCurse" SET DEFAULT false;