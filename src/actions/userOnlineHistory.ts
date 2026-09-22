"use server";

import { db } from "@/db/db";
import { userOnlineHistory, users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

export async function userHistory(username: string) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (user) {
    await db.insert(userOnlineHistory).values({
      userId: user.id,
    });
  }
  return { success: true };
}
