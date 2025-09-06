import Elysia from "elysia";
import { authPlugin } from "../lib/plugin";
import { prisma } from "@repo/db";
import { updateTeamSchema } from "../schemas/team";
import { t } from "elysia";

export const updateTeamHandler = new Elysia({ prefix: "/update" })
  .use(authPlugin)
  .patch(
    "/:teamId",
    async ({ params, body, user, set }) => {
      const { teamId } = params;
      const { title, githubRepo } = body;
      const userId = user.id;

      if (!title && !githubRepo) {
        set.status = 400; 
        return { message: "Please provide a title or a githubRepo to update." };
      }

      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team) {
        set.status = 404; 
        return { message: "Team not found." };
      }

      if (team.createdById !== userId) {
        set.status = 403;
        return { message: "You are not authorized to update this team." };
      }
      
      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: {
          ...(title && { title }),
          ...(githubRepo && { githubRepo }),
        },
      });

      return {
        message: "Team details updated successfully.",
        data: updatedTeam,
      };
    },
    {
      body: updateTeamSchema,
      params: t.Object({
        teamId: t.String()
      })
    }
  );
