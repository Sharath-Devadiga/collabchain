// global.d.ts
import "elysia";
import { Context as ElysiaContext } from "elysia/context";

declare module "elysia" {
  interface Context extends ElysiaContext {
    jwt: {
      sign: (payload: {userId: string, username: string}, options?: { expiresIn?: string | number } ) => Promise<string> | string;
      verify: (token?: string) => Promise<any> | any;
    };
    userId: string
    username: string
  }
}