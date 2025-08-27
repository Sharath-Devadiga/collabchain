import { prisma } from "@repo/db"
import { encrypt } from "./crypto";
import type { Context } from "elysia";

export const callbackFunction = async (ctx: Context) => {
    try {
        const { query, jwt, cookie, redirect } = ctx;
        const { code } = query;
        
        if(!code) {
          ctx.set.status = 400
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
          ctx.set.status = 401
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

        const jwtToken = await jwt.sign({
            userId: user.id,
            username: login
        },  { expiresIn: "7d" }) 
        
        cookie.authToken?.set( {
            value: jwtToken,
            httpOnly: true,
            path: "/",
            sameSite: 'lax',
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7
        })

        return redirect(`${process.env.FRONTEND_URL}/home`, 302)
    } catch (error) {
        console.error(error)
        ctx.set.status = 500
        return {
          msg: "Internal server error"
        }
    }
}