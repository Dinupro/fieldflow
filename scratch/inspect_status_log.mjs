import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function inspectStatusLog() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'StatusLog' OR table_name = 'status_log'
      ORDER BY ordinal_position;
    `);
    console.log("StatusLog columns:", res.rows);
  } catch (err) {
    console.error("StatusLog check error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

inspectStatusLog();
