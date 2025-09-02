import Elysia from "elysia";
import type { Context, Cookie, HTTPHeaders, StatusMap } from "elysia";
import { teamHandler } from "../controllers/team";
import jwt from "@elysiajs/jwt";
import cookie from "@elysiajs/cookie";
import { authMiddleware } from "../middleware/auth";
import type { ElysiaCookie } from "elysia/cookies";

export const userRouter = new Elysia({ prefix: "/api/user" })
  .use(cookie())
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
  .get(("/"), (ctx: Context) => {
    ctx.set.status = 200
    return { 
      message: "dummy user route"
    }
  })
  .use(teamHandler)

