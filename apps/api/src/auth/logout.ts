import type { Context } from "elysia";

export const logoutHandler = async (ctx: Context) => {
  try {
    ctx.cookie.authToken?.set({
      value: '',
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === "production",
      maxAge: 0 
    });
    
    return {
      msg: "Logged out successfully"
    }
  } catch (e) {
    console.error("Error while logging out", e);
    ctx.set.status = 500
    return { 
      msg: "Internal server error" 
    };
  }
};
