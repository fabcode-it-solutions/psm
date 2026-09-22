// src/app/api/db/stats/route.ts

import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();

  try {
    // Check if DB is alive & get a client
    const client = await pool.connect();
    client.release();

    // Get connection state from PostgreSQL system catalog
    const result = await pool.query(`
      SELECT state, COUNT(*) 
      FROM pg_stat_activity 
      WHERE datname = current_database()
      GROUP BY state;
    `);

    const byState = result.rows.map(r => ({
      state: r.state,
      count: Number(r.count),
    }));

    // connections by user
    const users = await pool.query(`
      SELECT usename, COUNT(*)
      FROM pg_stat_activity
      WHERE datname = current_database()
      GROUP BY usename;
    `);

    const byUser = users.rows.map(r => ({
      usename: r.usename,
      count: Number(r.count),
    }));

    const stats = {
      success: true,
      timestamp: new Date().toISOString(),

      server: {
        pid: process.pid,
        hostname: process.env.HOSTNAME ?? "local",
        nodeVersion: process.version,
      },

      db: {
        usedConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingRequests: pool.waitingCount,
        maxConnections: pool.options.max,

        connectionStates: byState,
        connectionsByUser: byUser,
      },

      perf: {
        elapsedMs: Date.now() - start,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
