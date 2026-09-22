import { db } from "@/db/db";
import { users } from "@/db/schema/auth";
import { sql } from "drizzle-orm";

interface SignupRow {
  date: string; // returned by SQL as string
  count: string;
}

interface DayData {
  date: string;
  count: number;
}

export async function GET() {
  try {
    // Fetch signups grouped by DAY for last 30 days
    const results = await db.execute(sql`
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at);
    `);

    const today = new Date();
    const last30Days: DayData[] = [];

    // Generate last 30 days array
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      const dateStr = d.toISOString().split("T")[0];

      const found = (results.rows as unknown as SignupRow[]).find((r) => {
        const rowDate = new Date(r.date).toISOString().split("T")[0];
        return rowDate === dateStr;
      });

      last30Days.push({
        date: dateStr,
        count: found ? Number(found.count) : 0,
      });
    }

    return Response.json({ data: last30Days });
  } catch (err) {
    console.error("Signup stats error", err);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
