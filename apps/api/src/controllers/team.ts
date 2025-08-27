import Elysia from "elysia";
import { createTeam } from "./create-team";
import { fetchTeams } from "./fetch-teams";
import { authPlugin } from "../lib/plugin";

export const teamHandler = new Elysia({ prefix: "/team" })
  .use(createTeam)
  .use(fetchTeams)