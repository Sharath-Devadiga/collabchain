// global.d.ts
import "elysia";
import type { Context as ElysiaContext } from "elysia/context";

declare module "elysia" {
  interface Context extends ElysiaContext {
    jwt: {
      sign: (payload: Record<string, any>) => Promise<string> | string;
      verify: (token?: string) => Promise<any> | any;
    };
  }
}