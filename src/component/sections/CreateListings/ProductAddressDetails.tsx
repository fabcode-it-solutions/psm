"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Anchor from "@/component/ui/Anchor/Anchor";
import IconPencil from "@/assets/icons/IconPencil";
import BreadcrumbHeader from "../address/BreadcrumbHeader";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useListingFlow } from "@/hooks/useApiListing";
import Button from "@/component/ui/Button/Button";

const ProductAddressDetails = ({
  slug,
  userId,
}: {
  slug: string;
  userId: number;
}) => {
  const router = useRouter();
  const { listingData, updateFields, saveToDatabase, loading } =
    useListingFlow(userId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit states
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingSpecs, setEditingSpecs] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);

  // Temp values
  const [tempAddress, setTempAddress] = useState({
    addressLine1: listingData.addressLine1 || "",
    city: listingData.city || "",
    state: listingData.state || "",
  });

  const [tempSpecs, setTempSpecs] = useState({
    condition: listingData.selectedSpecs?.condition || "",
    pcd: listingData.selectedSpecs?.pcd || "",
    size: listingData.selectedSpecs?.size || "",
    offset: listingData.selectedSpecs?.offset || "",
  });
  const [cardNumber, setCardNumber] = useState("1234");

  // -----------------------------------------------------
  // 🔥 CRITICAL FIX — reload specs when listingData updates
  // -----------------------------------------------------
  useEffect(() => {
    if (listingData?.selectedSpecs) {
      setTempSpecs({
        condition: listingData.selectedSpecs.condition || "",
        pcd: listingData.selectedSpecs.pcd || "",
        size: listingData.selectedSpecs.size || "",
        offset: listingData.selectedSpecs.offset || "",
      });
    }
  }, [listingData.selectedSpecs]);
  // -----------------------------------------------------

  const formatAddress = () => {
    if (!listingData.addressLine1) return "Address not set";
    return `${listingData.addressLine1}, ${listingData.city}, ${listingData.state}`;
  };

  const formatSpecs = () => {
    if (!listingData.selectedSpecs?.condition) return "Specs not set";
    const { condition, pcd, size, offset } = listingData.selectedSpecs;

    const parts = [];
    if (condition) parts.push(condition);
    if (pcd) parts.push(pcd);
    if (size && offset) parts.push(`${size}+${offset}`);
    else if (size) parts.push(size);
    else if (offset) parts.push(offset);

    return parts.join(", ");
  };

  const details = [
    {
      value: formatAddress(),
      editing: editingAddress,
      setEditing: setEditingAddress,
      renderEdit: () => (
        <div className="flex flex-col gap-2 w-full">
          <input
            type="text"
            value={tempAddress.addressLine1}
            onChange={(e) =>
              setTempAddress({ ...tempAddress, addressLine1: e.target.value })
            }
            placeholder="Street address"
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={tempAddress.city}
              onChange={(e) =>
                setTempAddress({ ...tempAddress, city: e.target.value })
              }
              placeholder="City"
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1"
            />
            <input
              type="text"
              value={tempAddress.state}
              onChange={(e) =>
                setTempAddress({ ...tempAddress, state: e.target.value })
              }
              placeholder="State"
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1"
            />
          </div>
          <button
            onClick={() => {
              updateFields({
                addressLine1: tempAddress.addressLine1,
                city: tempAddress.city,
                state: tempAddress.state,
              });
              setEditingAddress(false);
              toast.success("Address updated");
            }}
            className="bg-dark-blue-cm text-white px-4 py-2 rounded text-sm font-supreme font-bold"
          >
            Save
          </button>
        </div>
      ),
    },
    {
      value: formatSpecs(),
      editing: editingSpecs,
      setEditing: setEditingSpecs,
      renderEdit: () => (
        <div className="flex flex-col gap-2 w-full">
          <input
            type="text"
            value={tempSpecs.condition}
            onChange={(e) =>
              setTempSpecs({ ...tempSpecs, condition: e.target.value })
            }
            placeholder="Condition (e.g., Used)"
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={tempSpecs.pcd}
              onChange={(e) => setTempSpecs({ ...tempSpecs, pcd: e.target.value })}
              placeholder="PCD (e.g., 5x120)"
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1"
            />
            <input
              type="text"
              value={tempSpecs.size}
              onChange={(e) => setTempSpecs({ ...tempSpecs, size: e.target.value })}
              placeholder="Size"
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1"
            />
          </div>
          <button
            onClick={() => {
              updateFields({
                selectedSpecs: {
                  ...listingData.selectedSpecs,
                  ...tempSpecs,
                },
              });
              setEditingSpecs(false);
              toast.success("Specifications updated");
            }}
            className="bg-dark-blue-cm text-white px-4 py-2 rounded text-sm font-supreme font-bold"
          >
            Save
          </button>
        </div>
      ),
    },
    {
      value: `**** **** ${cardNumber}`,
      editing: editingPayment,
      setEditing: setEditingPayment,
      renderEdit: () => (
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-supreme font-medium text-dark-blue-cm">
            Last 4 Digits of Card Number
          </label>
          <input
            type="number"
            value={cardNumber}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 4) setCardNumber(value);
            }}
            placeholder="1234"
            maxLength={4}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              if (cardNumber.length !== 4) {
                toast.error("Please enter 4 digits");
                return;
              }
              setEditingPayment(false);
              toast.success("Card number updated");
            }}
            className="bg-dark-blue-cm text-white px-4 py-2 rounded text-sm font-supreme font-bold"
          >
            Save
          </button>
        </div>
      ),
    },
  ];

  const listingPrice = parseFloat(listingData.price || "0");
  const deliveryCost = 200;
  const gst = listingPrice * 0.1;
  const fees = listingPrice * 0.05;
  const totalEarnings = listingPrice + deliveryCost - gst - fees;

  const summary = [
    { label: "Listing Price", value: `$${listingPrice.toFixed(2)}` },
    { label: "Delivery", value: `$${deliveryCost.toFixed(2)}` },
    { label: "GST", value: `$${gst.toFixed(2)}` },
    { label: "Fees", value: `$${fees.toFixed(2)}` },
    { label: "Total Potential Earnings", value: `$${totalEarnings.toFixed(2)}` },
  ];

  const handleUpload = async () => {
    if (!listingData.addressLine1 || !listingData.city) {
      toast.error("Please complete the address");
      return;
    }
    if (!listingData.selectedSpecs?.condition) {
      toast.error("Please complete the specifications");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveToDatabase("pending");
      if (result.success) {
        toast.success("Listing submitted for review!");
        router.push("/listings/success");
      } else toast.error(result.error || "Failed to submit listing");
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full overflow-hidden">
      <div className="lg:w-[50.66%] relative aspect-[766/662] lg:max-h-screen mb-4 lg:mb-0">
        <Image
          src={listingData.photos?.[0]?.url || "/assets/images/mainwheel.png"}
          alt="Main Product Image"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20 opacity-100 group-hover:opacity-100 transition" />
      </div>

      <div className="flex flex-col w-full lg:w-[33.46%] lg:mx-auto mx-5 mt-20">
        <BreadcrumbHeader
          breadcrumbs={[
            "Create Listing",
            "Search Product",
            "Add Details",
            "Add Address",
          ]}
          currentPage="Review & Upload"
          title={listingData.partTitle || "Product Listing"}
          onClose={() => router.push(`/listings/create/${slug}`)}
        />

        <div className="flex flex-col mt-15 gap-3 mr-7 lg:mr-0">
          {details.map((detail, index) => (
            <div
              key={index}
              className="border border-[#E8E8E866] text-lg rounded-[6px] px-4 bg-white text-dark-blue-cm"
            >
              {detail.editing ? (
                <div className="py-4">{detail.renderEdit()}</div>
              ) : (
                <div className="flex items-center justify-between">
                  <h3 className="flex-grow py-4 font-supreme font-bold text-lg">
                    {detail.value}
                  </h3>
                  <button onClick={() => detail.setEditing(true)}>
                    <IconPencil />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <span className="mt-10 mr-8 lg:mr-0">
          <svg
            className="w-full h-[2px]"
            viewBox="0 0 506 2"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="1"
              x2="506"
              y2="1"
              stroke="black"
              strokeOpacity="0.12"
              strokeWidth="1.5"
              strokeDasharray="10 10"
            />
          </svg>
        </span>

        <div className="flex flex-col gap-3 mt-6 mr-8 lg:mr-0">
          {summary.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span className="font-supreme font-bold text-lg text-dark-blue-cm">
                {item.label}
              </span>
              <span className="font-supreme font-bold text-lg text-dark-blue-cm">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex lg:justify-end lg:pr-1 justify-center mt-12 mb-15">
          <Button
            onClick={handleUpload}
            disabled={loading || isSubmitting}
            className="text-white min-w-[233px] py-[11px] font-bold text-xs bg-dark-blue-cm rounded-md disabled:opacity-50"
          >
            {isSubmitting ? "Uploading..." : "Upload & Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductAddressDetails;
