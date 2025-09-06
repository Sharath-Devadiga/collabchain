import { t } from "elysia";

export const createTeamSchema = t.Object({
  title: t.String({minLength: 1, maxLength: 20}),
  githubRepo: t.Optional(t.RegExp(/^(https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+|[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)$/)),
  visibility: t.Optional(
    t.Enum({
      PUBLIC: "PUBLIC",
      PRIVATE: "PRIVATE"
    })
)});

export const requestToJoinSchema = t.Object({
  teamId: t.String()
});

export const manageJoinRequestSchema = t.Object({
  joinRequestId: t.String(),
  status: t.Enum({
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED"
  })
});

export const joinWithInviteSchema = t.Object({
    inviteCode: t.String()
});
