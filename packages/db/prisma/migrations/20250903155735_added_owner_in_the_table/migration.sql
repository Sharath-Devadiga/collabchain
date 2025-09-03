/*
  Warnings:

  - Added the required column `hash` to the `Repo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Repo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Repo" ADD COLUMN     "hash" TEXT NOT NULL,
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Repo" ADD CONSTRAINT "Repo_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
