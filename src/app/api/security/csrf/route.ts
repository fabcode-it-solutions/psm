// src/app/api/security/csrf/route.ts
import { NextResponse } from "next/server";
import { getCSRFToken } from "@/libs/security/csrf";

export async function GET() {
  const token = await getCSRFToken();
  return NextResponse.json({ token });
}
