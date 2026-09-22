import ProductAddress from "@/component/sections/CreateListings/ProductAddress";
import React from "react";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  return (
    <div>
      <ProductAddress slug={slug} userId={20} />
    </div>
  );
};

export default Page;