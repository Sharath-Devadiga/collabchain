import { Elysia, t } from "elysia"
import { loginHandler } from "../auth/login"
import jwt from "@elysiajs/jwt"
import { callbackFunction } from "../auth/oauth"
import { prisma } from "@repo/db"
import { encrypt } from "../auth/crypto"
import { getExpTimestamp } from "../lib/util"
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from "../lib/constants"
import { authPlugin } from "../lib/plugin"

export const authRouter = new Elysia({ prefix: "/api/auth"})
    // .use(cookie())
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
    .get("/github/signin", loginHandler)
    .all("/github/cllback", callbackFunction)
    .all("/github/callback", async ({ query, jwt, cookie: { accessToken, refreshToken }, set }) => {
      const { code } =  query
      if(!code) {
        set.status = 400 
        return {
          msg: "No code provided"
        }
      }

      const res = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: {
              Accept: 'application/json', 
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              client_id: process.env.GITHUB_CLIENT_ID!,
              client_secret: process.env.GITHUB_CLIENT_SECRET!,
              code
          })
      })

      const { access_token } = await res.json() as { access_token: string } 
      if(!access_token) {
        set.status = 401
        return {
          msg: "Github authentication failed"
        }
      }

      const [userRes, emailRes] = await Promise.all([
          fetch("https://api.github.com/user", {
              headers: {
                  Authorization: `Bearer ${access_token}`
              }
          }),
          fetch("https://api.github.com/user/emails", {
              headers: {
                  Authorization: `Bearer ${access_token}`,
                  Accept: 'application/vnd.github+json'
              }
          })
      ])

      const [githubUser, emails] = await Promise.all([
          userRes.json() as Promise<{ id: string, login: string }>,
          emailRes.json() as Promise<any[]>
      ])

      const { id, login } = githubUser
      const primaryEmail = emails.find(e => e.primary && e.verified).email

      const user = await prisma.user.upsert({
          where: {
              githubId: Number(id) 
          },
          update: {
              accessToken: encrypt(access_token)
          },
          create: {
              username: login,
              githubId: Number(id),
              accessToken: encrypt(access_token),
              email: primaryEmail
          }
      })
      
      const accessJWTToken = await jwt.sign({
        sub: user.id,
        exp: getExpTimestamp(ACCESS_TOKEN_EXP),
      });
      accessToken?.set({
        value: accessJWTToken,
        httpOnly: true,
        maxAge: ACCESS_TOKEN_EXP,
        path: "/",
      });
      
      console.log("Created access token: ", accessJWTToken)

      // create refresh token
      const refreshJWTToken = await jwt.sign({
        sub: user.id,
        exp: getExpTimestamp(REFRESH_TOKEN_EXP),
      });
      refreshToken?.set({
        value: refreshJWTToken,
        httpOnly: true,
        maxAge: REFRESH_TOKEN_EXP,
        path: "/",
      });
      
      console.log("Created refresh token: ", refreshJWTToken)
      
      await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          refreshToken: refreshJWTToken
        }
      })
      
      return Response.redirect(`${process.env.FRONTEND_URL}/home`, 302)
    })
    .use(authPlugin)
    .get("/user", ({ user }) => {
      return {
        msg: "Current user",
        data: {
          user
        }
      }
    })
    .post("/logout", async ({ cookie: { accessToken, refreshToken }, user }) => {
      // remove refresh token and access token from cookies
      accessToken?.remove();
      refreshToken?.remove();
  
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken: null,
        },
      });
      return {
        message: "Logout successfully",
      };
    })
    