-- CreateEnum
CREATE TYPE "PlatformType" AS ENUM ('Twitch');

-- CreateTable
CREATE TABLE "GuildIntegration" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "platform" "PlatformType" NOT NULL,
    "platformName" TEXT NOT NULL,
    "filterRegex" TEXT,
    "filterFlags" TEXT,

    CONSTRAINT "GuildIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildIntegration_id_guildId_key" ON "GuildIntegration"("id", "guildId");

-- AddForeignKey
ALTER TABLE "GuildIntegration" ADD CONSTRAINT "GuildIntegration_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
