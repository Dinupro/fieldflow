import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function syncWorkOrderDb() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Connecting to Neon (attempt ${attempt})...`);
      const client = await pool.connect();
      try {
        await client.query(`
          ALTER TABLE IF EXISTS "WorkOrder"
            ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;
        `);
        console.log("✓ Added completedAt column to WorkOrder table successfully");
        return;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err.message);
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

syncWorkOrderDb()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
