import { PrismaClient, Role, ReminderStatus, RepeatInterval, LicenseStatus, MessageDirection, MessageStatus, UsageType, SocialProvider, TransactionType, MessageType } from '@prisma/client';
import * as argon2 from 'argon2';
import crypto from 'crypto';

const prisma = new PrismaClient({ log: ['error'] });

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || '7234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const ENCRYPTION_PREFIX = 'ingetin:encv1:';
const ALGORITHM = 'aes-256-gcm';

// REAL Encryption Utils
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

// Math/Stat Utils
function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
    console.log('🚀 Starting REAL ENCRYPTION Stress Test Seeding...');

    const TARGET_USERS = 20000; // Scaled to 20k for stability while remaining "massively scaled"
    const CHUNK_SIZE = 5000; 

    console.log('⏳ Pre-computing Auth Hash...');
    const commonPasswordHash = await argon2.hash('Cloverid76');
    const TWO_YEARS_AGO = new Date(Date.now() - (2 * 365 * 24 * 60 * 60 * 1000));
    const NOW = new Date();

    console.log('🧹 Wiping existing test data...');
    await prisma.transaction.deleteMany({});
    await prisma.financialProfile.deleteMany({});
    await prisma.usageLog.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.reminder.deleteMany({});
    await prisma.socialAccount.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.license.deleteMany({});

    console.log('👑 Creating Super Admin...');
    const adminEmail = 'admin@ingetin.com';
    await prisma.user.create({
        data: {
            id: crypto.randomUUID(),
            username: 'admin',
            email: encrypt(adminEmail),
            emailHash: generateBlindIndex(adminEmail),
            password: commonPasswordHash,
            firstName: 'Super',
            lastName: 'Admin',
            fullName: 'Super Admin',
            role: Role.ADMIN,
            isActivated: true,
            createdAt: TWO_YEARS_AGO
        }
    });

    console.log(`\n======================================================`);
    console.log(`🔥 GENERATING ${TARGET_USERS} USERS (VALID DATA) 🔥`);
    console.log(`======================================================\n`);

    let totalUsers = 0;

    for (let batch = 0; batch < TARGET_USERS; batch += CHUNK_SIZE) {
        console.time(`Chunk ${Math.floor(batch / CHUNK_SIZE) + 1} Processing`);
        
        const __users: Array<Parameters<typeof prisma.user.createMany>[0]['data']> = [];
        const __licenses: Array<Parameters<typeof prisma.license.createMany>[0]['data']> = [];
        const __financialProfiles: Array<Parameters<typeof prisma.financialProfile.createMany>[0]['data']> = [];
        const __transactions: Array<Parameters<typeof prisma.transaction.createMany>[0]['data']> = [];
        const __reminders: Array<Parameters<typeof prisma.reminder.createMany>[0]['data']> = [];
        const __messages: Array<Parameters<typeof prisma.message.createMany>[0]['data']> = [];
        const __conversations: Array<Parameters<typeof prisma.conversation.createMany>[0]['data']> = [];
        const __usageLogs: Array<Parameters<typeof prisma.usageLog.createMany>[0]['data']> = [];

        for (let i = 0; i < CHUNK_SIZE; i++) {
            const index = batch + i + 1;
            const userId = crypto.randomUUID();
            const licenseId = crypto.randomUUID();
            
            const username = `user${index}`;
            const email = `user${index}@example.com`;
            const phoneStr = `6281${index.toString().padStart(8, '0')}`;
            const userJoinDate = randomDate(TWO_YEARS_AGO, new Date(NOW.getTime() - 10 * 24 * 60 * 60 * 1000));
            const isActivated = true;

            // REAL ENCRYPTION (Wait for CPU if needed)
            const encEmail = encrypt(email);
            const encPhone = encrypt(phoneStr);
            const emailHash = generateBlindIndex(email);
            const phoneHash = generateBlindIndex(phoneStr);

            __licenses.push({
                id: licenseId,
                key: `LICS-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${index}`,
                targetName: `Plan ${index}`,
                status: LicenseStatus.USED,
                userId: userId,
                createdAt: userJoinDate,
                activatedAt: userJoinDate
            });

            __users.push({
                id: userId,
                username,
                email: encEmail,
                emailHash: emailHash,
                phoneNumber: encPhone,
                phoneHash: phoneHash,
                password: commonPasswordHash,
                firstName: `User`,
                lastName: `${index}`,
                fullName: `User ${index}`,
                role: Role.USER,
                isActivated,
                licenseId: licenseId,
                createdAt: userJoinDate,
                updatedAt: userJoinDate,
            });

            // Financials
            const baseSalary = randomInt(50, 150) * 100000;
            __financialProfiles.push({
                id: crypto.randomUUID(),
                userId,
                monthlyBudgetLimit: Math.floor(baseSalary * 0.7),
                baseSalary,
                updatedAt: userJoinDate
            });

            // Transactions (~10 per user)
            for (let t = 0; t < 10; t++) {
                const txDate = randomDate(userJoinDate, NOW);
                const isIncome = t === 0; // First is always salary
                __transactions.push({
                    id: crypto.randomUUID(),
                    userId,
                    type: isIncome ? TransactionType.INCOME : TransactionType.EXPENSE,
                    amount: isIncome ? baseSalary : randomInt(20000, 500000),
                    category: isIncome ? 'SALARY' : randomElement(['FOOD', 'ENTERTAINMENT', 'TRANSPORT']),
                    description: `Transaction ${t}`,
                    date: txDate,
                    createdAt: txDate
                });
            }

            // Messages & Conversations (Correct Format: phoneNumber is RAW)
            const lastMsgDate = randomDate(userJoinDate, NOW);
            const lastDir: MessageDirection = Math.random() > 0.5 ? MessageDirection.INBOUND : MessageDirection.OUTBOUND;
            const lastBody = lastDir === MessageDirection.INBOUND ? "Ready to remind?" : "Welcome to Ingetin!";

            __messages.push({
                id: crypto.randomUUID(),
                userId,
                whatsappId: `wa_${userId}_init`,
                from: lastDir === MessageDirection.INBOUND ? phoneStr : 'SYSTEM',
                to: lastDir === MessageDirection.INBOUND ? 'SYSTEM' : phoneStr,
                body: lastBody,
                direction: lastDir,
                status: MessageStatus.DELIVERED,
                timestamp: lastMsgDate
            });

            __conversations.push({
                id: crypto.randomUUID(),
                phoneNumber: phoneStr, // RAW NUMBER for conversation lookup
                lastMessageBody: lastBody,
                lastMessageTimestamp: lastMsgDate,
                lastMessageDirection: lastDir,
                unreadCount: lastDir === MessageDirection.INBOUND ? 1 : 0,
                isRegistered: true,
                username: username,
                userId,
                updatedAt: lastMsgDate
            });

            // Usage
            __usageLogs.push({
                id: crypto.randomUUID(),
                userId,
                type: UsageType.REGISTRATION,
                target: `Register`,
                cost: 0,
                status: 'SUCCESS',
                createdAt: userJoinDate
            });
        }

        // DB PUSH In correct FK order
        await prisma.$transaction([
            prisma.license.createMany({ data: __licenses }),
            prisma.user.createMany({ data: __users }),
            prisma.financialProfile.createMany({ data: __financialProfiles }),
            prisma.transaction.createMany({ data: __transactions }),
            prisma.message.createMany({ data: __messages }),
            prisma.conversation.createMany({ data: __conversations }),
            prisma.usageLog.createMany({ data: __usageLogs }),
        ]);

        totalUsers += CHUNK_SIZE;
        console.log(`📈 Processed: ${totalUsers} Users`);
        console.timeEnd(`Chunk ${Math.floor(batch / CHUNK_SIZE) + 1} Processing`);
        if (global.gc) global.gc();
    }

    console.log(`\n✅ REAL DATA SEEDING COMPLETE!`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
