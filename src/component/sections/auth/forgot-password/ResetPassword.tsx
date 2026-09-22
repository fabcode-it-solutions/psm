/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import IconEye from "@/assets/icons/IconEye";
import Button from "@/component/ui/Button/Button";
import InputField from "@/component/ui/Input/Input";
import { useApiRequest } from "@/hooks/useApiRequest";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export const ForgotPasswordSchema = z
  .object({
    password: z
      .string()
      .nonempty("Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z
      .string()
      .nonempty("Confirm password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof ForgotPasswordSchema>;
type ApiResult = {
  status?: number;
  [key: string]: unknown;
};

const ResetPassword = ({ email, authO }: { email?: string, authO?:string }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { request, loading, result } = useApiRequest<ApiResult>();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      confirmPassword: "",
      password: "",
    },
  });
  const onSubmit = async (data: FormData) => {
    if (loading) {
      return null;
    }
    await request({
      url: "/api/auth/reset-password",
      options: {
        method: "POST",
        body: {
          email,
          auth:authO,
          ...data,
        },
      },
    });
  };
  useEffect(() => {
    if (result && result?.status === 200) {
      router.push("/accounts/sign-in");
    }
  }, [result]);
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-[50px] inline-flex flex-col gap-[20px] max-tab-lg:justify-center max-tab-lg:items-center"
    >
      <div className="flex flex-col gap-[8px]  w-full">
        <label className="text-xs  leading-[16px] font-medium text-[#606060]">
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
        <label className="text-xs  leading-[16px] font-medium text-[#606060]">
          Confirm Password
        </label>
        <InputField
          type={showPassword ? "text" : "password"}
          placeholder="********"
          {...register("confirmPassword")}
          className="flex-1 text-[#002029]"
          rightIcon={
            <div
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="cursor-pointer"
            >
              <IconEye />
            </div>
          }
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <Button
        type={loading ? "button" : "submit"}
        className={`${
          loading ? "cursor-not-allowed pointer-events-none opacity-55" : ""
        } mt-[120px] max-tab-lg:mt-[40px] !text-[#002029]`}
      >
        {loading ? "Reseting..." : "Reset"}
      </Button>
    </form>
  );
};

export default ResetPassword;
