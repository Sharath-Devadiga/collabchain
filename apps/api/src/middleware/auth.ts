import jwt, { type JWTPayloadSpec } from "@elysiajs/jwt";
import type { Context } from "elysia";
import { StatusMap } from 'elysia'
import { verify } from "../lib/auth";
import { prisma } from "@repo/db";

export const authMiddleware = async (ctx: Context) => {
    try {
        const { jwt, cookie } = ctx
        const token = cookie.authToken?.value
        if(!token) {
            ctx.set.status = 401
            throw new Error('Not authorized, Invalid token!')
        }

        const payload = await jwt.verify(token)

        if(!payload) {
          ctx.set.status = 401
          throw new Error('Not authorized, Invalid token!')
        }

        ctx.userId = payload.userId;
        ctx.username = payload.username

    } catch (error) {
        console.error(error)
        ctx.set.status = 401
        throw new Error('Not authorized, Invalid token!')
    }
}

// export const authMiddleware = async (c: {
//   headers: Record<string, string | undefined>
//   set: { status: number | keyof StatusMap | undefined; headers: Record<string, string | undefined> }
//   request: Request,
// }) => {
//   let token: string | undefined

//   if (c.headers.authorization && c.headers.authorization.startsWith('Bearer')) {
//     try {
//       token = c.headers.authorization.split(' ')[1]
//       const decoded = await verify(token!)

//       if (!decoded || !decoded.id) {
//         c.set.status = 401
//         throw new Error('Not authorized, Invalid token!')
//       }

//       const user = await prisma.user.findFirst({ where: { id: decoded.id } })

//       if (!user) {
//         c.set.status = 401
//         throw new Error('Not authorized, Invalid token!')
//       }

//       c.request.headers.set('userId', user.id.toString())
//     } catch (error) {
//       c.set.status = 401
//       throw new Error('Not authorized, Invalid token!')
//     }
//   } else {
//     c.set.status = 401
//     throw new Error('Not authorized, Invalid token!')
//   }
// }