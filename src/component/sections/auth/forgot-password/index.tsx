"use client";

import React, {  useEffect, useState } from "react";
import IconDismissCircle from "@/assets/icons/IconDismissCircle";
import Container from "@/component/ui/Container/Container";
import InputField from "@/component/ui/Input/Input";
import Button from "@/component/ui/Button/Button";
import { useApiRequest } from "@/hooks/useApiRequest";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ResetPassword from "./ResetPassword";

const ForgotPasswordSchema = z.object({
  email: z.string().nonempty("Email is required").email("Invalid email"),
});
type FormData = z.infer<typeof ForgotPasswordSchema>;
const ForgotPassword = ({
  user,
}: {
  user: {
    isToken?: boolean;
    passwordTokenExpire?: boolean;
    email?: string;
    authO?: string;
    id?: number;
  } | null;
}) => {
  const { request, loading } = useApiRequest();
  const [resetEmail, setResetEmail] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (loading) {
      return null;
    }
    await request({
      url: "/api/auth/forgot-password",
      options: {
        method: "POST",
        body: data,
      },
    });
  };
  useEffect(() => {
    if (user?.isToken) {
      setResetEmail(true);
    }
    if (user && !user?.passwordTokenExpire) {
      setResetEmail(false);
      toast.error("Password Token Expired, please try again.");
    }
  }, [user]);

  return (
    <Container className="pt-[32px] flex flex-col justify-center items-center">
      <div className="flex gap-[4px] flex-col">
        <h1 className="text-[#002029] text-[26px] font-bold text-center leading-[1.4] font-supreme max-tab-sm:text-[22px]">
          {resetEmail ? "Reset Password" : "Forgot Password"}
        </h1>
        <p className="text-sm leading-[1.3] text-center">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>
      {resetEmail ? (
        <ResetPassword email={user?.email} authO={user?.authO} />
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-[50px] inline-flex flex-col gap-[20px] max-tab-lg:justify-center max-tab-lg:items-center"
        >
          <div className="flex flex-col gap-[8px] w-full">
            <label className="text-xs leading-[16px] font-medium text-[#606060]">
              Email
            </label>
            <InputField
              placeholder="JaneDoe@testmail.com"
              {...register("email")}
              rightIcon={
                watch("email").length > 0 ? (
                  <div
                    onClick={() => setValue("email", "", { shouldDirty: true })}
                    className="cursor-pointer"
                  >
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
          <Button
            type={loading ? "button" : "submit"}
            className={`${
              loading ? "cursor-not-allowed pointer-events-none opacity-55" : ""
            } mt-[120px] max-tab-lg:mt-[40px] !text-[#002029]`}
          >
            {loading ? "Sending..." : "Send to Email"}
          </Button>
        </form>
      )}
    </Container>
  );
};

export default ForgotPassword;
