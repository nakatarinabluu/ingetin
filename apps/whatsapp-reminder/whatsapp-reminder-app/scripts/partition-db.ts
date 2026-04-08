import { PrismaClient } from '@prisma/client';
import { logger } from '@ingetin/logger';

const prisma = new PrismaClient();

async function createPartitions() {
    logger.info('Starting database partitioning script...');

    try {
        // 1. Rename existing tables
        logger.info('Renaming existing tables if they exist and are not partitioned...');
        await prisma.$executeRawUnsafe(`ALTER TABLE IF EXISTS "messages" RENAME TO "messages_old";`);
        await prisma.$executeRawUnsafe(`ALTER TABLE IF EXISTS "usage_logs" RENAME TO "usage_logs_old";`);

        // 2. Create partitioned messages table
        logger.info('Creating partitioned messages table...');
        await prisma.$executeRawUnsafe(`
            CREATE TABLE "messages" (
                "id" TEXT NOT NULL,
                "whatsappId" TEXT NOT NULL,
                "from" TEXT NOT NULL,
                "to" TEXT NOT NULL,
                "body" TEXT NOT NULL,
                "direction" "MessageDirection" NOT NULL,
                "messageType" "MessageType" NOT NULL DEFAULT 'NOTIF',
                "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
                "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "userId" TEXT,
                CONSTRAINT "messages_pkey" PRIMARY KEY ("id", "timestamp")
            ) PARTITION BY RANGE ("timestamp");
        `);

        // 3. Create partitions for messages
        await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS messages_y2026m04 PARTITION OF messages FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');`);
        await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS messages_y2026m05 PARTITION OF messages FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');`);
        await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS messages_y2026m06 PARTITION OF messages FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');`);

        // 4. Create partitioned usage_logs table
        logger.info('Creating partitioned usage_logs table...');
        await prisma.$executeRawUnsafe(`
            CREATE TABLE "usage_logs" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "type" "UsageType" NOT NULL,
                "target" TEXT NOT NULL,
                "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
                "status" TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id", "createdAt")
            ) PARTITION BY RANGE ("createdAt");
        `);

        // 5. Create partitions for usage_logs
        await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS usage_logs_y2026m04 PARTITION OF usage_logs FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');`);
        await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS usage_logs_y2026m05 PARTITION OF usage_logs FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');`);
        await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS usage_logs_y2026m06 PARTITION OF usage_logs FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');`);

        // Create indexes
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "messages_userId_idx" ON "messages"("userId");`);
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "messages_whatsappId_key" ON "messages"("whatsappId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "usage_logs_userId_idx" ON "usage_logs"("userId");`);

        // 6. Migrate data (Optional, handle constraints)
        logger.info('Migrating data from old tables...');
        try {
             await prisma.$executeRawUnsafe(`INSERT INTO "messages" SELECT * FROM "messages_old" ON CONFLICT DO NOTHING;`);
             await prisma.$executeRawUnsafe(`INSERT INTO "usage_logs" SELECT * FROM "usage_logs_old" ON CONFLICT DO NOTHING;`);
             await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "messages_old";`);
             await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "usage_logs_old";`);
        } catch (migErr) {
             logger.warn({ msg: 'Data migration skipped or failed (possibly empty or missing old tables)', err: migErr });
        }

        logger.info('Database partitioning script completed successfully.');
    } catch (error: any) {
        logger.error({ msg: 'Failed to create partitions', error: error.message });
    } finally {
        await prisma.$disconnect();
    }
}

createPartitions();
