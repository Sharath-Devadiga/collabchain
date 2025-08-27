import Elysia from "elysia";
import type { Context } from "elysia";

export const fetchTeams = new Elysia({ prefix: "/fetch-teams" })
  .get(("/"), (ctx: Context) => {
    const userId = ctx.cookie.proflie?.value
    console.log("user id: ", userId)
    return {
      msg: "Teams fetched successfully",
      userId: userId
    }
  })