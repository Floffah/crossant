-- CreateTable
CREATE TABLE "GuildBoardMessage" (
    "reactedMessageId" TEXT NOT NULL,
    "messageId" TEXT,
    "reactedChannelId" TEXT NOT NULL,
    "channelId" TEXT,

    PRIMARY KEY ("reactedMessageId","reactedChannelId")
);
