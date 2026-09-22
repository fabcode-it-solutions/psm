 
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import Container from "@/component/ui/Container/Container";
import IconCar from "@/assets/icons/IconCar";
import IconLoaction from "@/assets/icons/IconLoaction";
import IconPerson from "@/assets/icons/IconPerson";
import UserProfile from "./userProfile";
import CarModel from "./carTypes/CarTypes";
import Heading from "@/component/ui/Heading/Heading";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import Anchor from "@/component/ui/Anchor/Anchor";
import {
  Build,
  removeBuildField,
  setBuild,
} from "@/libs/redux/slices/buildSlice";
import Image from "next/image";
import IconDismiss from "@/assets/icons/IconDismiss";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandType } from "@/types/build";
import {
  getCarModelByBrandId,
  getCarTypesByModelId,
  getContent,
  getNextStepHref,
} from "./utils/getContent";
import LicenseNumber from "./carTypes/LisenceNumber";
import UserWithProfile from "./userProfile/UserWithProfile";

import InputField from "@/component/ui/Input/Input";
import IconSearch from "@/assets/icons/IconSearch";

const CarBrand = ({ brands, slug }: { brands?: BrandType[]; slug: string }) => {
  const searchParam = useSearchParams();
  const step = searchParam.get("step") || "brand";
  const [activeTab, setActiveTab] = useState("cars");
  const build = useSelector((state: RootState) => state.build.build);

  const { brand, model, type } = build || {};
  const router = useRouter();
  const dispatch = useDispatch();
  const [models, setModels] = useState([]);
  const [types, setTypes] = useState([]);
  const content = getContent({ slug: step, brands, models, types });
  const brandId = searchParam.get("brand") || build?.brand?.id;
  const modelId = searchParam.get("model") || build?.model?.id;
  const typeId = searchParam.get("type") || build?.type?.id;
  const carsInput = ["licence", "vin"];
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);

  };
  const filteredCarModelsList = Array.isArray(content?.carModelsList)
    ? content.carModelsList.filter((item) =>
       item?.name && item?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const carBrands = [
    {
      value: "cars",
      image: (
        <IconCar
          fill={
            activeTab == "cars"
              ? "#54DC00"
              : activeTab == "location" || activeTab == "profile"
              ? "#002029"
              : "#CDD2C8"
          }
        />
      ),
      description: "",
    },
    {
      value: "location",
      image: (
        <IconLoaction
          fill={
            activeTab == "location"
              ? "#54DC00"
              : activeTab == "profile"
              ? "#002029"
              : "#CDD2C8"
          }
        />
      ),
      description: "",
    },
    {
      value: "profile",

      image: (
        <IconPerson fill={activeTab == "profile" ? "#54DC00" : "#CDD2C8"} />
      ),
      description: "",
    },
  ];
  useEffect(() => {
    if (!brandId) {
      router.push("/accounts/profile");
    }
    if (brandId) {
      (async () => {
        await getBrand();
        const result = await getCarModelByBrandId(Number(brandId));
        setModels(result);
      })();
    }
  }, [brandId]);

  useEffect(() => {
    if (modelId) {
      (async () => {
        const result = await getCarTypesByModelId(Number(modelId));
        setTypes(result);
      })();
    }
  }, [modelId]);

  const getBrand = async () => {
    try {
      const brandResponse = await fetch("/api/admin/cars/brands?id=" + brandId);
      const result = await brandResponse.json();
      const data = result.data[0];
      const builds = {
        ...build,
        brand: {
          id: data.id,
          name: data.name,
          logo: data?.logo?.url,
        },
      };
      if (modelId) {
        const modelResponse = await fetch(
          "/api/admin/cars/models?id=" + modelId
        );
        const modelResult = await modelResponse.json();
        const dataModel = modelResult.data[0];
        builds.model = {
          id: dataModel.id,
          name: dataModel.name,
        };
      }
      dispatch(setBuild(builds));
    } catch (error) {
      console.log(error);
    }
  };
useEffect(() => {
  if (step !== "location" && step !== "profile" && step !== "bio-profile") {
    setActiveTab("cars");
  }
  if (step === "location") {
    setActiveTab("location");
  }
  if (step === "profile" || step === "bio-profile") {
    setActiveTab("profile");
  }

  setSearchTerm("");
}, [step]);


  return (
    <Container className="min-h-[calc(100vh-170px)] flex flex-wrap relative">
      <Tabs.Root
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
        }}
        className="absolute top-[-47px] left-1/2 transform -translate-x-1/2"
      >
        <Tabs.List
          aria-label="Car brands"
          style={{ display: "flex", gap: "10px" }}
        >
          {carBrands.map((brand) => (
            <Tabs.Trigger
              key={brand.value}
              value={brand.value}
              disabled={activeTab != brand.value}
              className="border-b-3 w-[133px] max-tab-sm:w-[100px] py-[10px] disabled:cursor-not-allowed cursor-pointer flex justify-center items-center data-[state=active]:text-accent-100 border-transparent data-[state=active]:border-b-[#54DC00]"
            >
              {brand.image && <div className="icon-wrapper">{brand.image}</div>}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {carBrands.map((brand) => (
          <Tabs.Content key={brand.value} value={brand.value}>
            <p>{brand.description}</p>
          </Tabs.Content>
        ))}
      </Tabs.Root>

      <div className="pt-[82px] max-tab-sm:pt-[40px] flex flex-col justify-between pb-20">
        <div>
          <div className="flex gap-[8px] flex-col">
            <Heading level={1} className="capitalize max-tab-sm:text-[22px]">
              {content?.heading}
            </Heading>
            <Heading
              className="max-w-[800px] mx-auto tracking-[0.56px]"
              level={6}
            >
              {content?.subheading}
            </Heading>
          </div>
          <div
            className={`pt-[32px] ${
              content.key == "brand" ? "max-w-[871px]" : ""
            }  ${content.key == "model" ? "max-w-[506px]" : ""}  ${
              content.key == "type" ? "max-w-[438px]" : ""
            } mx-auto px-[30px]  max-tab-sm:px-[0px]`}
          >
            {activeTab === "cars" && !carsInput.includes(step) && (
              <>
                {build && brand ? (
                  <div className="flex flex-wrap justify-center">
                    <div className="mb-[30px] flex flex-col justify-center gap-[8px] items-center">
                      <Heading
                        className="!text-left w-full opacity-40"
                        level={6}
                      >
                        Selected
                      </Heading>
                      <div className="flex flex-wrap justify-center gap-[8px] items-center">
                        {build?.brand && (
                          <SelectItem
                            build={build}
                            logo={brand?.logo}
                            type="brand"
                            name={brand?.name}
                            active={content.key}
                          />
                        )}
                        {model && (
                          <SelectItem
                            build={build}
                            type="model"
                            name={model?.name}
                            active={content.key}
                          />
                        )}
                        {type && (
                          <SelectItem
                            build={build}
                            type="type"
                            name={type?.name}
                            active={content.key}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center max-w-[400px] mx-auto pt-[32px] pb-[30px] max-tab-sm:pt-[0px] relative">
                    <InputField
                      className="!py-[12px] !pl-[60px] !pr-0 text-dark-blue-cm/40  text-sm bg-white font-poppins !font-normal leading-[1.7] flex items-center rounded-xl !border-[0px]"                   
                      placeholder="Search for Manufacturer, Model, Year..."
                      value={searchTerm}
                      onChange={handleInputChange}
                    />
                      <IconSearch
                          fill="#002029"
                          className="w-6 h-6 absolute top-1/2 -translate-y-1/2 left-5 opacity-100"
                        />
                  </div>
                )}
              </>
            )}

            {searchTerm && filteredCarModelsList.length === 0 ? (
              <div className="text-center text-[#002029] mt-6 text-lg">
                No cars found matching &ldquo;{searchTerm}
              </div>
            ) : (
              <CarModel
                carModelsList={filteredCarModelsList}
                heading={content?.heading}
                subheading={content?.subheading}
                itemPaddingClass={slug != "select-brand" ? "!pr-[11.5px]" : ""}
                type={content.key as keyof Build}
              />
            )}
            {activeTab === "cars" && carsInput.includes(step) && (
              <LicenseNumber
                label={content?.label}
                placeholder={content?.placeholder}
                tooltipText={content?.tooltipText}
                tooltipLabel={content?.tooltipLabel}
                type={content.key as keyof Build}
              />
            )}
            {activeTab === "location" && (
              <LicenseNumber
                label={content?.label}
                placeholder={content?.placeholder}
                tooltipText={content?.tooltipText}
                tooltipLabel={content?.tooltipLabel}
                type={content.key as keyof Build}
              />
            )}
            {activeTab === "profile" && step == "profile" && (
              <UserProfile
                tooltipText={content?.tooltipText}
                tooltipLabel={content?.tooltipLabel}
              />
            )}
            {activeTab === "profile" && step == "bio-profile" && (
              <UserWithProfile />
            )}
          </div>
        </div>
        <div className="mt-[53px] flex justify-center flex-col items-center gap-[16px] ">
        {!build?.isExisting &&   <Anchor
            href={`${
              step === "bio-profile"
                ? "/accounts/profile/complete-signup"
                : getNextStepHref(
                    step,
                    Number(brandId),
                    Number(modelId),
                    Number(typeId)
                  )
            }`}
            className={`${
              step == "profile" && build && build?.firstName && build?.lastName
                ? ""
                : step == "profile" &&
                  build &&
                  !build?.firstName &&
                  !build?.lastName
                ? "pointer-events-none opacity-45"
                : build && build[content.key as keyof Build]
                ? ""
                : step === "bio-profile"
                ? ""
                : "pointer-events-none opacity-45"
            } !text-lg`}
          >
            {content?.buttonText || "Continue"}
          </Anchor> }
          {/* <Button className="!bg-[#EFEFEF] !text-[#002029]">
          Skip for later
        </Button> */}
          {activeTab === "cars" && !carsInput.includes(step) && (
            <div className="py-[20px] text-[#CDD2C8] text-center cursor-pointer text-base leading-[1] min-w-[400px] max-tab-sm:min-w-[320px] hover:underline">
              Can’t find your car? Enter Manually here
            </div>
          )}

          {activeTab === "cars" && carsInput.includes(step) && (
            <Anchor
              href={getNextStepHref(
                step,
                Number(brandId),
                Number(modelId),
                Number(typeId)
              )}
              className="!bg-transparent !text-[#CDD2C8] !text-sm !underline"
            >
              Skip
            </Anchor>
          )}

          {activeTab === "location" && (
            <Anchor
              href={getNextStepHref(
                step,
                Number(brandId),
                Number(modelId),
                Number(typeId)
              )}
              className="!bg-transparent !text-[#CDD2C8] !text-sm !underline"
            >
              Skip Step
            </Anchor>
          )}

          {activeTab === "profile" && step === "bio-profile" && !build?.isExisting && (
            <Anchor
              href="/accounts/profile/complete-signup"
              className="!bg-light-100 !text-dark-blue-cm !text-lg"
            >
              Skip for later
            </Anchor>
          )}
        </div>
      </div>
    </Container>
  );
};

export default CarBrand;

const SelectItem = ({
  name,
  logo,
  type,
  build,
  active,
}: {
  name?: string;
  logo?: string;
  type: keyof Build;
  build: Build;
  active: string;
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  return (
    <div className="py-[14.5px] px-[12px] max-w-fit bg-[#002029] max-h-[48px] cursor-pointer  flex border-[#00202914] border-[1px] rounded-[45px] gap-[6px] text-white items-center hover:shadow-md transition-shadow">
      {logo && (
        <Image
          src={logo}
          alt={name || ""}
          width={24}
          height={24}
          unoptimized
          className="bg-white rounded-full"
        />
      )}
      {name && (
        <span className="text-sm font-bold  tracking-[0.16px]">{name}</span>
      )}
      {type && (
        <span
          onClick={() => {
            dispatch(removeBuildField(type));
            if (active == "model") {
              router.push("/accounts/profile");
            }
            if (active == "type") {
              router.push(
                `/accounts/profile/?step=model&brand=${
                  build && build.brand?.id ? build.brand?.id : ""
                }`
              );
            }
          }}
          className="ml-1"
        >
          <IconDismiss
            fill="#FFFFFF"
            className="w-[11.5px] h-[11.5px] cursor-pointer"
          />
        </span>
      )}
    </div>
  );
};
