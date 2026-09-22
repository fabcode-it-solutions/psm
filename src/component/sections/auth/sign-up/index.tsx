/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { lazy, useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import IconDismissCircle from "@/assets/icons/IconDismissCircle";
import Container from "@/component/ui/Container/Container";
import InputField from "@/component/ui/Input/Input";
import CountryDropdown from "@/component/ui/CountryDropdown/CountryDropdown";
import IconEye from "@/assets/icons/IconEye";
import Anchor from "@/component/ui/Anchor/Anchor";
import Image from "next/image";
import GoogleSignIn from "@/component/auth/GoogleSignIn";
import { useApiRequest } from "@/hooks/useApiRequest";
import Button from "@/component/ui/Button/Button";
import { useDispatch } from "react-redux";
import { setUser } from "@/libs/redux/slices/authSlice";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { generateUsername } from "@/utils/generateUsername";
import toast from "react-hot-toast";
import LinkSignInUp from "../../Sign-in footer links/LinkSignInUp";

export const RegisterSchema = z.object({
  email: z.string().nonempty("Email is required"),
  username: z
    .string()
    .nonempty("Username is required")
    .regex(/^\S+$/, "Username cannot contain spaces"),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[0-9]{10,15}$/.test(val), {
      message: "Invalid phone number",
    }),
  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

type FormData = z.infer<typeof RegisterSchema>;
export type UserResponse = {
  phoneNumber?: number;
  email?: string;
  isSocialLogin?: boolean;
  countryCode?: string;
  accessToken?: string;
};
export type ApiResult = {
  success?: boolean;
  data?: UserResponse;
} & {
  [key: string]: string | boolean | null | undefined;
};

const SignUp = () => {
  const [info, setInfo] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<string | boolean>(false);
  const { request, result, error } = useApiRequest<ApiResult>();
  const dispatch = useDispatch();
  const router = useRouter();
  const [countryCode, setCountryCode] = useState("1");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  useEffect(() => {
    if (error) {
      setLoading(false);
    }
  }, [error]);
  const emailValue = watch("email");
  const usernameValue = watch("username");
  const onSubmit = async (data: FormData) => {
    setLoading("Signing up...");
    const checkUserName = await fetch(
      `/api/auth/check-username?q=${data.username}`
    );
    const checkUserNameResult = await checkUserName.json();
    if (checkUserNameResult.isExisting) {
      toast.error("Username is already taken");
      setInfo(
        `Username is already taken, please use another one or <b className='text-accent-100'> ${checkUserNameResult.username}</b>`
      );
      return null;
    }

    await request({
      url: "/api/auth/sign-up",
      options: {
        method: "POST",
        body: {
          ...data,
          countryCode,
          username: checkUserNameResult.isExisting
            ? checkUserNameResult.username
            : data.username,
        },
      },
    });

    setLoading(false);
    signIn("email-password", {
      email: watch("email"),
      password: watch("password"),
      redirect: false,
    });
    router.push("/accounts/otp-verification");
  };

  useEffect(() => {
    if (result && result?.success && result.data) {
      const user = {
        email: result.data.email ?? emailValue ?? "",
        phoneNumber: result.data.phoneNumber?.toString() ?? "",
        countryCode: result.data?.countryCode ?? "",
        accessToken: result.data?.accessToken ?? "[]",
        isVerified: result.data?.isSocialLogin ?? false,
        password: "",
      };
      dispatch(setUser({ user }));  
    }
  }, [result]);
  const generateName = useCallback(async () => {
    const value = await generateUsername();
    setValue("username", value, { shouldDirty: true });
  }, []);
  return (
    <Container className="pt-[32px] pb-[100px]">
      <div className="flex gap-[4px] flex-col">
        <h1 className="text-[#002029] text-[26px] font-bold text-center leading-[1.4] font-supreme max-tab-sm:text-[22px]">
          Create An Account
        </h1>
        <p className="text-sm leading-[16px] text-center">
         Join Overlap to list, find and match parts faster .
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-[50px] flex flex-col gap-[20px] max-tab-lg:justify-center max-tab-lg:items-center"
      >
        <div className="flex flex-col gap-[8px]  w-full">
          <label className="text-xs flex justify-between  leading-[16px] font-medium text-[#606060]">
            Username
            <button
              onClick={generateName}
              className="text-xs text-accent-100 underline font-supreme"
              type="button"
            >
              Generate
            </button>
          </label>
          <InputField
            placeholder="Enter username"
            {...register("username")}
            onChange={(e) => {
              const noSpaces = e.target.value.replace(/\s+/g, "");
              setValue("username", noSpaces, { shouldDirty: true });
            }}
            rightIcon={usernameValue ? <IconDismissCircle /> : undefined}
            onRightIconClick={() =>
              setValue("username", "", { shouldDirty: true })
            }
            className="text-[#002029]"
          />
          {info != "" && (
            <p
              className="text-dark-100 text-sm max-w-[400px]"
              dangerouslySetInnerHTML={{ __html: info }}
            ></p>
          )}
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-[8px]  w-full">
          <label className="text-xs  leading-[16px] font-medium text-[#606060]">
            Email
          </label>
          <InputField
            placeholder="JaneDoe@testmail.com"
            {...register("email")}
            rightIcon={emailValue ? <IconDismissCircle /> : undefined}
            onRightIconClick={() =>
              setValue("email", "", { shouldDirty: true })
            }
            className="text-[#002029]"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-[8px]  w-full">
          <label className="text-xs  leading-normal font-medium text-[#606060]">
            Mobile Number
          </label>
          <InputField
            placeholder="8650 2012 4768"
            {...register("phoneNumber")}
            className="flex-1 text-[#002029] !pl-[68px]"
            leftIcon={
              <CountryDropdown
                onSelect={(phoneCode) => setCountryCode(phoneCode)}
              />
            }
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Password */}
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
                onClick={() => setShowPassword(!showPassword)}
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

        <Button
          type={loading ? "button" : "submit"}
          className={`${
            loading ? "cursor-not-allowed pointer-events-none opacity-55" : ""
          } `}
        >
          {loading ? loading || "Signing up..." : "Sign Up"}
        </Button>
      </form>
      <div className="mt-[16px] flex gap-[10px] max-tab-lg:justify-center max-tab-lg:items-center">
        <GoogleSignIn callbackUrl="/accounts/email-verify" />
        <Anchor
          href=""
          className="!bg-[#EFEFEF] !min-w-[188px] !text-[#333333] !py-[13px] max-tab-sm:!min-w-[150px]"
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

export default SignUp;
