import Button from "@/component/ui/Button/Button";
import { Lock } from "lucide-react";
import React from "react";

const PrivateProfile = ({
  followUser,
  heading,
  content,
  className,
  btnText,
  icon,
}: {
  followUser?: () => void;
  heading?: string;
  content?: string;
  className?: string;
  btnText?: string;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-6 my-6 x-6 mx-auto rounded bg-white border border-light-100 ${
        className || ""
      }`}
    >
      {/* Icon */}
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        {icon ? icon : <Lock className="w-8 h-8 text-gray-400" />}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
        {heading || "This account is private"}
      </h3>

      <p className="text-gray-600 text-center leading-relaxed mb-8">
        {content ||
          "Follow this account to see their posts and stories in your feed."}
      </p>
      {followUser && <Button onClick={followUser}>{btnText || "Send Follow Request"}</Button>}
    </div>
  );
};

export default PrivateProfile;
