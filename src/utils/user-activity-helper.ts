import { db } from "@/db/db";
import { userActivities } from "@/db/schema/parts";
import { eq, desc, } from "drizzle-orm";

/**
 * Get user's unique IP addresses and devices from recent activity
 */
export async function getUserRecentDevices(userId: number, limit = 10) {
  const activities = await db
    .select({
      id: userActivities.id,
      ipAddress: userActivities.ipAddress,
      deviceFingerprint: userActivities.deviceFingerprint,
      userAgent: userActivities.userAgent,
      lastActivity: userActivities.createdAt,
    })
    .from(userActivities)
    .where(eq(userActivities.userId, userId))
    .orderBy(desc(userActivities.createdAt))
    .limit(100); // Get last 100 activities
  const uniqueDevices = new Map<string, {
    ipAddress: string;
    deviceFingerprint: string;
    userAgent: string;
    lastActivity: Date;
    activityCount: number;
  }>();

  activities.forEach((activity) => {
    const key = `${activity.ipAddress}-${activity.deviceFingerprint}`;
    
    if (!uniqueDevices.has(key)) {
      uniqueDevices.set(key, {
        ipAddress: activity.ipAddress || "unknown",
        deviceFingerprint: activity.deviceFingerprint || "unknown",
        userAgent: activity.userAgent || "unknown",
        lastActivity: activity.lastActivity || new Date(),
        activityCount: 1,
      });
    } else {
      const existing = uniqueDevices.get(key)!;
      existing.activityCount++;
      // Keep the most recent activity date
      if (activity.lastActivity && activity.lastActivity > existing.lastActivity) {
        existing.lastActivity = activity.lastActivity;
      }
    }
  });

  return Array.from(uniqueDevices.values())
    .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
    .slice(0, limit);
}

/**
 * Get the most recent device used by user
 */
export async function getUserMostRecentDevice(userId: number) {
  const activity = await db
    .select({
      ipAddress: userActivities.ipAddress,
      deviceFingerprint: userActivities.deviceFingerprint,
      userAgent: userActivities.userAgent,
      createdAt: userActivities.createdAt,
    })
    .from(userActivities)
    .where(eq(userActivities.userId, userId))
    .orderBy(desc(userActivities.createdAt))
    .limit(1);

  return activity[0] || null;
}