/*
  Warnings:

  - Made the column `messageId` on table `GuildBoardMessage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `channelId` on table `GuildBoardMessage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GuildBoardMessage" ALTER COLUMN "messageId" SET NOT NULL,
ALTER COLUMN "channelId" SET NOT NULL;
