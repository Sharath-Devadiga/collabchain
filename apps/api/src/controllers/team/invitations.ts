import Elysia from "elysia";
import { authPlugin } from "../../lib/plugin";
import { prisma } from "@repo/db";
import { customAlphabet } from "nanoid";
import { joinWithInviteSchema } from "../../schemas/team";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

export const invitationsHandler = new Elysia({ prefix: "/invitations" })
  .use(authPlugin)
  .post("/create/:teamId", async ({ params, user, set }) => {
    const { teamId } = params;
    const teamLeaderId = user.id;

    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      set.status = 404;
      return { message: "Team not found." };
    }

    if (team.createdById !== teamLeaderId) {
      set.status = 403;
      return { message: "You are not authorized to create invites for this team." };
    }

    const inviteCode = nanoid();
    const invitation = await prisma.teamInvitation.create({
      data: {
        code: inviteCode,
        teamId: teamId
      }
    });

    return {
      message: "Invitation code created successfully.",
      data: {
        inviteCode: invitation.code
      }
    };
  })

  .post("/join", async ({ body, user, set }) => {
    const { inviteCode } = body;
    const userId = user.id;

    const invitation = await prisma.teamInvitation.findUnique({
      where: { code: inviteCode },
      include: {
        team: {
          include: { members: true }
        }
      }
    });

    if (!invitation) {
      set.status = 404;
      return { message: "Invalid invitation code." };
    }

    const team = invitation.team;

    const isMember = team.createdById === userId || team.members.some(member => member.id === userId);
    if (isMember) {
      set.status = 400;
      return { message: "You are already a member of this team." };
    }

    await prisma.team.update({
      where: { id: team.id },
      data: {
        members: {
          connect: { id: userId }
        }
      }
    });
    
    await prisma.teamInvitation.delete({
        where: { id: invitation.id }
    });

    return { message: `Successfully joined team: ${team.title}` };
  }, {
    body: joinWithInviteSchema
  });
