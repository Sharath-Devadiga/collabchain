import Elysia from "elysia";
import { createTeam } from "./create-team";
import { fetchTeams } from "./fetch-teams";
import { joinRequestsHandler } from "./team/join-requests";
import { invitationsHandler } from "./team/invitations";

export const teamHandler = new Elysia({ prefix: "/team" })
  .use(createTeam)
  .use(fetchTeams)
  .use(joinRequestsHandler)
  .use(invitationsHandler);