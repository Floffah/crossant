/*
  Warnings:

  - You are about to drop the column `isArray` on the `GuildSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GuildSetting" DROP COLUMN "isArray",
ADD COLUMN     "arrayType" BOOLEAN NOT NULL DEFAULT false;
