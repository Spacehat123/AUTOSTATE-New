import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

/**
 * Ensures the encryption key is valid. It must be exactly 32 bytes (256 bits) for AES-256.
 * The key is expected to be provided via process.env.ENCRYPTION_KEY, encoded in base64.
 */
function getKey(): Buffer {
  const keyBase64 = process.env.ENCRYPTION_KEY
  if (!keyBase64) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }
  const key = Buffer.from(keyBase64, 'base64')
  if (key.length !== 32) {
    throw new Error(`ENCRYPTION_KEY must be exactly 32 bytes (256 bits). Found ${key.length} bytes.`)
  }
  return key
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * @returns The encrypted string in the format "iv:authTag:encryptedData" (all base64)
 */
export function encrypt(text: string): string {
  if (!text) return text
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
  
  let encrypted = cipher.update(text, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  
  const authTag = cipher.getAuthTag().toString('base64')
  return `${iv.toString('base64')}:${authTag}:${encrypted}`
}

/**
 * Decrypts an encrypted string in the format "iv:authTag:encryptedData" (all base64).
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText
  
  const parts = encryptedText.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format. Expected "iv:authTag:encryptedData"')
  }
  
  const ivBase64 = parts[0] as string
  const authTagBase64 = parts[1] as string
  const dataBase64 = parts[2] as string
  
  const iv = Buffer.from(ivBase64, 'base64')
  const authTag = Buffer.from(authTagBase64, 'base64')
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv)
  decipher.setAuthTag(authTag)
  
  const decrypted1 = decipher.update(dataBase64, 'base64', 'utf8')
  const decrypted2 = decipher.final('utf8')
  
  return decrypted1 + decrypted2
}
