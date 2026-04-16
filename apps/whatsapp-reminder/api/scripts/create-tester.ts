import { PrismaClient, Role, LicenseStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || '7234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const ENCRYPTION_PREFIX = 'ingetin:encv1:';
const ALGORITHM = 'aes-256-gcm';

function encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_SECRET, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${ENCRYPTION_PREFIX}${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function generateBlindIndex(value: string): string {
    return crypto.createHmac('sha256', ENCRYPTION_SECRET).update(value.toLowerCase().trim()).digest('hex');
}

async function main() {
    const username = 'tester';
    const password = 'Tester123!';
    const emailStr = 'tester@ingetin.com';
    const phone = '628123456789';

    console.log(`🚀 Creating test user: ${username}...`);

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
        where: { username }
    });

    if (existingUser) {
        console.log('⚠️ User already exists. Deleting to recreate...');
        // Clean up related data
        await prisma.transaction.deleteMany({ where: { userId: existingUser.id } });
        await prisma.financialProfile.deleteMany({ where: { userId: existingUser.id } });
        await prisma.reminder.deleteMany({ where: { userId: existingUser.id } });
        await prisma.socialAccount.deleteMany({ where: { userId: existingUser.id } });
        await prisma.license.deleteMany({ where: { userId: existingUser.id } });
        await prisma.user.delete({ where: { id: existingUser.id } });
        
        // Clear Redis Cache
        await redis.del(`user:profile:${existingUser.id}`);
        await redis.del(`setup:${existingUser.id}`);
        await redis.del(`linked:${existingUser.id}`);
    }

    const passwordHash = await argon2.hash(password);
    const userId = crypto.randomUUID();
    const licenseId = crypto.randomUUID();
    const licenseKey = `LICS-V1-TESTER-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    // Create User with exact schema alignment
    const newUser = await prisma.user.create({
        data: {
            id: userId,
            username,
            email: encrypt(emailStr),
            emailHash: generateBlindIndex(emailStr),
            phoneNumber: encrypt(phone),
            phoneHash: generateBlindIndex(phone),
            password: passwordHash,
            firstName: 'Official',
            lastName: 'Tester',
            fullName: 'Official Tester',
            role: Role.USER,
            isActivated: true,
            license: {
                create: {
                    id: licenseId,
                    key: licenseKey,
                    targetName: 'Official Tester Account',
                    status: LicenseStatus.USED,
                    activatedAt: new Date()
                }
            },
            socialAccounts: {
                create: {
                    provider: 'GOOGLE',
                    providerId: 'google_tester_123',
                    refreshToken: encrypt('fake_google_refresh_token_for_ui_testing') // Encrypt it!
                }
            },
            financialProfile: {
                create: {
                    monthlyBudgetLimit: 5000000,
                    baseSalary: 10000000
                }
            },
            transactions: {
                create: {
                    amount: 50000,
                    description: 'Sample Coffee',
                    category: 'FOOD',
                    type: 'EXPENSE',
                    date: new Date()
                }
            }
        }
    });

    console.log('\n✅ User created successfully with simulated connections!');
    console.log('------------------------------');
    console.log(`Username : ${username}`);
    console.log(`Password : ${password}`);
    console.log(`License  : ${licenseKey}`);
    console.log('------------------------------');
}

main()
    .catch((e) => {
        console.error('❌ Error creating user:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await redis.quit();
    });
