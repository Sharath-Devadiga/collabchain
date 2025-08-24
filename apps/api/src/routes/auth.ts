import { Elysia } from "elysia"
import { loginHandler } from "../auth/login"
import jwt from "@elysiajs/jwt"
import { callbackFunction } from "../auth/oauth"
import cookie from "@elysiajs/cookie"
import { logoutHandler } from "../auth/logout"

export const authRouter = new Elysia({ prefix: "/api/auth"})
    .use(cookie())
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
    .get("/github/signin", loginHandler)
    .all("/github/callback", callbackFunction)
    .post("/logout", logoutHandler);