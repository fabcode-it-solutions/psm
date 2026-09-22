import ListingProductDetails from "@/component/sections/CreateListings/ListingProductDetails";
import { authOptions } from "@/libs/next-auth/auth";
import { getServerSession } from "next-auth";
import React from "react";
const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
 const session = await getServerSession(authOptions);
 const userId = session?.user.id;
  return (
    <div>
      <ListingProductDetails slug={slug} userId={userId ?? 20} />
    </div>
  );
};

export default Page;
