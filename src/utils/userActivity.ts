import { db } from "@/db/db";
import { userActivities } from "@/db/schema/auth";
import { eq, desc, and } from "drizzle-orm";

export const getLastLoginDate = async (userId: number): Promise<Date | null> => {
  try {
    const lastLogin = await db
      .select({
        createdAt: userActivities.createdAt,
      })
      .from(userActivities)
      .where(
        and(
          eq(userActivities.userId, userId),
          eq(userActivities.entityType, "login")
        )
      )
      .orderBy(desc(userActivities.createdAt))
      .limit(1);

    return lastLogin[0]?.createdAt || null;
  } catch (error) {
    console.error("Error fetching last login date:", error);
    return null;
  }
};

export const getLastLoginDatesForUsers = async (userIds: number[]): Promise<Record<number, Date | null>> => {
  try {
    if (userIds.length === 0) return {};

    const lastLogins = await db
      .select({
        userId: userActivities.userId,
        createdAt: userActivities.createdAt,
      })
      .from(userActivities)
      .where(
        and(
          eq(userActivities.entityType, "login")
        )
      )
      .orderBy(desc(userActivities.createdAt));

    // Group by userId and get the most recent login for each user
    const loginMap: Record<number, Date | null> = {};
    
    // Initialize all users with null
    userIds.forEach(id => {
      loginMap[id] = null;
    });

    // Fill in the actual last login dates
    lastLogins.forEach(login => {
      if (userIds.includes(login.userId) && !loginMap[login.userId]) {
        loginMap[login.userId] = login.createdAt;
      }
    });

    return loginMap;
  } catch (error) {
    console.error("Error fetching last login dates:", error);
    return {};
  }
};

export const recordUserActivity = async (userId: number, activityType: "login" | "logout" | "block" | "unblock" | "password_change" | "profile_update" | "email_verify" | "suspend", notes?: string): Promise<void> => {
  try {
    await db.insert(userActivities).values({
      userId,
      entityType: activityType,
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error recording user activity:", error);
  }
};