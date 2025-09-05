/*
  Warnings:

  - You are about to drop the column `comment` on the `Repo` table. All the data in the column will be lost.
  - You are about to drop the column `hash` on the `Repo` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Repo` table. All the data in the column will be lost.
  - Added the required column `name` to the `Repo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Repo" DROP COLUMN "comment",
DROP COLUMN "hash",
DROP COLUMN "rating",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Commit" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "githubCommitHash" TEXT NOT NULL,
    "repoHash" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "author" TEXT NOT NULL,

    CONSTRAINT "Commit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Commit_githubCommitHash_key" ON "public"."Commit"("githubCommitHash");

-- AddForeignKey
ALTER TABLE "public"."Commit" ADD CONSTRAINT "Commit_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "public"."Repo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
