import type { Context } from "elysia";



export const authMiddleware = async (ctx: Context) => {
    try {
        const { jwt, cookie } = ctx
        const token = cookie.authToken?.value
        if(!token) {
            ctx.set.status = 401
            return {
              msg: "Unauthorised"
            }
        }

        const payload = await jwt.verify(token)

        if(!payload) {
          ctx.set.status = 401
          return {
            msg: "Unauthorised"
          }
        }

        ctx.userId = payload.userId;
        ctx.username = payload.username

    } catch (error) {
        console.error(error)
        ctx.set.status = 401
        return {
          msg: "Unauthorised"
        }
    }
}