-- CreateEnum
CREATE TYPE "ComponentReason" AS ENUM ('FORM', 'QUESTION');

-- CreateTable
CREATE TABLE "Component" (
    "id" SERIAL NOT NULL,
    "channelId" TEXT NOT NULL,
    "reason" "ComponentReason" NOT NULL,

    PRIMARY KEY ("id","channelId")
);
