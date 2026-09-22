/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from "react";
import Heading from "@/component/ui/Heading/Heading";
import Image from "next/image";
import InputField from "@/component/ui/Input/Input";
import IconDismissCircle from "@/assets/icons/IconDismissCircle";
import CountryDropdown from "@/component/ui/CountryDropdown/CountryDropdown";
import { useForm } from "react-hook-form";
import Button from "@/component/ui/Button/Button";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import ToggleButton from "@/component/ui/Toogle/Toogle";
import { Tooltip } from "@/component/ui/Tooltip/Tooltip";
import { useAppSelector, useAppDispatch } from "@/libs/redux/hooks";
import { userService } from "@/services/user.service";
import { updateUser } from "@/libs/redux/slices/authSlice";
import toast from "react-hot-toast";

const Setting = () => {
  const [loading, setLoading] = useState(false);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const userId = useSelector((state: RootState) => state.user.user?.user.id);
  const dispatch = useAppDispatch();
  const vehicles = [
    {
      id: 1,
      image: "/assets/images/carbg.png",
      title: "2012 Toyota 86",
      registrationNo: "5TSN 521",
      partsAdded: 8,
    },
  ];

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const emailValue = watch("email");
  const firstNameValue = watch("firstName");
  const lastNameValue = watch("lastName");
  const stateValue = watch("state");
  const addressValue = watch("addressLine1");
  const postcodeValue = watch("postalCode");

  const user = useSelector((state: RootState) => state.user?.user?.user);

  // current private state from redux - FIXED: should use isPrivate instead of firstName
  const isPrivate = useAppSelector((state) => state.user.user?.user?.isPrivate ?? false);

  // custom privacy toggle function
  const onPressedChange = async (pressed: boolean) => {
    if (privacyLoading || !user?.id) return;

    setPrivacyLoading(true);
    const toastId = toast.loading("Updating privacy setting...");

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          updates: { isPrivate: pressed },
        }),
      });

      const result = await response.json();

      if (result?.success) {
        // FIXED: Update isPrivate instead of firstName
        dispatch(updateUser({ isPrivate: pressed }));
        toast.success(
          pressed
            ? "Your account is now private."
            : "Your account is now public."
        );
      } else {
        console.error("Privacy update failed:", result);
        toast.error(result?.error || "Something went wrong while updating your account.");
      }
    } catch (error) {
      console.error("Privacy update error:", error);
      toast.error("Something went wrong while updating your account.");
    } finally {
      toast.dismiss(toastId);
      setPrivacyLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
 
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          updates: {
            phoneNumber: data.phoneNumber,
            firstName: data.firstName,
            lastName: data.lastName,
            countryCode: data.countryCode,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error("Update failed:", result.error);
        alert("Update failed: " + result.error);
        return;
      }
      alert("User updated successfully!");
    } catch (error) {
      console.error("An error occurred while updating:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1009px] w-full px-[30px]  py-[38px] max-des-xs:max-w-full max-tab-sm:py-[20px] max-mb-md:px-4">
      <div className="bg-[#F4F4F4] rounded-[10px] flex justify-between py-[43px] px-[24px] max-tab-sm:p-4">
        <div className="flex flex-col gap-[16px]">
          <Heading level={1} className="leading-[18px] text-[#002029] flex ">
            Oak Soe Nathan
          </Heading>
          <p className="text-sm leading-[1.5] tracking-[0.16px] text-[#002029]">
            Register since 2024
          </p>
          
          <div
            className={`flex items-center gap-2 ${
              loading ? "pointer-none:" : ""
            }`}
          >
            <span className="flex gap-[9px]">
              <Tooltip
                content="When your account is private, only approved followers can see your profile. Others will need to send a follow request."
                label="Make account private"
              />
            </span>

            {/* FIXED: Use isPrivate boolean instead of firstName string */}
            <ToggleButton
              onPressedChange={onPressedChange}
              pressed={isPrivate}
            />
          </div>
        </div>
        <span className="p-[6px] max-w-[32px] w-full max-h-[32px] h-full   rounded-full border-[#00202914] bg-white border-[1.5px] cursor-pointer">
          <Image
            src="/assets/icon/More.png"
            alt=""
            width={20}
            height={20}
            className="w-[20px] h-[20px]  "
          />
        </span>
      </div>

      <div className="flex gap-[24px] pt-[42px]  max-des-xs:flex-col">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="flex-1 p-[24px] flex flex-col gap-[10px] bg-[#F4F4F4] items-center rounded-[10px] max-w-[462px] max-des-xs:max-w-full"
          >
            <Image
              src={vehicle.image}
              alt={vehicle.title}
              width={230}
              height={132}
            />
            <div className="flex justify-between w-full items-center">
              <div className="flex flex-col gap-1">
                <Heading level={2} className="text-[#002029] leading-[1.3]">
                  {vehicle.title}
                </Heading>
                <span className="text-base font-medium tracking-[-0.17px] leading-[1.4] text-[#002029]">
                  Vehicle registration no :
                  <b className="font-bold"> {vehicle.registrationNo}</b>
                </span>
                <p className="text-xs text-[#002029] leading-[1.3] capitalize pt-[8px]">
                  {vehicle.partsAdded} Parts Added
                </p>
              </div>
              <div className="flex gap-1">
                <span className="p-[11px] bg-accent-100 max-w-[46px] w-full max-h-[46px] h-full rounded-full cursor-pointer max-mb-xl:w-[38px]  max-mb-xl:h-[38px]">
                  <Image
                    src="/assets/icon/delete.svg"
                    alt="Delete"
                    width={24}
                    height={24}
                  />
                </span>
                <span className="p-[11px] bg-accent-100 max-w-[46px] w-full max-h-[46px] h-full rounded-full cursor-pointer max-mb-xl:w-[38px]  max-mb-xl:h-[38px]">
                  <Image
                    src="/assets/icon/ArrowNext.png"
                    alt="Next"
                    width={24}
                    height={24}
                  />
                </span>
              </div>
            </div>
          </div>
        ))}

        <div className="flex-1 p-[10px] border-[2px] flex flex-col gap-[10px] rounded-[10px] bg-[#F4F4F4] border-[#F4F4F4] items-center justify-center">
          <div className="p-[42.5px] cursor-pointer max-tab-lg:p-[30px] max-tab-sm:[25px]">
            <Image
              className="object-cover"
              src="/assets/images/plus.png"
              alt=""
              width={24}
              height={24}
              quality={100}
            />
          </div>
          <span className="text-xl font-bold leading-[1.3] tracking-[-0.17px] capitalize text-[#002029]">
            Add new Car
          </span>
        </div>
      </div>

      <form className="mt-[42px]" onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-[#F4F4F4] p-[24px] flex flex-col gap-5 rounded-[10px] max-tab-sm:p-4">
          <div className="flex flex-col gap-5 ">
            <h4 className="text-base leading-[1.4] text-[#002029]">
              Account Details
            </h4>
            <div className="flex flex-wrap gap-[24px]">
              <div className="flex flex-col gap-[8px] max-des-xs:w-full ">
                <label className="text-xs font-medium text-[#606060]">
                  Email
                </label>
                <InputField
                  placeholder="JaneDoe@testmail.com"
                  rightIcon={emailValue ? <IconDismissCircle /> : undefined}
                  onRightIconClick={() =>
                    setValue("email", "", { shouldDirty: true })
                  }
                  className="text-[#002029] w-full"
                  {...register("email", { required: "Email is required" })}
                />
              </div>
              <div className="flex flex-col gap-[8px] max-des-xs:w-full ">
                <label className="text-xs font-medium text-[#606060]">
                  Mobile Number
                </label>
                <InputField
                  placeholder="8650 2012 4768"
                  className="flex-1 text-[#002029]  w-full !pl-[68px]"
                  leftIcon={
                    <CountryDropdown
                      onSelect={(phoneCode) =>
                        setValue("phoneNumber", phoneCode)
                      }
                    />
                  }
                  {...register("phoneNumber", {
                    required: "Mobile number is required",
                  })}
                />
              </div>
              <div className="flex flex-col gap-[8px] mt-[-4px]  max-des-xs:w-full ">
                <label className="text-xs font-medium text-[#606060]">
                  First Name
                </label>
                <InputField
                  placeholder="Jane"
                  className="text-[#002029]  w-full"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                  rightIcon={firstNameValue ? <IconDismissCircle /> : undefined}
                />
              </div>
              <div className="flex flex-col gap-[8px] mt-[-4px]  max-des-xs:w-full">
                <label className="text-xs font-medium text-[#606060]">
                  Last Name
                </label>
                <InputField
                  placeholder="Doe"
                  className="text-[#002029]  w-full"
                  rightIcon={lastNameValue ? <IconDismissCircle /> : undefined}
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5 ">
            <h4 className="text-base leading-[1.4] text-[#002029]">
              Shipping Details
            </h4>
            <div className="flex flex-wrap gap-[24px]">
              <div className="flex flex-col gap-[8px] max-des-xs:!w-full">
                <label className="text-xs font-medium text-[#606060]">
                  Address
                </label>
                <InputField
                  placeholder="Level 13/144 Edward St, Brisbane City"
                  rightIcon={addressValue ? <IconDismissCircle /> : undefined}
                  className="text-[#002029] w-full xl:!min-w-[820px]"
                  {...register("addressLine1", {
                    required: "Address is required",
                  })}
                />
              </div>

              <div className="flex flex-col gap-[8px] mt-[-4px]  max-des-xs:w-full">
                <label className="text-xs font-medium text-[#606060]">
                  State
                </label>
                <InputField
                  placeholder="QLD"
                  className="text-[#002029]  w-full "
                  rightIcon={stateValue ? <IconDismissCircle /> : undefined}
                  {...register("state", {
                    required: "State is required",
                  })}
                />
              </div>

              <div className="flex flex-col gap-[8px] mt-[-4px] max-des-xs:w-full">
                <label className="text-xs font-medium text-[#606060]">
                  Post Code
                </label>
                <InputField
                  placeholder="4000"
                  className="text-[#002029] w-full"
                  rightIcon={postcodeValue ? <IconDismissCircle /> : undefined}
                  {...register("postalCode", {
                    required: "Post code is required",
                  })}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="pt-[42px] flex justify-end max-tab-sm:justify-center">
          <Button className="!text-[#002029]" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Details"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Setting;