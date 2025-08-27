import Elysia from "elysia";
import { authPlugin } from "../lib/plugin";

export const fetchTeams = new Elysia({ prefix: "/fetch-teams" })
  .use(authPlugin)
  .get(("/"), ({user}) => {
    const userId = user.id
    console.log("user id: ", userId)
    return {
      msg: "Teams fetched successfully",
      userId: userId
    }
  })