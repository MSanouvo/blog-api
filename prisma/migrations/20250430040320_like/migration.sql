/*
  Warnings:

  - You are about to alter the column `title` on the `Articles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "Articles" ALTER COLUMN "title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "total_likes" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Comments" ADD COLUMN     "total_likes" INTEGER NOT NULL DEFAULT 0;
