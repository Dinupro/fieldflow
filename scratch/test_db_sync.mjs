import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function syncSchema() {
  console.log("=== Synchronizing Neon PostgreSQL Database Schema for Technician Model ===");

  try {
    const client = await pool.connect();
    console.log("✓ Connected to Neon PostgreSQL database.");

    // Check all tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log("Existing tables in database:", tablesRes.rows.map(r => r.table_name));

    // Create enum TechnicianStatus if not exists
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TechnicianStatus') THEN
          CREATE TYPE "TechnicianStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFF');
        END IF;
      END $$;
    `);
    console.log("✓ Ensured TechnicianStatus enum exists");

    // Ensure technician table exists with all fields
    await client.query(`
      CREATE TABLE IF NOT EXISTS "technician" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID UNIQUE,
        "name" VARCHAR(100) NOT NULL,
        "email" VARCHAR(255) UNIQUE,
        "phone" VARCHAR(20),
        "specialization" VARCHAR(100),
        "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "status" "TechnicianStatus" NOT NULL DEFAULT 'AVAILABLE',
        "serviceArea" VARCHAR(100),
        "notes" TEXT,
        "avatar" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP
      );
    `);
    console.log("✓ Ensured technician table exists with all columns");

    // Check if foreign key to user exists
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'technician_userId_fkey'
        ) THEN
          ALTER TABLE "technician" 
            ADD CONSTRAINT "technician_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    console.log("✓ Ensured foreign key constraint technician_userId_fkey");

    // Verify columns
    const cols = await client.query(`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'technician';
    `);
    console.log("✓ Verified columns:", cols.rows.map(r => `${r.column_name} (${r.data_type})`));

    client.release();
    console.log("\n=== Neon PostgreSQL Schema Sync Succeeded! ===");
  } catch (err) {
    console.error("Schema sync failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

syncSchema();
