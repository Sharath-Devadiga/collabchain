// global.d.ts
import "elysia";

declare module "elysia" {
  interface Context {
    query: Record<string, string | undefined>

    jwt: {
      sign: (payload: Record<string, any>) => Promise<string> | string;
      verify: (token?: string) => Promise<any> | any;
    };

    cookie: {
      [key: string]: {
        get: () => string | undefined;
        set: (options: {
          value: string;
          httpOnly?: boolean;
          path?: string;
          sameSite?: 'strict' | 'lax' | 'none';
          secure?: boolean;
          maxAge?: number;
        }) => void;
        remove: () => void;
      };
    };
  }
}