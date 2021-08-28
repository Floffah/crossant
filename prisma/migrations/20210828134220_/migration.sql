-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SettingType" ADD VALUE 'CHANNEL';
ALTER TYPE "SettingType" ADD VALUE 'ROLE';
ALTER TYPE "SettingType" ADD VALUE 'USER';

-- AlterTable
ALTER TABLE "GuildSetting" ADD COLUMN     "isArray" BOOLEAN NOT NULL DEFAULT false;
