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

export const updateTeamSchema = t.Object({
    title: t.Optional(t.String({ minLength: 1, maxLength: 20 })),
    githubRepo: t.Optional(t.RegExp(/^(https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+|[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)$/))
});

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

export const removeMemberSchema = t.Object({
    teamId: t.String(),
    memberId: t.String()
});

export const leaveTeamSchema = t.Object({
    teamId: t.String()
});

export const deleteTeamSchema = t.Object({
    teamId: t.String()
});