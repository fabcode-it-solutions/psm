"use client"
import React from "react";
import ListingTable from "../ListingLayout";

const SolidOrder = () => {
  const listings = [
    {
      id: "123456781",
      title: "RAYS Volk Racing TE37V Mark II",
      image: "/assets/images/car.png",
      code: "#23201C",
      date: "12/01/23",
      orderNumber : "#123456789",
      status: "Published",
    },
    {
      id: "123456782",
      title: "RAYS Volk Racing TE37V Mark II",
      image: "/assets/images/car.png",
      code: "#23201C",
      date: "12/01/23",
      orderNumber : "#123456789",
      status: "Waiting For Approval",
    },
    {
      id: "123456783",
      title: "RAYS Volk Racing TE37V Mark II",
      image: "/assets/images/car.png",
      code: "#23201C",
      orderNumber : "#123456789",
      date: "12/01/23",
      status: "Waiting For Approval",
    },
    {
      id: "123456784",
      title: "RAYS Volk Racing TE37V Mark II",
      image: "/assets/images/car.png",
      code: "#23201C",
      orderNumber : "#123456789",
      date: "12/01/23",
      status: "Waiting For Approval",
    },
  ];

  const headers = [
    { label: "Listing Title", key: "title" as const, width: "30.42%" },
    { label: "Part Number", key: "code" as const, width: "21.61%" },
       { label: "orderNumber", key: "orderNumber" as const, width: "12.5%" },
    { label: "Status", key: "status" as const, width: "24.76%" },
    { label: "Date", key: "date" as const, width: "12.5%" },
 
  ];
  return <ListingTable headers={headers} listings={listings} />;
};

export default SolidOrder
