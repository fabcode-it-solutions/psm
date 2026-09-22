import AnnouncementBar from "@/component/sections/homepage/AnnouncementBar";
import { SidebarMainMenu } from "@/component/sections/setting/SideBarMenu";
import { authOptions } from "@/libs/next-auth/auth";
import { getServerSession } from "next-auth";
import React from "react";

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
    <main className="">
      <AnnouncementBar initialUser={data.user} />
      <div className="flex w-full gap-[20px] min-h-screen max-tab-sm:flex-col ">
        <SidebarMainMenu />
        {children}
      </div>
    </main>
  );
}
