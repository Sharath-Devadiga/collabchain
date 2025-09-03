import { prisma } from "@repo/db"
import { readdir } from "fs/promises"
import path from "path"
import { decrypt } from "../auth/crypto"
import util from "util"
import { exec } from "child_process"

const run = util.promisify(exec)
const IGNORED_DIRS = [".git", "node_modules", "dist", "build", "vendor", ".terraform", "__pycache__", "target"];

export const hashingAndRating = async(githubLink: string) => {
    const dirName = crypto.randomUUID()
    const dir = path.join(process.cwd(), dirName)
    const repo = await prisma.repo.findUnique({
        where: {
            githubLink
        },
        include: {
            owner: true
        }
    })
    if(!repo?.owner || !repo?.owner.githubAccessToken) {
        throw new Error("Repo's Owner is not configured correctly")
    }
    const repoUrl = `https://${repo.owner.username}:${decrypt(repo.owner.githubAccessToken)}@github.com/${repo.owner.username}/${repo.name}`
    await run(`git clone ${repoUrl} ${dir}`)

}