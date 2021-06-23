/*
  Warnings:

  - Added the required column `boardId` to the `GuildBoardMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GuildBoardMessage" ADD COLUMN     "boardId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "GuildBoardMessage" ADD FOREIGN KEY ("boardId") REFERENCES "GuildBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
