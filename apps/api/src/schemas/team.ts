import { t } from "elysia";

export const createTeamSchema = t.Object({
  title: t.String({minLength: 1, maxLength: 20}),
  githubRepo: t.Optional(t.RegExp(/^(https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+|[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)$/)),
});