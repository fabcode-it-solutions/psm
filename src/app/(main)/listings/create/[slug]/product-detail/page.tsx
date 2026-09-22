import ProductAddressDetails from "@/component/sections/CreateListings/ProductAddressDetails";
import { authOptions } from "@/libs/next-auth/auth";
import { getServerSession } from "next-auth";
import React from "react";
const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
 const session = await getServerSession(authOptions);
 const userId = session?.user.id;
  return (
    <div>
      <ProductAddressDetails slug={slug} userId={userId ?? 20} />
    </div>
  );
};

export default Page;
