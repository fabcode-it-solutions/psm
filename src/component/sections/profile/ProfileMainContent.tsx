"use client";
import React from "react";
import "swiper/css";
import "swiper/css/navigation";
import HeadingSlideButtons from "@/component/global/HeadingSlideButtons";
import ProfileContentCard from "../AllCards/ProfileContentCard/ProfileContentCard";
import { products as homepageProducts } from "../homepage/MainProducts";
import { GetUserResponse } from "@/types";
import {
  selectIsBlocked,
  selectIsPrivate,
} from "@/libs/redux/selectors/selectors";
import { useAppSelector } from "@/libs/redux/hooks";
const product1 = [
  {
    images: [
      "/assets/images/buildd.jpg",
      "/assets/images/buildd.jpg",
      "/assets/images/buildd.jpg",
      "/assets/images/buildd.jpg",
    ],

    title: "RAYS Volk Racing TE37V Mark II",
    listingLabel: "Listed for Sale",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$4285.00",
    type: "Free Shipping",
    isWishlisted: false,
    link: "#",
  },
  {
    images: [
      "/assets/images/products/image .png",
      "/assets/images/products/image .png",
      "/assets/images/products/image .png",
      "/assets/images/products/image .png",
    ],
    listingLabel: "Listed for Sale",
    title: "RAYS Volk Racing TE37V Mark II",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$4285.00",
    type: "Free Shipping",
    isWishlisted: false,
    link: "#",
  },
  {
    images: [
      "/assets/images/products/image 10 (4).png",
      "/assets/images/products/image 10 (4).png",
      "/assets/images/products/image 10 (4).png",
      "/assets/images/products/image 10 (4).png",
    ],
    listingLabel: "Listed for Sale",
    title: "RAYS Volk Racing TE37V Mark II",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$4285.00",
    type: "Lowest Listing",
    isWishlisted: false,
    link: "#",
  },
  {
    images: [
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
    ],
    listingLabel: "Listed for Sale",
    title: "RAYS Volk Racing TE37V Mark II",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$4285.00",
    type: "Lowest Listing",
    isWishlisted: false,
    link: "#",
  },
];

const product2 = [
  {
    images: [
      "/assets/images/filter.png",
      "/assets/images/filter.png",
      "/assets/images/filter.png",
      "/assets/images/filter.png",
    ],
    listingLabel: "Listed for Sale",
    title: "K& N Performance Air Intake",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$1200",
    type: "Free Shipping",
    isWishlisted: false,
    link: "#",
  },
  {
    images: [
      "/assets/images/products/image .png",
      "/assets/images/products/image .png",
      "/assets/images/products/image .png",
      "/assets/images/products/image .png",
    ],
    listingLabel: "Listed for Sale",
    title: "K& N Performance Air Intake",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$1200",
    type: "Lowest Listing",
    isWishlisted: false,
    link: "#",
  },
  {
    images: [
      "/assets/images/products/image 10 (4).png",
      "/assets/images/products/image 10 (4).png",
      "/assets/images/products/image 10 (4).png",
      "/assets/images/products/image 10 (4).png",
    ],
    listingLabel: "Listed for Sale",
    title: "RAYS Volk Racing TE37V Mark II",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$1200",
    type: "Lowest Listing",
    isWishlisted: false,
    link: "#",
  },
  {
    images: [
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
    ],
    listingLabel: "Listed for Sale",
    title: "RAYS Volk Racing TE37V Mark II",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$1200",
    type: "Lowest Listing",
    isWishlisted: false,
    link: "#",
  },
];
const product3 = homepageProducts.map(({ ...rest }) => ({
  ...rest,
  listingLabel: "Listed for Sale",
  type: "Free Shipping",
}));

const profileCards = [
  {
    vehicle: {
      imageSrc: "/assets/images/carprop.png",
      imageWidth: "w-[229px]",
      title: "2012 Toyota 86",
      registrationNo: "5TSN 521",
      partsAdded: "8 Parts Added",
    },
    products: product1,
    onAddClick: "",
  },
  {
    vehicle: {
      imageSrc: "/assets/images/picwish.png",
      imageWidth: "w-[318px]",
      title: "1996 Toyota Supra",
      registrationNo: "5TSN 521",
      partsAdded: "5 Parts Added",
    },
    products: product2,
    onAddClick: "",
  },
  {
    vehicle: {
      imageSrc: "/assets/images/groupp.png",
      imageWidth: "w-[241px]",
      title: "Miscellaneous Items",
      registrationNo: "",
      partsAdded: "5 Parts Added",
    },

    products: product3,
    onAddClick: "",
  },
];

const ProfileMainContent = ({ user }: { user?: GetUserResponse }) => {
  const isPrivate = useAppSelector(selectIsPrivate);
  const isBlocked = useAppSelector(selectIsBlocked);
  if (isPrivate || isBlocked) {
    return null;
  }
  return (
    <section className="w-full max-w-[1273px] mx-auto py-12 max-tab-sm:px-[16px] max-tab-lg:px-[30px] relative">
      <div className="mb-6">
        <HeadingSlideButtons
          heading="My Builds"
          isButtons={false}
          hideRightSide={true}
        />
      </div>

      {profileCards.map(({ vehicle, products }, index) => (
        <ProfileContentCard
          key={index}
          vehicle={vehicle}
          products={products}

          // onAddClick={() => alert(alertMessage)}
        />
      ))}
    </section>
  );
};

export default ProfileMainContent;
