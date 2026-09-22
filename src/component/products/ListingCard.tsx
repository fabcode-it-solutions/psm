/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import "swiper/css/thumbs";
import Bookmark from "./Bookmark";
import Anchor from "../ui/Anchor/Anchor";
import IconBullet from "@/assets/icons/IconBullet";
import Button from "../ui/Button/Button";
import IconArrowDown from "@/assets/icons/IconArrowDown";
import * as Accordion from "@radix-ui/react-accordion";
import { usePathname } from "next/navigation";
import Breadcrumb from "../ui/BreadCrumb/BreadCrumb";
import Heading from "../ui/Heading/Heading";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Flag, Bell, CheckCircle } from "lucide-react";

import DemandBadge from "../dashboard/parts/DemandBadge";
import toast from "react-hot-toast";
import FlagPart from "../dashboard/parts/listing/ModerateModal";
import ModerationModal from "./ModerationModal";
import ModerationQueuePage from "../dashboard/moderation/ModerationQueuePage";

interface AccordionItem {
  value: string;
  title: string;
  content: string;
}

interface UserInfo {
  name: string;
  profileImage: string;
  registeredSince: string;
  listingsCount: number;
  onlineStatus: string;
}

interface ListingCardProps {
  images: string[];
  accordionItems: AccordionItem[];
  breadcrumb: string[];
  productName: string;
  brandImage: string;
  brandAlt?: string;
  listingsCount: number;
  condition: string;
  pcd: string;
  pairInfo: string;
  sizeInfo: string;
  lastSalePrice: string;
  buyLink: string;
  suggestPriceLink: string;
  user: UserInfo;
  manufacturerLogo?: string;
  manufacturerAlt?: string;
  slug: string;
  inventory?: number;
  demandScore?: number;
  wishlistCount?: number;
  inquiryCount?: number;
  restockRequestCount?: number;
  userId?: number;
  userEmail?: string | undefined;
  stock?: number;
  partId?: number;
}

const ListingCard: React.FC<ListingCardProps> = ({
  images,
  accordionItems,
  productName,
  brandImage,
  listingsCount,
  manufacturerLogo,
  manufacturerAlt,
  condition,
  pcd,
  pairInfo,
  sizeInfo,
  lastSalePrice,
  buyLink,
  suggestPriceLink,
  user,
  slug,
  inventory,
  demandScore,
  wishlistCount,
  inquiryCount,
  restockRequestCount,
  userId,
  userEmail,
  stock,
  partId,
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [message, setMessage] = useState("");
  const [isRestockRequested, setIsRestockRequested] = useState(false);
  const [restockLoading, setRestockLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const pathname = usePathname();

  const [openItem, setOpenItem] = useState<string | undefined>(
    accordionItems[0]?.value
  );

  const isProductPage = /^\/marketplaces\/[^\/]+\/product\/[^\/]+$/.test(
    pathname
  );
  const [showFlagModal, setShowFlagModal] = useState(false);
  const inventoryValue = Number(inventory) || 0;
  const stockValue =
    stock !== undefined && stock !== null ? Number(stock) : inventoryValue;
  const isOutOfStock = inventoryValue === 0 || stockValue === 0;
  const handleRestockRequest = async () => {
    if (!userId || !userEmail) {
      toast.error("Please log in to receive restock notifications");
      router.push("/login");
      return;
    }

    setRestockLoading(true);
    try {
      const response = await fetch(`/api/parts/${slug}/demand`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interactionType: "restock_request",
          userId: userId,
          sessionId:
            typeof window !== "undefined"
              ? sessionStorage.getItem("sessionId")
              : null,
          email: userEmail,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsRestockRequested(true);
        toast.success(`You'll be notified when this item is back in stock!`);
      } else {
        toast.error(
          result.error ||
            "Failed to register restock request. Please try again."
        );
      }
    } catch (error) {
      console.error("Restock request error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setRestockLoading(false);
    }
  };

  useEffect(() => {
    if (!userId || !slug) return;

    const checkRestockStatus = async () => {
      try {
        const res = await fetch(
          `/api/parts/${slug}/demand/check?userId=${userId}`
        );
        const data = await res.json();

        if (data.success && data.hasRequested) {
          setIsRestockRequested(true);
        }
      } catch (err) {
        console.error("Failed to check restock status", err);
      }
    };

    checkRestockStatus();
  }, [userId, slug]);
  useEffect(() => {
  }, [partId]);
  return (
    <div className="w-full flex gap-[75px] items-start relative max-des-sm:gap-[35px] max-tab-lg:gap-0 max-tab-md:flex-wrap ">
      <div className="w-[50.66%] flex flex-wrap  max-tab-md:w-full max-tab-md:relative sticky top-0 ">
        <Swiper
          spaceBetween={0}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          modules={[Thumbs]}
          className="main-swiper w-full "
        >
          {images.map((img, idx) => (
            <SwiperSlide key={`main-${idx}`}>
              <Image
                alt={`main-image-${idx}`}
                src={img}
                width={766}
                height={661}
                className="object-cover w-[100%] h-full aspect-[766/661]"
              />
              <div className="absolute inset-0 bg-black/20 opacity-100 group-hover:opacity-100 transition" />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-xl">
                    OUT OF STOCK
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={0}
          slidesPerView={3.3}
          watchSlidesProgress
          modules={[Thumbs]}
          className="thumb-swiper w-full"
          breakpoints={{
            320: { slidesPerView: 2, spaceBetween: 0 },
            640: { slidesPerView: 3, spaceBetween: 0 },
            1024: { slidesPerView: 3.3, spaceBetween: 0 },
          }}
        >
          {images.map((img, idx) => (
            <SwiperSlide key={`thumb-${idx}`} className="!h-auto">
              <Image
                alt={`thumbnail-${idx}`}
                src={img}
                width={234}
                height={220}
                className="object-cover w-full h-full cursor-pointer aspect-[234/220]"
                unoptimized={img.startsWith("http")}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="w-[36.45%] mt-[72px] max-tab-sm:mt-[40px] max-des-xs:w-[50%] max-des-xs:px-[30px] max-tab-sm:px-4 max-tab-md:w-full">
        <div className="flex w-full">
          <div className="w-[74.0471869%] flex flex-col gap-4">
            <Breadcrumb />

            <Heading level={3}>{productName}</Heading>
            <div className="flex gap-2.5">
              <span className="border-[1px] rounded-[6px] bg-white border-[#00000014] py-[4px] px-[17.5px] max-h-[31px]">
                <Image
                  src={manufacturerLogo || ""}
                  alt={manufacturerAlt || "manufacturer logo"}
                  width={62}
                  height={23}
                />
              </span>
              <span className="bg-[#002029] rounded-[6px] border-[#00000014] py-[6px] px-[12px] max-h-[31px]">
                <p className="text-sm font-bold leading-[1.35] tracking-[0.14px] text-white">
                  {listingsCount} Listings
                </p>
              </span>

              <DemandBadge
                demandScore={demandScore ?? 0}
                inventory={inventory ?? 0}
                wishlistCount={wishlistCount ?? 0}
                inquiryCount={inquiryCount ?? 0}
                restockRequestCount={restockRequestCount ?? 0}
              />
            </div>
          </div>
          <div className="w-[25.9528131%] flex flex-col gap-3 justify-center items-center">
            <Bookmark isMarked={false} />
            {partId && <FlagPart partId={partId} />}

          </div>
        </div>
        {!isProductPage && (
          <div className="pt-[20px] flex flex-col gap-[29px]">
            <span className="flex text-base max-mb-sm:text-[14px] font-medium text-[#002029] trackimg-[0.16px] leading-[1.375]">
              Condition: {condition}{" "}
              <p className="px-[21.17px] max-sm:px-[7px]">|</p> PCD: {pcd}
              <p className="px-[21.17px] max-sm:px-[7px]">|</p> {pairInfo}
              <p className="px-[21.17px] max-sm:px-[7px]">|</p> {sizeInfo}
            </span>
            <div className="flex flex-col">
              <h5 className="text-sm font-light leading-[1.358] tracking-[0.14px] text-[#002029] opacity-40">
                Last Sale
              </h5>
              <h2 className="text-[32px] leading-[1.344] tracking-[0.32px] font-bold text-[#002029]">
                {lastSalePrice}
              </h2>
            </div>

            {/* Action Buttons */}
            <span className="flex flex-col justify-center gap-3.5 w-full items-center">
              {isOutOfStock ? (
                /* Out of Stock - Restock Request Only */
                <div className="flex flex-col gap-3.5 w-full items-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="flex items-center gap-2 text-red-600 font-semibold">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Currently Out of Stock
                  </div>

                  {!isRestockRequested ? (
                    <>
                      <p className="text-sm text-gray-600 text-center">
                        Get notified when this item is back in stock
                      </p>
                      <Button
                        onClick={handleRestockRequest}
                        disabled={restockLoading}
                        className=" !bg-[#002029] text-white  hover:bg-[#002029]/90 "
                      >
                        {restockLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          </>
                        ) : (
                          <div className="flex gap-2">
                            <Bell className="w-5 h-5" />
                            Notify Me When Available
                          </div>
                        )}
                      </Button>
                      {!userId && (
                        <p className="text-xs text-gray-500 text-center">
                          Please log in to receive notifications
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-green-600">
                      <div className="flex items-center gap-2 font-medium">
                        <CheckCircle className="w-5 h-5" />
                        You&lsquo;ll be notified when back in stock!
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* In Stock - Regular Buttons */
                <>
                  <Anchor href={buyLink} className="!text-[#002029]">
                    Buy for {lastSalePrice}
                  </Anchor>
                  <Anchor
                    href={suggestPriceLink}
                    className="!text-[#002029] !bg-[#EFEFEF]"
                  >
                    Make an Offer
                  </Anchor>
                </>
              )}
            </span>
          </div>
        )}

        {!isProductPage && (
          <div className="mt-[39px] border-[1.5px] rounded-[6px] bg-white border-[#E8E8E866] py-[40.5px] px-[2px]">
            <div className="flex flex-col gap-2.5 p-2.5 max-tab-sm:gap-3.5">
              <div className="flex gap-1 items-center">
                <span className="pt-1 pl-2">
                  <Image
                    src="/assets/images/withoutprofil.png"
                    alt="profile picture"
                    width={40}
                    height={40}
                  />
                </span>
                <h2 className="text-[20px] leading-[1.35] tracking-[0.2px] font-medium text-[#002029]">
                  {user.name}
                </h2>
              </div>
              <div className="flex justify-between max-des-sm:flex-wrap max-des-sm:gap-[10px] max-tab-sm:gap-3.5">
                <span className="flex items-center text-sm leading-[1.361] tracking-[0.14px] font-normal">
                  Registered since {user.registeredSince}{" "}
                  <IconBullet className="mx-[9px]" /> {user.listingsCount}{" "}
                  Listings <IconBullet className="mx-[9px]" />{" "}
                  {user.onlineStatus}
                </span>
                <span
                  className="flex gap-2 items-center max-des-sm:justify-end max-des-sm:w-full cursor-pointer"
                  onClick={() => router.push(`/listings/create/${slug}`)}
                >
                  <p className="text-[12px] leading-[1.12] tracking-[0.12px] font-bold text-[#002029]">
                    View Listings
                  </p>
                  <svg
                    width="24"
                    height="25"
                    viewBox="0 0 24 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="max-des-sm:w-[20px] max-des-sm:h-[20px]"
                  >
                    <path
                      d="M8.29289 4.79289C7.90237 5.18342 7.90237 5.81658 8.29289 6.20711L14.5858 12.5L8.29289 18.7929C7.90237 19.1834 7.90237 19.8166 8.29289 20.2071C8.68342 20.5976 9.31658 20.5976 9.70711 20.2071L16.7071 13.2071C17.0976 12.8166 17.0976 12.1834 16.7071 11.7929L9.70711 4.79289C9.31658 4.40237 8.68342 4.40237 8.29289 4.79289Z"
                      fill="#002029"
                    />
                  </svg>
                </span>
              </div>
              <form className="flex flex-col gap-[10px] w-full max-tab-sm:gap-3.5">
                <textarea
                  className="w-full p-3  rounded-[8px] text-base leading-[1.2] tracking-[0.16px] placeholder-[#373546] text-[#373546] font-normal font-sofia-sans bg-[#E8E8E8] focus:outline-none focus:ring-1 focus:ring-accent-100"
                  rows={7}
                  placeholder="Hi Lachy, I'm interested in this product. Can I request an inspection?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <span className="flex items-center w-full justify-center">
                  <Button
                    type="submit"
                    className="!min-w-[233px] !py-[8px] capitalize !text-[#002029]"
                  >
                    Ask a Question
                  </Button>
                </span>
              </form>
            </div>
          </div>
        )}

        <Accordion.Root
          type="single"
          collapsible
          value={openItem}
          onValueChange={setOpenItem}
          className="mt-[40px] flex flex-col gap-3.5"
        >
          {[...accordionItems]
            .sort((a, b) => {
              const getOrder = (item: AccordionItem) => {
                const text = (item.title + " " + item.value).toLowerCase();
                if (text.includes("specification")) return 0;
                if (text.includes("detail")) return 1;
                return 2;
              };
              return getOrder(a) - getOrder(b);
            })
            .map(({ value, title, content }) => (
              <Accordion.Item
                key={value}
                value={value}
                className="flex flex-col gap-[9px] px-[21.95px] bg-white rounded-[6px] border-[1.5px] border-[#E8E8E866]"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="flex py-[15px] justify-between text-[18px] font-bold w-full">
                    {title}
                    <IconArrowDown
                      className={`transition-transform duration-300 ${
                        openItem === value ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </Accordion.Trigger>
                </Accordion.Header>

                <Accordion.Content forceMount className="overflow-hidden p-0">
                  <motion.div
                    initial={false}
                    animate={{
                      height: openItem === value ? "auto" : 0,
                      opacity: openItem === value ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden text-base font-light leading-[1.35] text-[#002029]"
                  >
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  </motion.div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
        </Accordion.Root>
      </div>
    </div>
  );
};

export default ListingCard;
