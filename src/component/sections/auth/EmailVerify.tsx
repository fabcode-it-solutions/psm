/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect } from "react";
import Container from "@/component/ui/Container/Container";
import Image from "next/image";
import Anchor from "@/component/ui/Anchor/Anchor";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import { useRouter } from "next/navigation";

const EmailVerify = () => {
  const user = useSelector((state: RootState) => state.user.user)?.user;
  const router = useRouter();
  useEffect(() => {
    if (user?.isVerified) {
      router.push("/");
    }
  }, [user]);
  return (
    <Container className="pt-8 px-4 md:px-0">
      <div className="w-full max-w-[1272px] mx-auto flex flex-col items-center text-center gap-6">
        <div className="flex gap-[4px] flex-col">
          <h1 className="text-[#002029] text-[26px] font-bold leading-[1.4] font-supreme">
            Email Verification
          </h1>
         {user?.email && <p className="text-[#C1C1C1] text-sm leading-normal ">
            Enter the unique code that we sent to &nbsp;
            {user?.email || "john@example.com.au"} to reset your password.
          </p>
}
        </div>

        {/* Icon Box */}
        <div className="max-w-[270px] w-full max-h-[164.41px] h-full flex items-center justify-center">
          <Image
            className="object-contain"
            src="/assets/images/email.png"
            alt="Email-Verification"
            width={270}
            height={164}
            quality={100}
            unoptimized 
          />
        </div>

        {/* Buttons */}
        <div className="w-full max-w-[400px] flex flex-col gap-4 mt-6">
          <Anchor href="/accounts/otp-verification" className="!text-[#333333]">
            Open Default Mail
          </Anchor>

          <Anchor
            href="/accounts/profile"
            className="w-full !bg-[#EFEFEF] !text-[#333333]  text-center"
          >
            Skip for now
          </Anchor>
        </div>
      </div>
    </Container>
  );
};

export default EmailVerify;
