import "dotenv/config";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

async function testAuth() {
  console.log("Better-auth API keys:", Object.keys(auth.api || {}));
}

testAuth().catch(console.error);
