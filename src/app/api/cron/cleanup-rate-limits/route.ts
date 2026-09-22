import { NextResponse } from "next/server";
import { lt } from "drizzle-orm";
import { rateLimits } from "@/db/schema/rateLimits";
import { db } from "@/db/db";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cutoff = new Date(Date.now() - 60 * 60 * 1000); 
  await db.delete(rateLimits).where(lt(rateLimits.createdAt, cutoff));
  return NextResponse.json({ success: true, message: "Rate limits cleaned" });
}
