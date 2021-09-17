-- CreateTable
CREATE TABLE "GuildVerification" (
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "captchaValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildVerification_pkey" PRIMARY KEY ("guildId","userId")
);

-- AddForeignKey
ALTER TABLE "GuildVerification" ADD CONSTRAINT "GuildVerification_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildVerification" ADD CONSTRAINT "GuildVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "DiscordUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
