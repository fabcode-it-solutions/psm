// component/sections/error/NotFoundContent.tsx
"use client";
import React from "react";
import Container from "@/component/ui/Container/Container";
import Image from "next/image";
import Anchor from "@/component/ui/Anchor/Anchor";
import Button from "@/component/ui/Button/Button";
import { useRouter } from "next/navigation";

const NotFoundContent: React.FC = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Container className="pt-[32px] pb-[100px]">
      <div className="flex gap-[4px] flex-col">
        <div className="text-center mb-8">
          <div className="text-[120px] font-black text-[#002029] leading-none font-poppins max-tab-sm:text-[80px]">
            404
          </div>
        </div>

        <h1 className="text-[#002029] text-[26px] font-bold text-center leading-[1.4] font-supreme max-tab-sm:text-[22px]">
          Page Not Found
        </h1>
        <p className="text-sm leading-[16px] text-center max-w-[400px] mx-auto">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-[400px] mx-auto flex flex-col gap-4 mt-6">
        <Button
          type="button"
          onClick={handleGoBack}
          className="!text-[#333333]"
        >
          Go Back
        </Button>

        <Anchor
          href="/"
          className="w-full !bg-[#EFEFEF] text-center !text-[#333333] !py-[13px]"
        >
          Return to Homepage
        </Anchor>
      </div>

      {/* Help Text */}
      <div className="mt-[40px] text-center">
        <p className="text-[#606060] text-xs leading-[16px]">
          Need help?{" "}
          <span className="text-[#54DC00] font-medium cursor-pointer hover:underline">
            Contact Support
          </span>
        </p>
      </div>
    </Container>
  );
};

export default NotFoundContent;
