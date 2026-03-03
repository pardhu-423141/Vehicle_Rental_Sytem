import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERROR: DATABASE_URL is missing in .env file");
  process.exit(1);
}

// 1. Create a standard Postgres connection pool
const pool = new Pool({ connectionString });

// 2. Wrap it in the Prisma Postgres Adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter into the PrismaClient as required by Prisma 7
export const db = new PrismaClient({ adapter });

async function testConnection() {
  try {
    await db.$connect();
    console.log("✅ Database Connection Established (Prisma 7 Adapter)");
  } catch (err) {
    console.error("❌ Database Connection Failed:", err);
  }
}

testConnection();