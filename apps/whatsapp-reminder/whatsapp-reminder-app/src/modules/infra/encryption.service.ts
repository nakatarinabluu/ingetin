import { encrypt, decrypt, isEncrypted } from '../../utils/crypto';
import { env } from '../../core/config';
import { logger } from '@ingetin/logger';
import crypto from 'crypto';

export class EncryptionService {
    private readonly secret: string;

    constructor() {
        const rawSecret = env.ENCRYPTION_SECRET;
        
        // If it's a 64-char hex string, convert to 32-byte buffer. 
        // Otherwise, use as-is (raw string) and pad/truncate to 32 bytes.
        if (rawSecret.length === 64 && /^[0-9a-fA-F]+$/.test(rawSecret)) {
            this.secret = Buffer.from(rawSecret, 'hex').toString('hex');
        } else {
            // Pad or truncate to ensure exactly 32 bytes for the algorithm
            this.secret = Buffer.alloc(32, rawSecret, 'utf8').toString('hex');
        }

        if (!this.secret || this.secret.length < 64) {
            const msg = 'CRITICAL SECURITY FAILURE: ENCRYPTION_SECRET must be exactly 32 bytes (64 hex chars). Application startup aborted to prevent insecure data storage.';
            logger.error(msg);
            throw new Error(msg);
        }
    }

    /**
     * Encrypt a sensitive value
     */
    encryptField(value: string | null | undefined): string | null {
        if (!value) return null;
        try {
            return encrypt(value, this.secret);
        } catch (error) {
            logger.error({ msg: 'Encryption Failed', error: (error as Error).message });
            return null;
        }
    }

    /**
     * Decrypt a value if it is encrypted
     */
    decryptField(value: string | null | undefined): string | null {
        if (!value) return null;
        if (!isEncrypted(value)) return value; // Return as-is if not encrypted

        try {
            return decrypt(value, this.secret);
        } catch (error) {
            logger.error({ msg: 'Decryption Failed', error: (error as Error).message });
            return null;
        }
    }

    /**
     * Decrypt an entire object's specified fields
     */
    decryptObject<T extends Record<string, string | null | undefined | any>>(obj: T | null, fields: (keyof T)[]): T | null {
        if (!obj) return null;
        const result = { ...obj };
        for (const field of fields) {
            const val = result[field];
            if (typeof val === 'string') {
                result[field] = this.decryptField(val) as any;
            }
        }
        return result;
    }

    /**
     * Encrypt specified fields in an object
     */
    encryptObject<T extends Record<string, any>>(obj: T | null, fields: (keyof T)[]): T | null {
        if (!obj) return null;
        const result = { ...obj };
        for (const field of fields) {
            const val = result[field];
            if (typeof val === 'string' || val === null || val === undefined) {
                result[field] = this.encryptField(val as string) as any;
            }
        }
        return result;
    }

    /**
     * Generate a Blind Index (one-way hash) for searching encrypted fields
     */
    generateBlindIndex(value: string | null | undefined): string | null {
        if (!value) return null;
        return crypto
            .createHmac('sha256', this.secret)
            .update(value.toLowerCase().trim())
            .digest('hex');
    }
}
