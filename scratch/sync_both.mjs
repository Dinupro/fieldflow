import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function syncAll() {
  const client = await pool.connect();
  try {
    // Add columns to "Technician" (PascalCase table)
    await client.query(`
      ALTER TABLE IF EXISTS "Technician" 
        ALTER COLUMN "userId" DROP NOT NULL;
    `);
    await client.query(`
      ALTER TABLE IF EXISTS "Technician"
        ADD COLUMN IF NOT EXISTS "email" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "specialization" VARCHAR(100),
        ADD COLUMN IF NOT EXISTS "serviceArea" VARCHAR(100),
        ADD COLUMN IF NOT EXISTS "notes" TEXT,
        ADD COLUMN IF NOT EXISTS "avatar" TEXT,
        ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP;
    `);
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'Technician_email_key'
        ) THEN
          ALTER TABLE IF EXISTS "Technician" ADD CONSTRAINT "Technician_email_key" UNIQUE ("email");
        END IF;
      END $$;
    `);

    console.log("✓ Synchronized Technician table successfully");
  } catch (err) {
    console.error("Sync error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

syncAll();
