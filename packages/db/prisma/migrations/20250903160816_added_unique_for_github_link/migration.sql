/*
  Warnings:

  - A unique constraint covering the columns `[githubLink]` on the table `Repo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Repo_githubLink_key" ON "public"."Repo"("githubLink");
