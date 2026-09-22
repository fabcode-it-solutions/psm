import IconRightArrow from "@/assets/icons/IconRightArrow";
import IconUserCar from "@/assets/icons/IconUserCar";
import IconUserPoints from "@/assets/icons/IconUserPoints";
import IconUserProfile from "@/assets/icons/IconUserProfile";
import Image from "next/image";
import Link from "next/link";
import React from "react";
export type User = {
  id: number;
  username: string;
  profileImage: string;
  followersCount: number;
  buildsCounts: number;
  listingCounts: number;
  followers: { id: number; username: string; profileImage: string }[];
};
const UserCards = ({ user }: { user: User }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-s  w-full overflow-x-hidden ">
      <div className="flex gap-4">
        <Image
          src={
            user.profileImage ||
            "https://overlap-asset.s3.ap-south-1.amazonaws.com/images/4aa6adce0e06f96ffcb97cb37acf96659f50f680_1755595055213.png"
          }
          alt={user.username || "Profile Image"}
          width={120}
          height={120}
          className="min-w-[120px] max-w-[120px] w-full h-[117px]  rounded-full object-cover max-mb-md:w-[120px] max-mb-md:h-[120px]"
        />
        <div className="flex flex-col gap-4 w-full">
          <div>
            <h3 className="text-xl text-dark-blue-cm font-supreme leading-[100%] tracking-[1%] ">
              {user.username}
            </h3>
          </div>
          <div className="flex items-center justify-between text-xl text-dark-blue-cm font-supreme leading-[100%] tracking-[1%]">
            <div className="flex items-center gap-1 leading-[100%] tracking-[1%]">
              <IconUserProfile /> {user.followersCount}
            </div>
            <div className="flex items-center gap-1 leading-[100%] tracking-[1%]">
              <IconUserCar /> {user.buildsCounts}
            </div>
            <div className="flex items-center gap-1 leading-[100%] tracking-[1%]">
              <IconUserPoints /> {user.listingCounts}
            </div>
          </div>
          {user.followers.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-6">
                {user.followers.map((item, index) => (
                  <div
                    key={item.id * index + 1}
                    className={`relative w-9 h-[35px] rounded-full overflow-hidden border border-white z-[${
                      user.followers.length - index
                    }]`}
                  >
                    <Image
                      src={item.profileImage || "/assets/images/usercar12.jpg"}
                      alt={"Profile Image"}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                    {index > 0 && (
                      <div className="absolute inset-0 bg-white/50"></div>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-base text-dark-blue-cm font-supreme font-bold leading-[24px] tracking-[1%]">
                {user.followers[0]?.username || ""} and others
              </span>
            </div>
          )}
          <div className="flex justify-end">
            <Link
              href={`/profile/${user.id}`}
              className="text-accent-100 font-supreme text-base flex items-center font-bold gap-4 leading-[24px] tracking-[1%]"
            >
              View User <IconRightArrow isActive />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCards;
