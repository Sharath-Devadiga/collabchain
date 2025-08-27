import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const algorithm = "aes-256-gcm";
const key = Buffer.from(ENCRYPTION_KEY, "hex")
const iv = crypto.randomBytes(12)

export const encrypt = (text: string) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    const encrypted = Buffer.concat([cipher.update(text, "utf-8"), cipher.final()])
    const tag = cipher.getAuthTag()
    return iv.toString('hex') + ':' + tag.toString('hex') + encrypted.toString('hex')
}

export const decrypt = (text: string) => {
    const [ivHex, tagHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex as string, "hex");
    const tag = Buffer.from(tagHex as string, "hex")
    const encrypted = Buffer.from(encryptedHex as string, "hex")
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    decipher.setAuthTag(tag)
    return decipher.update(encrypted, undefined, "utf-8") + decipher.final("utf-8")
}
