"use client";
import Container from "@/component/ui/Container/Container";
import React from "react";
import Image from "next/image";
import Anchor from "@/component/ui/Anchor/Anchor";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isSignUpPage = pathname === "/accounts/sign-up";
  const isSignInPage = pathname === "/accounts/sign-in" || pathname === "/accounts/forgot-password";
  const isCompleteSignupPage =  pathname.includes("/profile");

  return (
    <header className="bg-white">
      <Container className={`pt-[56px] flex flex-col  ${isCompleteSignupPage ? 'pb-[78px]' : 'gap-[30px] pb-[30px]'}  `}>
       
        <div>
          <Link href={"/"}>
          <Image
            src="/assets/logo/OverlapLogo 2.png"
            alt=""
            width={169}
            height={22}
            unoptimized 
          />
          </Link>
        </div>

        <div className="flex justify-between items-center">

          {!isCompleteSignupPage && (
            <button onClick={() => router.back()} aria-label="Go back" className="cursor-pointer">
              <Image
                src="/assets/images/clear.png"
                alt="Back"
                width={32}
                height={32}
                unoptimized 
              />
            </button>
          )}

          {isSignUpPage && (
            <Anchor
              href="/accounts/sign-in"
              className="!bg-[#EFEFEF80] !text-black !py-[9px] !font-medium !tracking-normal !min-w-[229px]"
            >
              Already have an account?
            </Anchor>
          )}

          {isSignInPage && (
            <Anchor
              href="/accounts/sign-up"
              className="!bg-[#EFEFEF80] !text-black !py-[9px] !font-medium !tracking-normal !min-w-[229px]"
            >
              Create an account
            </Anchor>
          )}

        </div>
      </Container>
    </header>
  );
};

export default Header;
