import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function inspectWorkOrderTable() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'WorkOrder' OR table_name = 'work_order'
      ORDER BY ordinal_position;
    `);
    console.log("WorkOrder table columns:", res.rows);
  } catch (err) {
    console.error("Inspect error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

inspectWorkOrderTable();
