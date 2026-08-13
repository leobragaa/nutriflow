/*
  Warnings:

  - You are about to drop the column `crn` on the `Nutricionista` table. All the data in the column will be lost.
  - Added the required column `cro` to the `Nutricionista` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Nutricionista" DROP COLUMN "crn",
ADD COLUMN     "cro" TEXT NOT NULL;
