import CarBrand from "@/component/sections/auth/SelectCarBrand";
import React, { Suspense } from "react";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const searchParam = await searchParams;
  const step = searchParam?.step;
  let brands = [];
  if (step == "brand" || !step) {
    const brandResponse = await fetch(
      process.env.NEXT_PUBLIC_API_PATH + "/admin/cars/brands",
      {
        next: {
          tags: ["brands"],
        },
      }
    );

    brands = await brandResponse.json();
  }
  return (
    <div>
      <Suspense>
        <CarBrand
          brands={brands?.data}
          slug={slug}
        />
      </Suspense>
    </div>
  );
}
