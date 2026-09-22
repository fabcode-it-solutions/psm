import React from "react";
import AnnouncementBar from "@/component/sections/homepage/AnnouncementBar";
import MainHeader from "@/layouts/header/MainHeader";
import Footer from "@/layouts/footer/Footer";
import Wrapper from "../dashboard/Wrapper";
import CreateWishlist from "@/component/sections/wishlist/CreateWishlist";
import { authOptions } from "@/libs/next-auth/auth";
import { getServerSession } from "next-auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_PATH}/user?id=${userId}`,
    {
      cache: "force-cache",
      next: { revalidate: 3600 },
    }
  );

  const data = await response.json();
  return (
    <div>
      <AnnouncementBar initialUser={data.user} />
      <MainHeader />
      <Wrapper>{children}</Wrapper>
      <CreateWishlist />
      <Footer />
    </div>
  );
}
