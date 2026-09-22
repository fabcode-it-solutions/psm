import SingleReport from "@/component/sections/setting/reports/SingleReport";
import { db } from "@/db/db";
import { userReports } from "@/db/schema/userBlocks";
import { notFound } from "next/navigation";
import React from "react";
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const userIds = await db.select({ id: userReports.id }).from(userReports);
    const ids = userIds.map((item) => ({ reportId: item.id.toString() }));
    return ids;
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

interface ProfilePageProps {
  params: Promise<{ reportId: string }>;
}

const page = async ({ params }: ProfilePageProps) => {
  const { reportId } = await params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_PATH}/user/report?id=${reportId}`,
    {
      cache: "no-store",
    }
  );
  const jsonData = await res.json();
  if (!res.ok) {
    return notFound();
  }
  return (
    <div>
      <SingleReport report={jsonData.data} />
    </div>
  );
};

export default page;
