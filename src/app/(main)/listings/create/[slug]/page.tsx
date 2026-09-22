import CreateListings from "@/component/sections/CreateListings/CreateListings";
import { authOptions } from "@/libs/next-auth/auth";
import { getServerSession } from "next-auth";
import React from "react";

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;
  return (
    <div>
      <CreateListings slug={slug} userId={ userId ?? 20} />
    </div>
  );
}
