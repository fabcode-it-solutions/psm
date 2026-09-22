"use client"
import React from "react";
import ListingTable from "../ListingLayout";
import { useRouter } from "next/navigation";

const PurchaseOrderDetail = () => {
  const listings = [
    {
      id: "123456781",
      title: "RAYS Volk Racing TE37V Mark II",
      image: "/assets/images/car.png",
      code: "#23201C",
      date: "12/01/23",
      orderNumber: "#123456789",
      status: "Shipped to selected address",
    },
    {
      id: "123456782",
      title: "RAYS Volk Racing TE37V Mark II",
      image: "/assets/images/car.png",
      code: "#23201C",
      date: "12/01/23",
      orderNumber: "#123456789",
      status: "Shipped to selected address",
    },
  ];

  const headers = [
    { label: "Listing Title", key: "title" as const, width: "30.42%" },
    { label: "Part Number", key: "code" as const, width: "21.61%" },
    { label: "Order Number", key: "orderNumber" as const, width: "12.5%" },
    { label: "Status", key: "status" as const, width: "24.76%" },
    { label: "Date", key: "date" as const, width: "12.5%" },
  ];
  const router = useRouter();
  return <ListingTable
  headers={headers}
  listings={listings}
  onRowClick={(item) => {
    if (item.orderNumber) {
      router.push(`/orders/purchase-order/${encodeURIComponent(item.title)}`);
    } else {
      console.warn("Order number is missing");
    }
  }}
/>

};

export default PurchaseOrderDetail;
