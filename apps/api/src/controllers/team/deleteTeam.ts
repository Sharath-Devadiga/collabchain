import Elysia from "elysia";
import { authPlugin } from "../../lib/plugin";
import { prisma } from "@repo/db";
import { deleteTeamSchema } from "../../schemas/team";

export const deleteTeamHandler = new Elysia({ prefix: "/delete" })
  .use(authPlugin)
  .delete(
    "/:teamId",
    async ({ params, user, set }) => {
      const { teamId } = params;
      const userId = user.id;

      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team) {
        set.status = 404; 
        return { message: "Team not found." };
      }

      if (team.createdById !== userId) {
        set.status = 403; 
        return { message: "You are not authorized to delete this team." };
      }

      await prisma.team.delete({
        where: { id: teamId },
      });

      return { message: "Team has been permanently deleted." };
    },
    {
      params: deleteTeamSchema,
    }
  );

