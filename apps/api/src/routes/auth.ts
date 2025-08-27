import { Elysia, t } from "elysia"
import { loginHandler } from "../auth/login"
import jwt from "@elysiajs/jwt"
import { prisma } from "@repo/db"
import { encrypt } from "../auth/crypto"
import { getExpTimestamp } from "../lib/util"
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from "../lib/constants"
import { authPlugin } from "../lib/plugin"

export const authRouter = new Elysia({ prefix: "/api/auth"})
    // .use(cookie())
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
    .get("/github/signin", loginHandler)
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
              githubAccessToken: encrypt(access_token)
          },
          create: {
              username: login,
              githubId: Number(id),
              githubAccessToken: encrypt(access_token),
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
    .post("/refresh", async ({ cookie: { accessToken, refreshToken }, jwt, set }) => {
      try {
        if (!refreshToken?.value) {
          // handle error for refresh token is not available
          set.status = 401;
          console.log("1")
          return {
            message: "Refresh token is missing"
          }
        }
        console.log("2")
        // get refresh token from cookie
        const jwtPayload = await jwt.verify(refreshToken?.value);
        if (!jwtPayload) {
          // handle error for refresh token is tempted or incorrect
          set.status = 403;
          return {
            message: "Refresh token is invalid"
          }
        }
  
        // get user from refresh token
        const userId = jwtPayload.sub;
  
        // verify user exists or not
        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        });
  
        if (!user) {
          // handle error for user not found from the provided refresh token
          set.status = 403;
          return {
            message: "Refresh token is invalid"
          }
        }
        
        if (user.refreshToken !== refreshToken.value) {
          set.status = 403;
          return {
            message: "Refresh token mismatch"
          };
        }
        
        // create new access token
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
  
        // create new refresh token
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
  
        // set refresh token in db
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            refreshToken: refreshJWTToken,
          },
        });
  
        return {
          message: "Access token generated successfully",
          data: {
            accessToken: accessJWTToken,
            refreshToken: refreshJWTToken,
          },
        };
      }
      catch(e) {
        console.log("Error while refreshing token: ", e)
        set.status = 500
        return {
          message: "Internal server error"
        }
      }
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
    
    