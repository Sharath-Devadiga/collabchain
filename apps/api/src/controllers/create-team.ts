import Elysia from "elysia";
import { createTeamSchema } from "../schemas/team";
import { authPlugin } from "../lib/plugin";
import { prisma } from "@repo/db";

export const createTeam = new Elysia({ prefix: "/create-team"})
  .use(authPlugin)
  .post(("/"), async ({ body, user }) => {
    const { title, githubRepo } = body
    const userId = user.id
    const newTeam = await prisma.team.create({
      data: {
        title,
        githubRepo,
        createdById: userId
      }
    })
    return {
      message: "Team created successfully",
      data: {
        team: newTeam
      }
    }
  }, {
    body: createTeamSchema
  })