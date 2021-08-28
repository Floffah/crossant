-- CreateEnum
CREATE TYPE "SettingType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN');

-- CreateTable
CREATE TABLE "GuildSetting" (
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SettingType" NOT NULL,
    "value" JSONB NOT NULL,

    PRIMARY KEY ("guildId","name")
);

-- AddForeignKey
ALTER TABLE "GuildSetting" ADD FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
