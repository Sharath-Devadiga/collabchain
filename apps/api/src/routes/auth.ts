import { Elysia } from "elysia"
import { loginHandler } from "../auth/login"
import jwt from "@elysiajs/jwt"
import { callbackFunction } from "../auth/oauth"
import cookie from "@elysiajs/cookie"

export const authRoutes = <Prefix extends string>(app: Elysia<Prefix>) =>
    app
        .use(cookie())
        .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
        .get("/github/signin", loginHandler)
        .all("/github/callback", callbackFunction)
