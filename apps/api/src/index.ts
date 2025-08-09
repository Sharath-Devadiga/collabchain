import dotenv from "dotenv"
dotenv.config()
import Elysia from "elysia";
import { authRoutes } from "./routes/auth";
import jwt from "@elysiajs/jwt";
import { authMiddleware } from "./middleware/auth";


const app = new Elysia()
const PORT = process.env.PORT!

app.use(
    jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET!
    })
)

app.group("/api/auth",(group) => authRoutes(group as any))



app.listen(PORT, () => console.log(`Server is running on ${PORT}`))