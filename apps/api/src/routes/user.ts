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
      msg: "dummy user route"
    }
  })
  .guard(
    {
      beforeHandle({ set, cookie }) {
        if(!validate(cookie))
          return (set.status = "Unauthorized")
      }
    },
    (app) =>
      app
        .use(teamHandler)
  )

const validate = (
  cookie: Record<string, Cookie<string | undefined>> & Record<string, string>
) => {
  if(!cookie.authToken?.value)
    return false
  else 
    return true
}