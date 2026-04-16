import { encrypt, decrypt, isEncrypted } from '../../utils/crypto';
import { env } from '../../core/config';
import { logger } from '@ingetin/logger';
import crypto from 'crypto';

export class EncryptionService {
    private readonly secret = env.ENCRYPTION_SECRET;

    constructor() {
        if (!this.secret || this.secret.length !== 64) {
            logger.error('CRITICAL: ENCRYPTION_SECRET must be a 64-character hex string');
        }
    }

    encryptField(value: string | null | undefined): string | null {
        if (!value) return null;
        return encrypt(value, this.secret);
    }

    decryptField(value: string | null | undefined): string | null {
        if (!value || !isEncrypted(value)) return value || null;
        try {
            return decrypt(value, this.secret);
        } catch (error) {
            logger.warn({ msg: 'Single field decryption failed', error: (error as Error).message });
            return value;
        }
    }

    encryptObject<T>(obj: T, fields: string[]): T {
        if (!obj) return obj;
        const result = { ...obj } as Record<string, unknown>;

        for (const field of fields) {
            if (result[field] && typeof result[field] === 'string') {
                result[field] = this.encryptField(result[field] as string);
            }
        }

        return result as T;
    }

    decryptObject<T>(obj: T, fields: string[]): T {
        if (!obj) return obj;
        const result = { ...obj } as Record<string, unknown>;

        for (const field of fields) {
            if (result[field] && typeof result[field] === 'string') {
                if (isEncrypted(result[field] as string)) {
                    try {
                        result[field] = decrypt(result[field] as string, this.secret);
                    } catch (error) {
                        logger.warn({ msg: 'Object field decryption failed', field, error: (error as Error).message });
                        // Keep original value if decryption fails
                    }
                }
            }
        }

        return result as T;
    }

    generateBlindIndex(value: string | null | undefined): string | null {
        if (!value) return null;
        return crypto
            .createHmac('sha256', this.secret)
            .update(value.toLowerCase().trim())
            .digest('hex');
    }
}
