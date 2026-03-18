import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

export const db = new PrismaClient();

async function testConnection() {
  try {
    await db.$connect();
    console.log("✅ Database Connection Established");
  } catch (err) {
    console.error("❌ Database Connection Failed:", err);
  }
}

testConnection();
