import ReportDetail from "@/component/dashboard/reports/ReportDetail";
import { db } from "@/db/db";
import { users } from "@/db/schema/auth";
import { userReports } from "@/db/schema/userBlocks";
import { media } from "@/db/schema/media";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;

  const reporter = alias(users, "reporter");
  const reported = alias(users, "reported");

  const reportQuery = await db
    .select({
      id: userReports.id,
      reportId: userReports.reportId,
      reason: userReports.reason,
      description: userReports.description,
      category: userReports.category,
      status: userReports.status,
      reporterUsername: reporter.username,
      reportedUsername: reported.username,
      imageUrl: media.url,
    })
    .from(userReports)
    .leftJoin(reporter, eq(reporter.id, userReports.reporterUserId))
    .leftJoin(reported, eq(reported.id, userReports.reportedUserId))
    .leftJoin(media, eq(media.id, userReports.imageMediaId))
    .where(eq(userReports.id, Number(id)));

  if (!reportQuery.length) {
    return <div className="p-6 text-red-500">Report not found</div>;
  }

  const reportData = reportQuery[0];

  const sanitizedReport = {
    id: reportData.id,
    reportId: reportData.reportId,
    reason: reportData.reason || "",
    description: reportData.description || "",
    category: reportData.category || "",
    status: reportData.status || "pending",
    reporterUsername: reportData.reporterUsername || "Anonymous",
    reportedUsername: reportData.reportedUsername || "Anonymous",
    imageUrl: reportData.imageUrl || null,
  };

  return <ReportDetail report={sanitizedReport} />;
}
