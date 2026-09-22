import IconFacebookTag from "@/assets/icons/IconFacebookTag";
import IconInstagram from "@/assets/icons/IconInstagram";
import IconLinkedin from "@/assets/icons/IconLinkedin";
import IconTwitter from "@/assets/icons/IconTwitter";
import IconYoutube from "@/assets/icons/IconYoutube";
import { GetUserResponse } from "@/types";
import Link from "next/link";
import React from "react";

const SocialIcons = ({ user }: { user: GetUserResponse }) => {
  return (
    <span className="flex gap-1 w-fit">
      {user?.socialMedia?.facebook && (
        <Link href={user?.socialMedia.facebook} target="_blank">
          <IconFacebookTag className="cursor-pointer" />
        </Link>
      )}
      {user?.socialMedia?.instagram && (
        <Link href={user?.socialMedia.instagram} target="_blank">
          <IconInstagram className="cursor-pointer" />
        </Link>
      )}
      {user?.socialMedia?.youtube && (
        <Link href={user?.socialMedia.youtube} target="_blank">
          <IconYoutube className="cursor-pointer" />
        </Link>
      )}
      {user?.socialMedia?.twitter && (
        <Link href={user?.socialMedia.twitter} target="_blank">
          <IconTwitter className="cursor-pointer" />
        </Link>
      )}
      {user?.socialMedia?.linkedIn && (
        <Link href={user?.socialMedia.linkedIn} target="_blank">
          <IconLinkedin className="cursor-pointer" stroke="#002029" />
        </Link>
      )}
    </span>
  );
};

export default SocialIcons;
