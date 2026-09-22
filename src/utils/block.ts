

import { NextRequest } from "next/server";
import { db } from "@/db/db";
import { eq, or } from "drizzle-orm";
import { bannedDevices } from "@/db/schema/userBlocks";

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  
  return (
    cfConnectingIp ||
    (forwarded ? forwarded.split(",")[0].trim() : null) ||
    realIp ||
    "unknown"
  );
}


export function getDeviceInfo(req: NextRequest) {
  const userAgent = req.headers.get("user-agent") || "unknown";
  const acceptLanguage = req.headers.get("accept-language") || "";
  const acceptEncoding = req.headers.get("accept-encoding") || "";
  
  const fingerprint = Buffer.from(
    `${userAgent}-${acceptLanguage}-${acceptEncoding}`
  ).toString("base64");
  
  return {
    userAgent,
    deviceFingerprint: fingerprint,
  };
}

/**
 * Checks if a device or IP address is currently banned
 * Also cleans up expired bans
 */
export async function isDeviceOrIpBanned(
  ipAddress: string,
  deviceFingerprint: string
): Promise<boolean> {
  const banned = await db
    .select()
    .from(bannedDevices)
    .where(
      or(
        eq(bannedDevices.ipAddress, ipAddress),
        eq(bannedDevices.deviceFingerprint, deviceFingerprint)
      )
    )
    .limit(1);

  if (banned.length === 0) return false;

  const ban = banned[0];
  if (ban.expiresAt && new Date() > ban.expiresAt) {
   
    await db.delete(bannedDevices).where(eq(bannedDevices.id, ban.id));
    return false;
  }

  return true;
}

