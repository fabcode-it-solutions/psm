import { getClientIp, getDeviceInfo } from "@/utils/block";
import { db } from "@/db/db";

import { NextRequest } from "next/server";
import { userActivities, userActivityType } from "@/db/schema/parts";

export async function logUserActivity({
  userId,
  entityType,
  notes,
  req,
}: {
  userId: number;
  entityType: typeof userActivityType.enumValues[number]; 
  notes?: string;
  req?: NextRequest;
}) {
  let ipAddress = "unknown";
  let deviceFingerprint = "unknown";
  let userAgent = "unknown";

  if (req) {
    ipAddress = getClientIp(req);
    const deviceInfo = getDeviceInfo(req);
    deviceFingerprint = deviceInfo.deviceFingerprint;
    userAgent = deviceInfo.userAgent;
  }

  await db.insert(userActivities).values({
    userId,
    entityType, // ✅ now matches pgEnum
    notes,
    ipAddress,
    deviceFingerprint,
    userAgent,
  });
}
