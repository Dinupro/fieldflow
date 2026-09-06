import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  console.log("Connected to PostgreSQL. Creating Notification system tables...");

  try {
    // 1. Create NotificationType enum
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "NotificationType" AS ENUM (
          'WORK_ORDER_CREATED',
          'WORK_ORDER_ASSIGNED',
          'WORK_ORDER_ACCEPTED',
          'WORK_ORDER_IN_PROGRESS',
          'WORK_ORDER_PAUSED',
          'WORK_ORDER_COMPLETED',
          'WORK_ORDER_CANCELLED',
          'WORK_ORDER_CLOSED',
          'SYSTEM_ALERT'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("✓ Created/verified 'NotificationType' enum.");

    // 2. Create notification table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "notification" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL,
        "workOrderId" UUID,
        "type" "NotificationType" NOT NULL,
        "title" VARCHAR(150) NOT NULL,
        "message" TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "readAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "notification_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "notification_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);
    console.log("✓ Created/verified 'notification' table.");

    // 3. Create indices
    await client.query(`
      CREATE INDEX IF NOT EXISTS "notification_userId_isRead_idx" ON "notification"("userId", "isRead");
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "notification_createdAt_idx" ON "notification"("createdAt");
    `);
    console.log("✓ Created notification indices.");

    console.log("Notification schema migration completed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
