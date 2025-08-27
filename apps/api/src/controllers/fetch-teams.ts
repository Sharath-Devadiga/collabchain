import Elysia from "elysia";
import { authPlugin } from "../lib/plugin";
import { prisma } from "@repo/db";

export const fetchTeams = new Elysia({ prefix: "/fetch-teams" })
  .use(authPlugin)
  .get(("/"), async ({user}) => {
    const userId = user.id

    const teams = await prisma.team.findMany({
      where: {
        createdById: userId
      }
    })
    return {
      message: "Teams fetched successfully",
      data: {
        teams
      }
    }
  })