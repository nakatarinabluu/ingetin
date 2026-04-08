import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Inspecting Users...");
    const users = await prisma.user.findMany({
        select: {
            username: true,
            role: true,
            isActivated: true,
            email: true
        }
    });
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
