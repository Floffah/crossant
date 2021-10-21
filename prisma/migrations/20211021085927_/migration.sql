-- CreateEnum
CREATE TYPE "ExperimentStageType" AS ENUM ('CANARY', 'BETA', 'RC');

-- CreateTable
CREATE TABLE "Experiment" (
    "name" TEXT NOT NULL,
    "stage" "ExperimentStageType" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "_ExperimentToGuild" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DiscordUserToExperiment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Experiment_name_key" ON "Experiment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ExperimentToGuild_AB_unique" ON "_ExperimentToGuild"("A", "B");

-- CreateIndex
CREATE INDEX "_ExperimentToGuild_B_index" ON "_ExperimentToGuild"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DiscordUserToExperiment_AB_unique" ON "_DiscordUserToExperiment"("A", "B");

-- CreateIndex
CREATE INDEX "_DiscordUserToExperiment_B_index" ON "_DiscordUserToExperiment"("B");

-- AddForeignKey
ALTER TABLE "_ExperimentToGuild" ADD FOREIGN KEY ("A") REFERENCES "Experiment"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExperimentToGuild" ADD FOREIGN KEY ("B") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscordUserToExperiment" ADD FOREIGN KEY ("A") REFERENCES "DiscordUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscordUserToExperiment" ADD FOREIGN KEY ("B") REFERENCES "Experiment"("name") ON DELETE CASCADE ON UPDATE CASCADE;
