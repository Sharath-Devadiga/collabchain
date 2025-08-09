import type { Context } from "elysia";



export const authMiddleware = async (ctx: Context) => {
    try {
        const { jwt, cookie } = ctx
        const token = cookie.authToken?.value
        if(!token) {
            return new Response("Unauthorized", { status: 401 })
        }

        const payload = await jwt.verify(token)

        if(!payload) {
            return new Response("Unauthorised", { status: 401 })
        }

        ctx.userId = payload.userId;
        ctx.username = payload.username

    } catch (error) {
        console.error(error)
        return new Response("Unauthorised", {status: 401})
    }
}