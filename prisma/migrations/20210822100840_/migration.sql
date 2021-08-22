/*
  Warnings:

  - You are about to drop the column `pingMessage` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "pingMessage";

-- CreateTable
CREATE TABLE "PingMessage" (
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    PRIMARY KEY ("userId","guildId")
);

-- AddForeignKey
ALTER TABLE "PingMessage" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PingMessage" ADD FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
