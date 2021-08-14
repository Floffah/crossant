-- CreateEnum
CREATE TYPE "ListMode" AS ENUM ('Blacklist', 'Whitelist');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "optWordCount" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "channelListMode" "ListMode" NOT NULL,
    "channelList" TEXT[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildBoard" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildBoardMessage" (
    "reactedMessageId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "reactedChannelId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "boardId" INTEGER NOT NULL,

    PRIMARY KEY ("reactedMessageId","reactedChannelId")
);

-- AddForeignKey
ALTER TABLE "GuildBoard" ADD FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildBoardMessage" ADD FOREIGN KEY ("boardId") REFERENCES "GuildBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
