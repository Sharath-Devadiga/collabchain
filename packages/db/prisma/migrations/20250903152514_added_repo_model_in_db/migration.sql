-- CreateTable
CREATE TABLE "public"."Repo" (
    "id" TEXT NOT NULL,
    "rating" INTEGER,
    "comment" TEXT NOT NULL DEFAULT 'Not a lot of changes, or duplicate push',
    "githubLink" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,

    CONSTRAINT "Repo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repo_chatRoomId_key" ON "public"."Repo"("chatRoomId");

-- AddForeignKey
ALTER TABLE "public"."Repo" ADD CONSTRAINT "Repo_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "public"."ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
