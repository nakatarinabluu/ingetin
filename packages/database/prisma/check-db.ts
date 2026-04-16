import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const userCount = await prisma.user.count();
    const licenseCount = await prisma.license.count();
    const transactionCount = await prisma.transaction.count();
    
    console.log('--- DATABASE STATUS ---');
    console.log('Total Users:', userCount);
    console.log('Total Licenses:', licenseCount);
    console.log('Total Transactions:', transactionCount);
    console.log('-----------------------');
}

main().catch(console.error).finally(() => prisma.$disconnect());
