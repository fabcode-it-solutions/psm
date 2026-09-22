"use client";
import React from "react";
import HeadingSlideButtons from "@/component/global/HeadingSlideButtons";
import FollowedProduct from "./FollowedProduct";
import FollowedBuild from "./FollowedBuild";
import FollowedList from "./FollowedList";
import { WishlistCategoryWithImage } from "@/types/wishlist.types";
import { SearchResponsePart, SearchResponseUser } from "@/app/api/search/route";
import PopularUsers from "../popularusers/PopularUsers";
import { ApiUserLite } from "@/types";
import {
  selectIsBlocked,
  selectIsPrivate,
} from "@/libs/redux/selectors/selectors";
import { useAppSelector } from "@/libs/redux/hooks";

interface CategoryResposne {
  success: boolean;
  data: WishlistCategoryWithImage;
  users: SearchResponseUser[];
  parts: SearchResponsePart[];
  allCount: number;
}

const UserWhisList = ({
  userId,
  category,
}: {
  userId: number;
  category: CategoryResposne;
}) => {
  const isPrivate = useAppSelector(selectIsPrivate);
  const isBlocked = useAppSelector(selectIsBlocked);
  if (isPrivate || isBlocked) {
    return null;
  }
  return (
    <div>
      <div className="mt-[5px] max-w-[1332px] w-full mx-auto px-[30px] max-tab-sm:px-4">
        <HeadingSlideButtons
          heading="MY COLLECTIONS"
          isButtons={false}
          rightArrowClass="arrow-left-main"
          leftArrowClass="arrow-right-main"
          hideRightSide
        />
        <div className=" p-[24px] rounded-[10px] bg-[#F4F4F4]">
          <span className="min-h-[78px]  flex gap-[12px] flex-col">
            <h2 className="text-xl leading-[1.35] font-bold tracking-[-0.17px] text-[#002029] max-w-[141px]">
              {category.data.name || "All Saved Items"}
            </h2>
            <p className="underline text-sm font-bold tracking-[0.14] leading-[1.358] w-fit pb-[12px]">
              {category.allCount || 0} items Added
            </p>
          </span>
        </div>
      </div>
      {category.users.length > 0 && (
        <PopularUsers
          heading="Users"
          popularUser={category.users as ApiUserLite[]}
        />
      )}
      <FollowedBuild />

      <FollowedProduct />
      <FollowedList />
    </div>
  );
};

export default UserWhisList;
