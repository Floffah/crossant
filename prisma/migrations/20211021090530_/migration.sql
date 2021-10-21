/*
  Warnings:

  - Added the required column `effector` to the `Experiment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExperimentEffector" AS ENUM ('USER', 'GUILD', 'BOTH');

-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN     "effector" "ExperimentEffector" NOT NULL;
