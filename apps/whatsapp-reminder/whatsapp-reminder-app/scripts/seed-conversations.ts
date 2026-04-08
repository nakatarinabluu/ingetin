import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Clearing old conversations...');
    await prisma.conversation.deleteMany({});

    console.log('🔍 Fetching all unique partners...');
    const partners = await prisma.$queryRaw`
        SELECT 
            partner,
            MAX(timestamp) as last_timestamp,
            MAX("userId") as last_userId
        FROM (
            SELECT 
                CASE 
                    WHEN direction = 'INBOUND' THEN "from"
                    ELSE "to"
                END AS partner,
                timestamp,
                "userId"
            FROM messages
            WHERE "from" != 'SYSTEM' OR "to" != 'SYSTEM'
        ) as sub
        GROUP BY partner
        ORDER BY last_timestamp DESC
    ` as any[];

    console.log(`Found ${partners.length} unique partners. Seeding...`);

    for (const p of partners) {
        const latestMsg = await prisma.message.findFirst({
            where: {
                OR: [{ from: p.partner }, { to: p.partner }]
            },
            orderBy: { timestamp: 'desc' }
        });

        if (!latestMsg) continue;

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: p.last_userId || undefined },
                    { phoneNumber: { contains: p.partner.slice(-10) } }
                ]
            }
        });

        const unreadCount = await prisma.message.count({
            where: {
                from: p.partner,
                direction: 'INBOUND',
                status: 'DELIVERED'
            }
        });

        await prisma.conversation.create({
            data: {
                phoneNumber: p.partner,
                lastMessageBody: latestMsg.body,
                lastMessageTimestamp: latestMsg.timestamp,
                lastMessageDirection: latestMsg.direction,
                unreadCount,
                isRegistered: !!user,
                fullName: user?.fullName,
                username: user?.username,
                userId: user?.id
            }
        });
    }

    console.log('✅ Seeding complete!');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});