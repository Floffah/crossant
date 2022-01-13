/*
  Warnings:

  - You are about to drop the column `canManage` on the `WebUserInGuildCache` table. All the data in the column will be lost.
  - Added the required column `icon` to the `WebUserInGuildCache` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `WebUserInGuildCache` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permissions` to the `WebUserInGuildCache` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WebUserInGuildCache" DROP COLUMN "canManage",
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "permissions" INTEGER NOT NULL;
