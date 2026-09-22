import IconDismissCircle from "@/assets/icons/IconDismissCircle";
import InputField from "@/component/ui/Input/Input";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import SocialMediaPopup from "./SocialMediaLinks";
import { RootState } from "@/libs/redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  Build,
  removeBuildField,
  setBuild,
  setIsExisting,
} from "@/libs/redux/slices/buildSlice";
import UploadInput from "@/component/ui/dashboard/media-upload/UploadInput";
import { UploadFileType } from "@/types";

const UserWithProfile = () => {
  const build = useSelector((state: RootState) => state.build.build);
  const user = useSelector((state: RootState) => state.user.user?.user);

  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ firstName: "", userName: "" });
  const [bio, setBio] = useState(build?.bio || "");
  const [image, setImage] = useState<UploadFileType>({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const maxCharCount = 300;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update build field helper
  const updateBuild = useCallback(
    (key: keyof Build, value: string | null) => {
      dispatch(setBuild({ ...build, [key]: value }));
    },
    [dispatch, build]
  );

  const handleChange = useCallback(
    (field: keyof Build) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      updateBuild(field, e.target.value);
      if (build?.isExisting) {
        dispatch(setIsExisting(""));
      }
    },
    [updateBuild]
  );

  const handleClear = useCallback(
    (field: keyof Build) => () => {
      setFormData((prev) => ({ ...prev, [field]: "" }));
      dispatch(removeBuildField(field));
    },
    [dispatch]
  );

  const handleBioChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.value.length > maxCharCount) return;
      setBio(e.target.value);
      updateBuild("bio", e.target.value);
    },
    [updateBuild]
  );

  // Update profile image in redux
  useEffect(() => {
    if (image.url) updateBuild("profileImage", image.url);
  }, [image, updateBuild]);
  const checkUserName = async (value: string) => {
    if (value != user?.username && !build?.isExisting) {
      const checkUserName = await fetch(`/api/auth/check-username?q=${value}`);
      const checkUserNameResult = await checkUserName.json();

      if (checkUserNameResult.isExisting) {
        dispatch(
          setIsExisting(
            "This username is already exist please use another one or: " +
              checkUserNameResult.username
          )
        );
      }
    }
  };
  return (
    <div className="pt-5 max-w-[616px] flex flex-col gap-5 justify-center items-center">
      <div className="flex gap-4 justify-center items-center max-tab-sm:flex-wrap">
        {/* Profile Image Upload */}
        <div className="relative">
          <UploadInput
            setImageFile={setImage}
            required={false}
            label="upload"
            mode="accounts"
            trigger={
              <div>
                <Image
                  src={
                    image.url ||
                    "https://overlap-asset.s3.ap-south-1.amazonaws.com/images/4aa6adce0e06f96ffcb97cb37acf96659f50f680_1755595055213.png"
                  }
                  alt="User profile"
                  width={200}
                  height={200}
                  className="rounded-full object-cover w-[200px] h-[200px]"
                />
                <div
                  className="absolute right-2 bottom-3 cursor-pointer w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition"
                  title="Add profile image"
                >
                  <span className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                    <Image
                      src="/assets/images/plus.png"
                      alt="Add profile icon"
                      width={22}
                      height={22}
                    />
                  </span>
                </div>
              </div>
            }
          />
        </div>

        {/* User Info */}
        <div className="max-w-[400px] flex flex-col gap-4 max-tab-sm:max-w-full">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#606060]">
              User Name
            </label>
            <InputField
              placeholder="oaksoe123"
              value={
                formData.userName || build?.userName || user?.username || ""
              }
              onChange={handleChange("userName")}
              rightIcon={formData.userName ? <IconDismissCircle /> : undefined}
              onRightIconClick={handleClear("userName")}
              className="text-[#002029]"
              onBlur={(e) => checkUserName(e.target.value)}
              errorMessage={build?.isExisting}
              error={build?.isExisting ? true : false}
            />
          </div>

          <div className="flex flex-col gap-2">
            <textarea
              className="w-full px-4 py-2 focus:outline-accent-100 focus:ring-accent-100 min-h-[200px] text-sm font-medium rounded border-[1.5px] border-[#E8E8E866] bg-white text-[#000000]"
              rows={7}
              value={bio || build?.bio || ""}
              onChange={handleBioChange}
              placeholder="Hi there! I'm Oak, a car enthusiast based in San Francisco..."
            />
            <span className="text-right text-sm text-[#606060]">
              {bio.length}/{maxCharCount}
            </span>

            <div
              onClick={() => setIsPopupOpen(true)}
              className="pt-2 cursor-pointer"
            >
              <p className="text-sm font-bold text-[#606060]">
                Optional:{" "}
                <b className="text-accent-100 underline">
                  Add Social Media Link
                </b>
              </p>
            </div>
            {isPopupOpen && (
              <SocialMediaPopup
                isOpen={isPopupOpen}
                setIsOpen={setIsPopupOpen}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserWithProfile;
