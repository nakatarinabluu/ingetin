import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🛠️ Starting Admin Repair...");
    
    // We'll target user with username 'admin'
    const result = await prisma.user.updateMany({
        where: {
            OR: [
                { username: { equals: 'admin', mode: 'insensitive' } },
                { role: 'ADMIN' }
            ]
        },
        data: {
            role: 'ADMIN',
            isActivated: true
        }
    });

    console.log(`✅ Success! Updated ${result.count} accounts to full ADMIN status.`);
    process.exit(0);
}

main().catch(err => {
    console.error("❌ Failed to update admin account:", err);
    process.exit(1);
});
