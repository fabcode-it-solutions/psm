import IconEdit from "@/assets/icons/IconEdit";
import Container from "@/component/ui/Container/Container";
import UploadInput from "@/component/ui/dashboard/media-upload/UploadInput";
import { UploadFileType } from "@/types";
import Image from "next/image";
import React from "react";
import ShareProfile from "./ShareProfile";

const ProfileCover = ({
  coverImage,
  otherUser,
  setImage,
}: {
  coverImage: string;
  otherUser: boolean;
  setImage: React.Dispatch<React.SetStateAction<UploadFileType>>;
}) => {
  return (
    <div className="w-full relative pb-[32.1428571%] max-tab-sm:pb-[100%]">
      <Image
        width={1920}
        height={1080}
        src={coverImage}
        alt="profile-image"
        unoptimized
        className="absolute top-0 left-0 w-full h-full object-cover object-center"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black/30"></div>
      {!otherUser && (
        <Container className="absolute top-[19px] left-0 right-0 w-full">
          <div className="flex gap-2 items-center justify-end w-full">
            <ShareProfile />
            <UploadInput
              setImageFile={setImage}
              required={false}
              label="upload"
              mode="accounts"
              className="!w-auto"
              trigger={
                <button className="bg-accent-100 w-12 h-12 flex justify-center items-center rounded-full">
                  <IconEdit fill="#fff" className="w-6 h-6" />
                </button>
              }
            />
          </div>
        </Container>
      )}
    </div>
  );
};

export default ProfileCover;
