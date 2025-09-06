import Elysia from "elysia";
import { authPlugin } from "../../lib/plugin";
import { prisma } from "@repo/db";
import { manageJoinRequestSchema, requestToJoinSchema } from "../../schemas/team";
import { RequestStatus, TeamVisibility } from "../../../../../packages/db/generated/prisma";

export const joinRequestsHandler = new Elysia({ prefix: "/join-requests" })
  .use(authPlugin)
  .post("/request", async ({ body, user, set }) => {
    const { teamId } = body;
    const requesterId = user.id;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true }
    });

    if (!team || team.visibility !== TeamVisibility.PUBLIC) {
      set.status = 404;
      return { message: "Public team not found." };
    }

    const isMember = team.createdById === requesterId || team.members.some(member => member.id === requesterId);
    if (isMember) {
        set.status = 400;
        return { message: "You are already a member of this team." };
    }
    
    const existingRequest = await prisma.teamJoinRequest.findFirst({
        where: {
            teamId: teamId,
            requesterId: requesterId,
            status: RequestStatus.PENDING
        }
    });

    if (existingRequest) {
        set.status = 400;
        return { message: "You have already sent a join request to this team." };
    }

    const joinRequest = await prisma.teamJoinRequest.create({
      data: {
        teamId,
        requesterId,
        status: RequestStatus.PENDING
      }
    });

    return { message: "Join request sent successfully.", data: joinRequest };
  }, {
    body: requestToJoinSchema
  })

  .post("/manage", async ({ body, user, set }) => {
    const { joinRequestId, status } = body;
    const teamLeaderId = user.id;

    const joinRequest = await prisma.teamJoinRequest.findUnique({
        where: { id: joinRequestId },
        include: { team: true }
    });

    if (!joinRequest || joinRequest.status !== RequestStatus.PENDING) {
        set.status = 404;
        return { message: "Pending join request not found." };
    }
    
    if (joinRequest.team.createdById !== teamLeaderId) {
        set.status = 403;
        return { message: "You are not authorized to manage this request." };
    }

    if (status === RequestStatus.ACCEPTED) {
        const [, updatedRequest] = await prisma.$transaction([
            prisma.team.update({
                where: { id: joinRequest.teamId },
                data: {
                    members: {
                        connect: { id: joinRequest.requesterId }
                    }
                }
            }),
            prisma.teamJoinRequest.update({
                where: { id: joinRequestId },
                data: { status: RequestStatus.ACCEPTED }
            })
        ]);
        return { message: "Request accepted. User has been added to the team.", data: updatedRequest };

    } else { 
        const updatedRequest = await prisma.teamJoinRequest.update({
            where: { id: joinRequestId },
            data: { status: RequestStatus.REJECTED }
        });
        return { message: "Request rejected.", data: updatedRequest };
    }
  }, {
    body: manageJoinRequestSchema
  });
