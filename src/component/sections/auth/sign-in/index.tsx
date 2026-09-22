"use client";
import React, { useEffect, useState } from "react";
import IconDismissCircle from "@/assets/icons/IconDismissCircle";
import Container from "@/component/ui/Container/Container";
import InputField from "@/component/ui/Input/Input";
import IconEye from "@/assets/icons/IconEye";
import Anchor from "@/component/ui/Anchor/Anchor";
import Image from "next/image";
import Link from "next/link";
import Button from "@/component/ui/Button/Button";
import { signIn } from "next-auth/react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ApiResult } from "../sign-up";
import { useApiRequest } from "@/hooks/useApiRequest";
import GoogleSignIn from "@/component/auth/GoogleSignIn";
import IconClose from "@/assets/icons/IconClose";
import LinkSignInUp from "../../Sign-in footer links/LinkSignInUp";

export const LoginSchema = z.object({
  email: z.string().nonempty("Email is required").email("Invalid email"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
});
type FormData = z.infer<typeof LoginSchema>;
const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { request, success, loading, code, error, setCode } =
    useApiRequest<ApiResult>();
  const handleClearEmail = () => {
    setValue("email", "", { shouldDirty: true });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    await request({
      url: "/api/auth/sign-in",
      options: {
        method: "POST",
        body: data,
      },
    });
  };
  useEffect(() => {
    if (success) {
      signIn("email-password", {
        email: watch("email"),
        password: watch("password"),
        redirect: true,
        callbackUrl: "/",
      });
    }
  }, [success]);
  return (
    <Container className=" ">
      {code == 403 && (
        <div className="fixed bg-white/50 backdrop-blur-md w-full h-full left-0 top-0 z-50  items-center flex justify-center p-6">
          <button className="absolute top-4 right-4" onClick={() => setCode(0)}>
            <IconClose fill="#000" />
          </button>
          <div className="max-w-md ">
            <p className="text-shadow-dark-100 text-center text-xl">
              Your account has been temporarily blocked by the admin. You will
              be able to log in again after
              <b className="block text-accent-100">{error}</b>
            </p>
            <p className=" text-center  text-sm text-gray-2">
              If you need immediate access, please{" "}
              <Link className="text-accent-100 underline" href="/contact">
                contact
              </Link>{" "}
              the admin to request an unlock.
            </p>
          </div>
        </div>
      )}
      <div className="flex gap-[4px] flex-col">
        <h1 className="text-[#002029] text-[26px] font-bold text-center leading-[1.4] font-supreme max-tab-sm:text-[22px]">
          Login To Your Account
        </h1>
        <p className="text-sm leading-[1.3] text-center">
          Join Overlap to list, find and match parts faster .
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-[50px] flex flex-col gap-[20px] max-tab-lg:justify-center max-tab-lg:items-center"
      >
        <div className="flex flex-col gap-[8px]  w-full">
          <label className="text-xs  leading-[16px] font-medium text-[#606060]">
            Email
          </label>
          <InputField
            placeholder="JaneDoe@testmail.com"
            {...register("email")}
            rightIcon={
              watch("email")?.length > 0 ? (
                <div onClick={handleClearEmail} className="cursor-pointer">
                  <IconDismissCircle />
                </div>
              ) : null
            }
            className="text-[#002029]"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-[8px]  w-full">
          <label className="text-xs  leading-[1.3] font-medium text-[#606060]">
            Password
          </label>
          <InputField
            type={showPassword ? "text" : "password"}
            placeholder="********"
            {...register("password")}
            className="flex-1 text-[#002029]"
            rightIcon={
              <div
                onClick={togglePasswordVisibility}
                className="cursor-pointer"
              >
                <IconEye />
              </div>
            }
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <div className="flex justify-end">
        <Link
          href="/accounts/forgot-password"
          className="text-sm font-bold text-[#002029] text-right"
        >
          Forgot Password?
        </Link></div>
        <Button
          type={loading ? "button" : "submit"}
          className={`mt-[30px] ${
            loading ? "cursor-not-allowed pointer-events-none opacity-55" : ""
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <div className="mt-[16px] flex gap-[10px] max-tab-lg:justify-center max-tab-lg:items-center ">
        <GoogleSignIn />
        <Anchor
          href=""
          className="!bg-[#EFEFEF] !min-w-[188px] !text-[#333333] !py-[13px] max-tab-sm:!min-w-[155px]"
        >
          <span className="flex  gap-[10px] text-sm tracking-normal">
            <Image
              src="/assets/logo/fackbooklogo.png"
              alt="Facebook Logo"
              width={24}
              height={24}
              unoptimized
            />
            Facebook
          </span>
        </Anchor>
      </div>

      <LinkSignInUp/>

    </Container>
  );
};

export default SignIn;
