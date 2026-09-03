import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function inspectUserTable() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user'
      ORDER BY ordinal_position;
    `);
    console.log("User table columns:", res.rows);

    const users = await client.query(`SELECT id, email, name FROM "user" LIMIT 5;`);
    console.log("Sample users:", users.rows);
  } catch (err) {
    console.error("Inspect user error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

inspectUserTable();
