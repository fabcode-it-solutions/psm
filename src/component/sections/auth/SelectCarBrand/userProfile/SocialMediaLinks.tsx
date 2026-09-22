import React, { useState } from "react";
import IconClose from "@/assets/icons/IconClose";
import IconFacebookTag from "@/assets/icons/IconFacebookTag";
import IconInstagram from "@/assets/icons/IconInstagram";
import IconLinkedin from "@/assets/icons/IconLinkedin";
import IconTwitter from "@/assets/icons/IconTwitter";
import IconYoutube from "@/assets/icons/IconYoutube";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import { setBuild } from "@/libs/redux/slices/buildSlice";
const socialMediaLinks = [
  { icon: <IconFacebookTag />, name: "Facebook" },
  { icon: <IconInstagram />, name: "Instagram" },
  { icon: <IconYoutube />, name: "Youtube" },
  { icon: <IconTwitter />, name: "Twitter" },
  { icon: <IconLinkedin />, name: "LinkedIn" },
];

type SocialMediaPopupProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};
export type SocialMeidaType = {
  name: string;
  link: string;
};
export default function SocialMediaPopup({ setIsOpen }: SocialMediaPopupProps) {
  const dispatch = useDispatch();
  const build = useSelector((state: RootState) => state.build.build);
  const [urls, setUrls] = useState(
    socialMediaLinks.reduce((acc, { name }) => {
      acc[name] = "";
      return acc;
    }, {} as Record<string, string>)
  );
  const handleInputChange = (name: string, value: string) => {
    setUrls((prev) => ({ ...prev, [name]: value }));

    const sm: SocialMeidaType[] = build?.sm ? [...build.sm] : [];
    const index = sm.findIndex((item) => item.name === name);

    if (index !== -1) {
      sm[index] = { ...sm[index], link: value };
    } else {
      sm.push({ name, link: value });
    }

    const b = {
      ...build,
      sm,
    };

    dispatch(setBuild(b));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50">
      <div className="w-full max-w-[506px] max-sm:max-w-[70%] mx-auto px-[20px] pb-[26px] pt-[12px] bg-white rounded-[6px] shadow-lg min-h-[439px] ">
        <div className="flex items-center justify-between">
          <span className="text-lg text-[#002029] tracking-[0.16px] leading-[16px]">
            Social Media Link:
          </span>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close popup"
            className="cursor-pointer"
          >
            <IconClose />
          </button>
        </div>
        <div className="pt-[29px]">
          {socialMediaLinks.map(({ icon, name }, index) => (
            <div
              key={name}
              className={`flex gap-[4px] flex-row border-b-[1px] border-[#00000014] max-sm:flex-wrap ${
                index === 0 ? "pb-[12px]" : "py-[12px]"
              }`}
            >
              <span className="flex gap-[4px] items-center min-w-[100px]">
                {icon}
                <p className="text-base text-[#002029] tracking-[0.16px] leading-[1.4]">
                  {name}
                </p>
              </span>
              <input
                type="text"
                placeholder=""
                className="min-h-[47px] w-full bg-[#F9F9F9] rounded-[12px] px-4 outline-none min-w-[350px] max-sm:min-w-[200px]"
                value={
                  build && build.sm
                    ? build.sm.find((item) => item.name === name)?.link || ''
                    : ""
                }
                onChange={(e) => handleInputChange(name, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
