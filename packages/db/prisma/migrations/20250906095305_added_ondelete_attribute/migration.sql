-- DropForeignKey
ALTER TABLE "public"."ChatRoom" DROP CONSTRAINT "ChatRoom_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeamInvitation" DROP CONSTRAINT "TeamInvitation_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeamJoinRequest" DROP CONSTRAINT "TeamJoinRequest_teamId_fkey";

-- AddForeignKey
ALTER TABLE "public"."TeamJoinRequest" ADD CONSTRAINT "TeamJoinRequest_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamInvitation" ADD CONSTRAINT "TeamInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatRoom" ADD CONSTRAINT "ChatRoom_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
