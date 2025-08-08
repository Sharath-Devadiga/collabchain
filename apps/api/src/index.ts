import dotenv from "dotenv"
dotenv.config()
import Elysia from "elysia";
import { authRoutes } from "./routes/auth";


const app = new Elysia()
const PORT = process.env.PORT!

app.group("/api/auth",(group) => authRoutes(group))


app.listen(PORT, () => console.log(`Server is running on ${PORT}`))