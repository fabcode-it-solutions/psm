/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import Container from "@/component/ui/Container/Container";
import Image from "next/image";
import { RootState } from "@/libs/redux/store";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/component/ui/Button/Button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { setUser } from "@/libs/redux/slices/authSlice";
import { InsertUsers } from "@/types";
import { useApiRequest } from "@/hooks/useApiRequest";

const SignupCompleted = () => {
  const build = useSelector((state: RootState) => state.build.build);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.user.user)?.user;
  const router = useRouter();
  const dispatch = useDispatch();
  const { request } = useApiRequest();
  
  const onSubmit = async () => {
    if (loading) {
      return null;
    }
    setLoading(true);
    try {
      const responseBuild = await fetch("/api/builds/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brandId: build?.brand?.id,
          modelId: build?.model?.id,
          typeId: build?.type?.id,
          userId: user?.id,
          licensePlate: build?.licensePlate,
          vinNumber: build?.vinNumber,
          addressLine1: build?.location,
          firstName: build?.firstName,
          lastName: build?.lastName,
          username: build?.userName,
          bio: build?.bio,
          anonymous: build?.anonymous,
          anonymousName: build?.anonymousName,
          profileImage: build?.profileImage,
          socialMedia: build?.sm,
        }),
      });

      if (!responseBuild.ok) {
        throw new Error(`Request failed: ${responseBuild.status}`);
      }

      const resultBuild = await responseBuild.json();

      if (resultBuild?.error) {
        toast.error(resultBuild?.error);
        return;
      }

      if (resultBuild?.success) {
        if (user?.email) {
          const response = (await request({
            url: "/api/user?email=" + user.email,
            enableToast: false,
          })) as InsertUsers;

          if (response?.user) {
            dispatch(setUser({ user: response.user }));
          }
        }

        router.push("/");
        toast.success(resultBuild?.message || "Profile updated successfully!");
      }
    } catch (err: unknown) {
      console.error("Submit error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!build) {
      router.push("/accounts/sign-up");
    }
  }, [build]);
  return (
    <Container className="pt-8 px-4 md:px-0 max-w-[1512px] max-h-[792px]">
      <div className="w-full max-w-[1272px] mx-auto flex flex-col items-center text-center gap-6 pt-[75px]">
        <div className="flex gap-[4px] flex-col">
          <h1 className="text-[#002029] text-[26px] font-bold leading-[1.4] font-supreme">
            Welcome To Overlap!
          </h1>
          <p className="text-sm max-w-[700px] font-supreme">
            We&apos;re excited to help you find the perfect car parts. Whether
            you&apos;re a seasoned mechanic or a DIY enthusiast, our marketplace
            offers a wide range of quality parts and accessories. Connect with
            trusted sellers, compare prices, and read reviews to get the best
            deals. Join our community of car lovers and upgrade your ride today.
            Happy shopping!
          </p>
        </div>

        {/* Icon Box */}
        <div className="pt-[60px] flex items-center justify-center">
          <Image
            className="object-contain"
            src="/assets/images/signup-completed.png"
            alt="sign-up completed"
            width={270}
            height={164}
            quality={100}
            unoptimized
          />
        </div>

        {/* Buttons */}
        <div className="w-full max-w-[400px] flex flex-col gap-4 mt-20 mb-8">
          <Button
            type="button"
            className="!text-[#333333]"
            onClick={() => onSubmit()}
          >
            {loading ? "Updating..." : "Complete Signup"}
          </Button>
          <p className="text-[#54DC00] font-bold leading-[17px] tracking-[0.56px] align-middle font-sofia-sans max-w-[320px] text-left mx-auto pt-[45px] text-[13px]">
            By signing up, you agree to the Overlap&apos;s{" "}
            <u>Terms and Conditions</u> and <u>Privacy Policy.</u>
          </p>
        </div>
      </div>
    </Container>
  );
};

export default SignupCompleted;
