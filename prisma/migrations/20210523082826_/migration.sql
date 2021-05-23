-- CreateEnum
CREATE TYPE "ListMode" AS ENUM ('Blacklist', 'Whitelist');

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "channelListMode" "ListMode" NOT NULL,
    "channelList" TEXT[],

    PRIMARY KEY ("id")
);
