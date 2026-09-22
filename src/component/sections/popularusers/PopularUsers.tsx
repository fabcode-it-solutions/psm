"use client";
import React from "react";
import HeadingSlideButtons from "../../global/HeadingSlideButtons";
import { ApiUserLite } from "@/types";
import UserCards, { User } from "../AllCards/UserCards";
import { useAppSelector } from "@/libs/redux/hooks";
import {
  selectIsBlocked,
  selectIsPrivate,
} from "@/libs/redux/selectors/selectors";

const PopularUsers = ({
  popularUser,
  heading,
  profile,
}: {
  popularUser: ApiUserLite[];
  heading?: string;
  profile?: boolean;
}) => {
  const isPrivate = useAppSelector(selectIsPrivate);
  const isBlocked = useAppSelector(selectIsBlocked);
  if (profile && (isPrivate || isBlocked)) {
    return null;
  }
  return (
    <section className="w-full max-w-[1272px] mx-auto py-12 max-tab-sm:px-[16px] max-des-md:px-[30px] relative">
      <div className="mb-6">
        <HeadingSlideButtons
          heading={heading || "Popular users"}
          buttonLink="/profile/popular-users"
          isButtons={false}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3  gap-4">
        {popularUser &&
          popularUser.length > 0 &&
          popularUser.map((user, index) => (
            <UserCards user={user as User} key={`users-popular-${index}`} />
          ))}
      </div>
    </section>
  );
};

export default PopularUsers;
