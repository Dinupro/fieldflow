import "dotenv/config";
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  const tables = ['user', 'customer', 'technician', '"Technician"', '"WorkOrder"', '"StatusLog"'];
  for (const t of tables) {
    try {
      const res = await client.query(`SELECT count(*) FROM ${t}`);
      console.log(`${t} count:`, res.rows[0].count);
    } catch (e) {
      console.log(`${t} error:`, e.message);
    }
  }
  const users = await client.query(`SELECT id, email, role, name FROM "user"`);
  console.log("Users:", users.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
