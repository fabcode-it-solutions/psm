"use client";
import Anchor from "@/component/ui/Anchor/Anchor";
import Button from "@/component/ui/Button/Button";
import Container from "@/component/ui/Container/Container";
import OtpField from "@/component/ui/OtpField/OtpField";
import { signIn, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Verification = () => {
  const [counter, setCounter] = useState(0);
  const { data: session } = useSession();
  const [sending, setSending] = useState(false);
  const [userOtp, setUserOtp] = useState("");
  const [sendOtp, setSendOtp] = useState(false);
  useEffect(() => {
    if (counter <= 0) return;

    const timer = setInterval(() => {
      setCounter((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [counter]);

  const handleResend = async () => {
    if (counter === 0) {
      setSending(true);
      await signIn("email-otp", {
        email: session?.user?.email,
        action: "send",
        redirect: false,
      });
      setCounter(32);
      setSending(false);
    }
  };
  const onSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (userOtp.length === 6) {
      handleSubmit(userOtp);
    }
  };

  async function handleSubmit(event: string): Promise<void | null> {
    if (
      session &&
      session?.otpExpires !== undefined &&
      session.otpExpires < Date.now()
    ) {
      toast.error("OTP exprierd. Please resend");
      return null;
    }
    await signIn("email-otp", {
      email: session?.user?.email,
      provider: "email-otp",
      otpToken: session?.otp,
      action: "verify",
      otp: event,
      redirect: true,
      callbackUrl: "/accounts/profile",
    });
  }
  const setValue = (data: string) => {
    setUserOtp(data);
  };
  return (
    <Container className="pt-[32px]">
      <form
        onSubmit={onSubmit}
        className="max-tab-lg:justify-center max-tab-lg:items-center max-tab-lg:flex flex-col"
      >
        <div className="flex gap-[4px] flex-col">
          <h1 className="text-[#002029] text-[26px] font-bold text-center leading-[1.4] font-supreme max-tab-sm:text-[22px]">
            SMS Code Verification
          </h1>
          <p
            className={`text-sm leading-normal text-center ${
              sendOtp ? "font-bold" : ""
            }`}
          >
            {sendOtp
              ? "Didn’t get the email? Be sure to check your Spam or Junk folder — sometimes it sneaks in there."
              : "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
          </p>
        </div>
        {!sendOtp && (
          <div className="w-full max-w-[400px] flex flex-col gap-4 mt-6">
            <Button
              onClick={() => {
                setSendOtp(true);
                handleResend();
              }}
              className="!text-[#333333]"
            >
              Send Code
            </Button>

            <Anchor
              href="/accounts/profile"
              className="w-full !bg-[#EFEFEF] !text-[#333333]  text-center"
            >
              Skip for now
            </Anchor>
          </div>
        )}
        {sendOtp && (
          <div className="mt-[50px] max-w-[420px] w-full mx-auto">
            <OtpField handleSubmit={handleSubmit} setValue={setValue} />

            <div className="text-center text-[#828282] text-sm mt-[20px]">
              {counter > 0 ? (
                <p>
                  Didn’t receive a SMS?{" "}
                  <b>Resend in 0:{counter < 10 ? `0${counter}` : counter}</b>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => (sending ? "" : handleResend())}
                  className="text-[#002029] font-semibold cursor-pointer "
                >
                  {sending ? "Sending..." : "Resend Code"}
                </button>
              )}
            </div>
          </div>
        )}
        {sendOtp && (
          <div className="flex w-full justify-center">
            <Button type="submit" className="mt-[80px] !text-lg font-bold">
              <span className="!text-lg text-[#002029]">Submit</span>
            </Button>
          </div>
        )}
      </form>
    </Container>
  );
};

export default Verification;
