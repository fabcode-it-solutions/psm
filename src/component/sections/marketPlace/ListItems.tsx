"use client";

import React from "react";
import { ProductCardType } from "@/types/product.types";
import ProductCard from "@/component/products/ProductCard";
import HeadingSlideButtons from "@/component/global/HeadingSlideButtons";
import Link from "next/link";
const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")     
    .replace(/--+/g, "-")     
    .trim();
 const ListProduct =  [
  {
    images: [
      "/assets/images/products/productimage.png",
      "/assets/images/products/productimage.png",
      "/assets/images/products/productimage.png",
      "/assets/images/products/productimage.png",
    ],
    listingLabel : "Listed for Sale",
    category: "rays",
    title: "wheels Volk Racing TE37V Mark II",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$4285.00",
    type: "Lowest Listing",
    isWishlisted: false,
    link: "#",
    
    slideProfiles: {
      profilePic: "/assets/images/ProfilePicture.png",
      username: "Lachy123",
    },

  },
  {
    images: [
      "/assets/images/products/productimage 2.png",
      "/assets/images/products/productimage 2.png",
      "/assets/images/products/productimage 2.png",
      "/assets/images/products/productimage 2.png",
    ],
   listingLabel : "Not for Sale",
    category: "rays",
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
     slideProfiles: {
      profilePic: "/assets/images/ProfileImag2.png",
      username: "Sarah123",
    },
  },
  {
    images: [
      "/assets/images/products/wheel product.png",
      "/assets/images/products/wheel product.png",
      "/assets/images/products/wheel product.png",
      "/assets/images/products/wheel product.png",
    ],
    listingLabel : "Not for Sale",
     category: "rays",
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
     slideProfiles: {
      profilePic: "/assets/images/productOwner.png",
      username: "Jhonny123",
    },
  },
  {
    images: [
      "/assets/images/products/carproduct.png",
      "/assets/images/products/carproduct.png",
      "/assets/images/products/carproduct.png",
      "/assets/images/products/carproduct.png",
    ],
     listingLabel : "Listed for Sale",
      category: "rays",
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
    slideProfiles: {
      profilePic: "/assets/images/ownerproduct.png",
      username: "Victor123",
    },
  },
  {
    images: [
      "/assets/images/products/differentproduct.png",
      "/assets/images/products/differentproduct.png",
      "/assets/images/products/differentproduct.png",
      "/assets/images/products/differentproduct.png",
    ],
    listingLabel : "Listed for Sale",
     category: "rays",
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
    slideProfiles: {
      profilePic: "/assets/images/wheelownerprofile.png",
      username: "Liv123",
    },
  },
  {
    images: [
      "/assets/images/products/productwheel.png",
      "/assets/images/products/productwheel.png",
      "/assets/images/products/productwheel.png",
      
      "/assets/images/products/productwheel.png",
    ],
    listingLabel : "Listed for Sale",
    title: "RAYS Volk Racing TE37V Mark II",
     category: "rays",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$4285.00",
    type: "Lowest Listing",
    isWishlisted: false,
    link: "#",
    slideProfiles: {
      profilePic: "/assets/images/ownerwheelproduct.png",
      username: "Dan123",
    },
  },
];



export const products: ProductCardType[] = ListProduct.map((product, index) => {
  const slug = slugify(product.title);
  const listId = (10000 + index).toString();
  const category = product.category || "wheels"; 
  return {
    ...product,
    slug,
    category,
    listId,
    link: `/parts/${slug}/list/${listId}`,
  };
});


type ListItemsProps = {
  showHeading?: boolean;
};

const ListItems = ({ showHeading = true }: ListItemsProps) => {
  return (
    <section className="mt-[60px] max-w-[84.6498194946%] w-full  ml-[39px] mr-[30px] max-tab-sm:mx-auto mb-[186px] ">
       {showHeading && (
      <HeadingSlideButtons
        heading="Listed Items (6 Results)"
        isButtons={false}
        hideRightSide
      />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-y-10 gap-4 cursor-pointer">
        {products.map((product, i) => (
          <Link href={product.link || ''} key={i}>
          <ProductCard
            key={i}
            product={product}
            showBookmark={true}
            showNotificationIcon={false}
            linkBgColor="bg-[#002029]"
            arrowFill="fill-accent-100"
          />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ListItems;
 