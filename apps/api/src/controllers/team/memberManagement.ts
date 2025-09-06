import Elysia from "elysia";
import { authPlugin } from "../../lib/plugin";
import { prisma } from "@repo/db";
import { leaveTeamSchema, removeMemberSchema } from "../../schemas/team";

export const memberManagementHandler = new Elysia({ prefix: "/member" })
  .use(authPlugin)
  .post("/remove", async ({ body, user, set }) => {
    const { teamId, memberId } = body;
    const leaderId = user.id;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      set.status = 404;
      return { message: "Team not found." };
    }

    if (team.createdById !== leaderId) {
      set.status = 403;
      return { message: "You are not authorized to remove members from this team." };
    }

    if (team.createdById === memberId) {
        set.status = 400;
        return { message: "Team leader cannot remove themselves." };
    }

    await prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          disconnect: { id: memberId },
        },
      },
    });

    return { message: "Member removed from the team successfully." };
  }, {
    body: removeMemberSchema
  })

  .post("/leave", async ({ body, user, set }) => {
    const { teamId } = body;
    const memberId = user.id;

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { members: { select: { id: true }} } 
    });

    if (!team) {
        set.status = 404;
        return { message: "Team not found." };
    }

    if (team.createdById === memberId) {
        set.status = 400;
        return { message: "Team creator cannot leave the team. Please delete the team instead." };
    }
    
    const isMember = team.members.some(member => member.id === memberId);
    if (!isMember) {
        set.status = 400;
        return { message: "You are not a member of this team." };
    }

    await prisma.team.update({
        where: { id: teamId },
        data: {
            members: {
                disconnect: { id: memberId }
            }
        }
    });

    return { message: "You have successfully left the team." };
  }, {
    body: leaveTeamSchema
  });
