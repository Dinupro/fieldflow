import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verifyWorkOrderFkey() {
  const client = await pool.connect();
  try {
    // Check WorkOrder foreign keys
    const fkeys = await client.query(`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND (tc.table_name = 'WorkOrder' OR tc.table_name = 'work_order');
    `);
    console.log("WorkOrder foreign keys:", fkeys.rows);

    // If WorkOrder points to "Technician" (PascalCase), let's ensure "technician" (lowercase) or "Technician" works seamlessly:
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'WorkOrder_technicianId_fkey'
        ) THEN
          ALTER TABLE "WorkOrder" 
            ADD CONSTRAINT "WorkOrder_technicianId_fkey" 
            FOREIGN KEY ("technicianId") REFERENCES "technician"("id") ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    console.log("✓ WorkOrder foreign key verified");
  } catch (err) {
    console.error("Fkey check:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyWorkOrderFkey();
