/*
  Warnings:

  - Added the required column `channelId` to the `GuildBoard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emoji` to the `GuildBoard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GuildBoard" ADD COLUMN     "channelId" TEXT NOT NULL,
ADD COLUMN     "emoji" TEXT NOT NULL;
