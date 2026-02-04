/*
  Warnings:

  - You are about to drop the column `name` on the `enterprises` table. All the data in the column will be lost.
  - Added the required column `corporate_reason` to the `enterprises` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "enterprises" DROP COLUMN "name",
ADD COLUMN     "corporate_reason" TEXT NOT NULL;
