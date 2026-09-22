/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { userReports } from "@/db/schema/userBlocks";
import { media } from "@/db/schema/media";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";

interface StatusEntry {
  label: string;
  timestamp?: string;
}

interface ReviewReportRequest {
  reportId: number;
  adminId: number;
  adminNotes?: string;
  statusRecord?: StatusEntry[];
}

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  try {
    const { reportId, adminId, adminNotes, statusRecord = [] }: ReviewReportRequest = await req.json();

    if (!reportId || !adminId) {
      return NextResponse.json(
        { success: false, message: "reportId and adminId are required" },
        { status: 400 }
      );
    }

    const report = await db
      .select({
        report: userReports,
        mediaUrl: media.url,
      })
      .from(userReports)
      .leftJoin(media, eq(userReports.imageMediaId, media.id))
      .where(eq(userReports.id, reportId));

    if (!report.length) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    const existingReport = report[0].report;
    const newStatus = adminNotes ? "resolved" : "reviewed";

  
    //if (
     // existingReport.status === "reviewed" ||
      //existingReport.status === "resolved"
    //)
    
   // {
      //return NextResponse.json(
       // { success: false, message: `Report already ${existingReport.status}` },
        //{ status: 400 }
     // );
    //}

    const currentStatusRecord: StatusEntry[] = Array.isArray(existingReport.statusRecord)
      ? (existingReport.statusRecord as StatusEntry[]).map((entry: any) => ({
          label: entry.label || "Unknown",
          timestamp: entry.timestamp,
        }))
      : [];

    const newEntries: StatusEntry[] = statusRecord.map((entry) => ({
      label: entry.label,
      timestamp: entry.timestamp || new Date().toISOString(),
    }));

    const updatedStatusRecord: StatusEntry[] = [...currentStatusRecord, ...newEntries];

    const updated = await db
      .update(userReports)
      .set({
        status: newStatus,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        adminNotes: adminNotes || existingReport.adminNotes || null,
        statusRecord: updatedStatusRecord,
        updatedAt: new Date(),
      })
      .where(eq(userReports.id, reportId))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Report ${newStatus} successfully`,
      data: {
        ...updated[0],
        imageUrl: report[0].mediaUrl || null,
      },
    });
  } catch (error) {
    console.error("Error reviewing/resolving report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update report" },
      { status: 500 }
    );
  }
}
)