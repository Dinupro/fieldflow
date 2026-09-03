import "dotenv/config";
import { auth } from "../lib/auth.ts";

async function checkSessionUser() {
  console.log("Auth configured:", typeof auth);
}

checkSessionUser();
