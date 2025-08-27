import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
import { prisma } from "@repo/db";
import { JWT_NAME } from "./constants";

const authPlugin = (app: Elysia) =>
  app
    .use(
      jwt({
        name: JWT_NAME,
        secret: process.env.JWT_SECRET!,
      })
    )
    .derive(async ({ jwt, cookie: { accessToken }, set }) => {
      if (!accessToken?.value) {
        // handle error for access token is not available
        set.status = 401;
        throw new Error("Access token is missing");
      }
      const jwtPayload = await jwt.verify(accessToken.value);
      if (!jwtPayload) {
        // handle error for access token is tempted or incorrect
        set.status = 403;
        throw new Error("Access token is invalid");
      }
      const userId = jwtPayload.sub;
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) {
        // handle error for user not found from the provided access token
        set.status = 403;
        throw new Error("Access token is invalid");
      }

      return {
        user,
      };
    });

export { authPlugin };