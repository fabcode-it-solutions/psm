// db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getPoolConfig } from "./pool-config";
import { schema } from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

declare global {
  var pgPool: Pool | undefined;
  var drizzleDb: ReturnType<typeof drizzle> | undefined;
  var poolInitialized: boolean | undefined; // 👈 NEW
}

// Create pool with retry logic
const createPoolWithRetry = (maxRetries = 3): Pool => {
  let retries = 0;
  const config = getPoolConfig();

  const pool = global.pgPool ?? new Pool(config);

  // Print only ONCE when pool created
  if (!global.poolInitialized) {
    global.poolInitialized = true;
  }

  // Retry on errors
  pool.on("error", async (err) => {
    console.error("❌ Database error:", err.message);

    if (retries < maxRetries) {
      retries++;
      console.log(`🔄 Reconnecting (${retries}/${maxRetries})...`);

      try {
        await pool.query("SELECT 1");
        retries = 0;
        console.log("✅ Reconnected successfully");
      } catch (reconnectErr) {
        console.error("❌ Reconnection failed");
      }
    }
  });

  // Show connection count (optional)
  pool.on("connect", () => {
    console.log(`🔌 New PG connection → Total: ${pool.totalCount}`);
  });

  return pool;
};

// Create or reuse pool
const pool = createPoolWithRetry();

// Create or reuse drizzle instance
const db =
  global.drizzleDb ??
  drizzle(pool, {
    schema: schema,
    // logger: process.env.NODE_ENV === "development",
  });

// Store in global (Next.js hot reload fix)
if (process.env.NODE_ENV !== "production") {
  global.pgPool = pool;
  global.drizzleDb = db;
}

// Health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const result = await pool.query("SELECT NOW()");
    return result.rows.length > 0;
  } catch (error) {
    console.error("❌ Health check failed:", error);
    return false;
  }
};

export { pool, db };
