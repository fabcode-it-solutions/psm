import React from "react";
import MessageSideBar from "@/component/messages/MessageSideBar";
import { conversationService } from "@/services/conversation.services";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth/auth";
import AnnouncementBar from "@/component/sections/homepage/AnnouncementBar";
import MainHeader from "@/layouts/header/MainHeader";
import Footer from "@/layouts/footer/Footer";
import Wrapper from "../dashboard/Wrapper";
import MobileMessageLayout from "@/component/messages/MobileMessageLayout";
export default async function MessageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  const data = await conversationService.getConversations({
    senderId: userId,
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_PATH}/user?id=${userId}`,
    {
      cache: "force-cache",
      next: { revalidate: 3600 },
    }
  );
  const userdata = await response.json();
  return (
    <div>
      <AnnouncementBar initialUser={userdata.user} />
      <MainHeader />
      <div className="h-[calc(100dvh-150px)] flex max-md:hidden">
        <MessageSideBar intialChats={data} />
        <Wrapper className="w-full h-[calc(100dvh-150px)]"> {children}</Wrapper>
      </div>
      
      <div className="hidden max-md:block h-[calc(100dvh-150px)]">
        <MobileMessageLayout intialChats={data}>{children}</MobileMessageLayout>
      </div>

      <Footer />
    </div>
  );
}
