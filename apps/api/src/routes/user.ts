import Elysia from "elysia";
import type { Context } from "elysia/context";


export const userRouter = new Elysia({ prefix: "/api/user" })
  .get(("/"), (ctx: Context) => {
    ctx.set.status = 403
    return { 
      msg: "This is user route"
    }
  })