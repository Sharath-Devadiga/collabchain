// global.d.ts
import "elysia";

declare module "elysia" {
  interface ElysiaContext {
    jwt: {
      sign: (payload: Record<string, any>, opts?: any) => Promise<string> | string;
      verify: (token?: string, opts?: any) => Promise<any> | any;
    };

    cookies: {
      get: (id: string) => string;
      set: (...args: any[]) => void; // allow multiple signatures
      delete: () => void;
    };
  }
}
