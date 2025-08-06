import Elysia from "elysia";
import dotenv from "dotenv"
dotenv.config()

const app = new Elysia()
const PORT = process.env.PORT!

app.listen(PORT)