import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const ENCRYPTION_PREFIX = 'ingetin:encv1:';

/**
 * Encrypts a plaintext string using AES-256-GCM
 * @param text The plaintext string to encrypt
 * @param secret The encryption key (must be 32 bytes/256 bits)
 * @returns A formatted string containing prefix, iv, authTag, and ciphertext
 */
export function encrypt(text: string, secret: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(secret, 'hex'), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: prefix:iv:authTag:encrypted
    return `${ENCRYPTION_PREFIX}${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a string encrypted with AES-256-GCM
 * @param encryptedText The formatted encrypted string (prefix:iv:authTag:encrypted)
 * @param secret The encryption key (must be 32 bytes/256 bits)
 * @returns The decrypted plaintext string
 */
export function decrypt(encryptedText: string, secret: string): string {
    if (!encryptedText.startsWith(ENCRYPTION_PREFIX)) {
        throw new Error('Missing encryption prefix');
    }

    const payload = encryptedText.substring(ENCRYPTION_PREFIX.length);
    const [ivHex, authTagHex, encryptedHex] = payload.split(':');
    
    if (!ivHex || !authTagHex || !encryptedHex) {
        throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(secret, 'hex'), iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

/**
 * Helper to check if a string is likely encrypted with this utility's format
 */
export function isEncrypted(text: string): boolean {
    return text.startsWith(ENCRYPTION_PREFIX) && text.split(':').length === 4;
}
