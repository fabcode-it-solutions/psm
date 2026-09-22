"use client";
import React from "react";
import { signIn } from "next-auth/react";
import Button from "../ui/Button/Button";
import Image from "next/image";

const GoogleSignIn = ({callbackUrl}:{callbackUrl?:string}) => {
  
  return (
    <div>
      <Button
        onClick={() => signIn("google", { callbackUrl: callbackUrl || "/" })}
        className="!bg-[#EFEFEF] !min-w-[188px] !text-[#333333] !py-[13px] max-tab-sm:!min-w-[150px] "
      >
        <span className="flex  gap-[10px] text-sm">
          <Image
            src="/assets/logo/google.png"
            alt="Google Logo"
            width={24}
            height={24}
            unoptimized 
          />
          Google
        </span>
      </Button>
    </div>
  );
};

export default GoogleSignIn;
