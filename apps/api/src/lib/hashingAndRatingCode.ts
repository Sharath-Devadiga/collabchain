import { prisma } from "@repo/db"
import { readdir } from "fs/promises"
import path, { extname, join } from "path"
import { decrypt } from "../auth/crypto"
import util from "util"
import { exec } from "child_process"
import { readFile } from "fs/promises"
import { blake3 } from "@napi-rs/blake-hash"
import { GoogleGenAI } from "@google/genai"

const run = util.promisify(exec)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

const IGNORED_DIRS = [
    ".git", "node_modules", "dist", "build", ".next", ".cache",
    "__pycache__", ".venv", "venv", "target", ".gradle", ".idea"
  ];
  
const IGNORED_FILES = [
    "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "Pipfile", "Pipfile.lock", "requirements.txt",
    "Cargo.toml", "Cargo.lock",
    "go.mod", "go.sum",
    "pom.xml", "build.gradle"
  ];
  
const IGNORED_EXTS = [
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".mp4", ".avi",
    ".zip", ".exe", ".pdf", ".svg", ".ico"
];

function extractWords(text: string) {
    return text
        .replace(/[;{}[\]()<>.,!?:"'`~]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
}
async function* walkFiles(dir: string): AsyncGenerator<string, void, unknown> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
  
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.includes(entry.name)) {
          yield* walkFiles(fullPath);
        }
      } else if (
        entry.isFile() &&
        !IGNORED_FILES.includes(entry.name) &&
        !IGNORED_EXTS.includes(extname(entry.name))
      ) {
        yield fullPath;
      }
    }
}

async function collectWords(dir: string) {
    let words: string[] = [];
    for await (const file of walkFiles(dir)) {
      try {
        const raw = await readFile(file, "utf8");
        words = words.concat(extractWords(raw));
      } catch {
        // ignore unreadable/non-text files
      }
    }
    return words;
}


const ratingSeparator = (text: string) => {
  const match = text.match(/Rating: (\d)/)
  if(!match || match.length < 2){
    throw new Error("Error")
  }
  return parseInt(`${match[1]}`)
}

const commentSeparator = (text: string) => {
  const match = text.match(/Comment: (.+)/)
  if(!match || match.length < 2){
    throw new Error("Error")
  }
  return `${match[1]}`
}

export const hashingAndRatingCode = async(githubLink: string, githubCommitHash: string) => {
    try {
      const dirName = crypto.randomUUID()
      const dir = path.join(process.cwd(), "repos", dirName)
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
      await run(`cd ${dir} && git checkout ${githubCommitHash}`)
      const words = await collectWords(dir)
      const sortedWords = words.sort((a, b) => a.localeCompare(b))
      const combined = sortedWords.join(" ");
      const hash = blake3(combined)

      const data = await run(`git show ${githubCommitHash}`) 
      const author = (await run (`git log -1 --pretty=format:"%an <%ae>" ${githubCommitHash}`)).stdout.trim()
      
      const changes = data.stdout
        
      const contents = [
        {
          role: "user",
          parts: [
            {
              text: `Task: Rate and give a short comment on this code on the basis of what it does, how it does, how optimised it is, would it work properly and if it contains bugs or idle code rating should be between 1-10 and comment should be less than 100 words response should be in following format Rating: (\d), Comment: (.+) following is the commit: ${changes}`
            }
          ]
        }
      ]
      
      const response = await ai.models.generateContent({
        model: 'Gemini 2.5 Flash-Lite',
        contents
      })

      const { text } = response
      if(!text) {
        throw new Error("No response from the ai for rating code")
      }

      await run(`rm -rf ${dir}`)


      const rating = ratingSeparator(text)


      const comment = commentSeparator(text)
      
      await prisma.commit.create({
        data: {
          repoId: repo.id,
          githubCommitHash,
          repoHash: hash.toString(),
          rating,
          comment,
          author
        }
      })
      return hash
    } catch (error) {
      console.error(error)
    }
}