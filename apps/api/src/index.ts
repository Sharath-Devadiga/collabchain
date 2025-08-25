import dotenv from "dotenv";
dotenv.config();

import { Elysia } from "elysia";
import { authRouter } from "./routes/auth";
import jwt from "@elysiajs/jwt";
import { cors } from '@elysiajs/cors'
import { userRouter } from "./routes/user";

const app = new Elysia();
app.use(cors())
const PORT = process.env.PORT!;

app.use(
    jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET!,
    })
);

app.use(authRouter);
app.use(userRouter)

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));