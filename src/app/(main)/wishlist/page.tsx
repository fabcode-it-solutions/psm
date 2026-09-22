import ProfileCheck from "@/component/sections/profile/ProfileCheck";
import WishList from "@/component/sections/wishlist/WishList";
import { authOptions } from "@/libs/next-auth/auth";
import { getServerSession } from "next-auth";
import React from "react";

const page = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div>
      <ProfileCheck id={Number(session?.user.id)} />
      <WishList />
    </div>
  );
};

export default page;
