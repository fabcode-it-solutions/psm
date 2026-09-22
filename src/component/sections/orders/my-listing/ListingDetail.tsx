"use client";
import PurchaseOrder from "../orderLayout";

const Data = {
  breadcrumbItems: ["Orders", "In Progress", "RAYS Volk Racing "],
  title: "RAYS Volk Racing TE37V Mark II",
  buyPrice: "$1,400",
  images: [
    { src: "/assets/images/products/Rectangle 3057.png" },
    { src: "/assets/images/products/Rectangle 3058.png" },
    { src: "/assets/images/products/Rectangle 3059.png" },
  ],
  addressInfo: [
    "09 Arnulfo Crossing, Botsfordborough, NSW",
    "Used, 5x120, 18x9.5+45",
    "**** **** 1234",
  ],
  deliveryPrice: "$200",
  productPrice: "$1,400",
  gstPrice: "$25",
  totalPrice: "$1,625",
  onCancel: () => "Order cancelled",
  lastSalePrice: "$2,285",
  lastSaleChange: "-$2,285 (27%)",
  listingType: "Boost Listing",
  buttonText: "Edit Listing ",
  cancelButtonText: "Cancel Listing",
  accordionItems: [
    {
      value: "item-1",
      title: "Details",
      content:
        "The VOLK RACING Wheel brand represents the benchmark for forged sport wheels that leverage racing technology. The lightness and strength of  VOLK RACING wheels  has been attained by applying the latest technologies, coupled with real world testing in high pressure motorsport environments. World renowned for making the highest quality motorsport wheels, Rays brings their hard won knowledge and experience to every wheel they make – and the VOLK line of wheels is at the top of the tree. All of Rays Engineering wheels undergo stringent testing, far exceeding the minimum quality controls laid down to receive JWL certification. All of Rays forged wheels must exceed Rays own internal JWL+R Spec 2 standards – the world’s most stringent standard for wheel manufacturing. As an example, the JWL standards require a wheel to undergo a radial stress test for a minimum of 500,000 rotations – JWL+R Spec 2 sees the wheel do 1,000,000 rotations.",
    },
    {
      value: "item-2",
      title: "Features",
      content:
        "The VOLK RACING Wheel brand represents the benchmark for forged sport wheels that leverage racing technology. The lightness and strength of  VOLK RACING wheels  has been attained by applying the latest technologies, coupled with real world testing in high pressure motorsport environments. World renowned for making the highest quality motorsport wheels, Rays brings their hard won knowledge and experience to every wheel they make – and the VOLK line of wheels is at the top of the tree. All of Rays Engineering wheels undergo stringent testing, far exceeding the minimum quality controls laid down to receive JWL certification. All of Rays forged wheels must exceed Rays own internal JWL+R Spec 2 standards – the world’s most stringent standard for wheel manufacturing. As an example, the JWL standards require a wheel to undergo a radial stress test for a minimum of 500,000 rotations – JWL+R Spec 2 sees the wheel do 1,000,000 rotations.",
    },
  ],
OfferManagement : [
  {
    username: "terekdriving",
    userName: "terekdriving",
    icon: "/assets/images/users/terekdriving.png",
    price: "$2,000",
    date: "12/2/23",
    time: "09:00AM",
    status: "Accepted",
  },
  {
    username: "erasurewincing",
    userName: "erasurewincing",
    icon: "/assets/images/users/erasurewincing.png",
    price: "$2,000",
    date: "12/2/23",
    time: "09:00AM",
    status: "Rejected",
  },
  {
    username: "wiredalluvial",
    userName: "wiredalluvial",
    icon: "/assets/images/users/wiredalluvial.png",
    price: "$2,000",
    date: "12/2/23",
    time: "09:00AM",
    status: "Rejected",
  },
  {
    username: "amusementethics",
    userName: "amusementethics",
    icon: "/assets/images/users/amusementethics.png",
    price: "$2,000",
    date: "12/2/23",
    time: "09:00AM",
    status: "Rejected",
  },
  {
    username: "deanbasalt",
    userName: "deanbasalt",
    icon: "/assets/images/users/deanbasalt.png",
    price: "$2,000",
    date: "12/2/23",
    time: "09:00AM",
    status: "Rejected",
  },
  {
    username: "alrightpumpkins",
    userName: "alrightpumpkins",
    icon: "/assets/images/users/alrightpumpkins.png",
    price: "$2,000",
    date: "12/2/23",
    time: "09:00AM",
    status: "Rejected",
  },
],
  isUpdate: true,
  isUpdateMode: true,
};

const ListingDetail = () => {
  return (
    <PurchaseOrder
      {...Data}
      accordionType="multiple"
      offerManagement={Data.OfferManagement}
      accordionDefaultValue={Data.accordionItems.map((item) => item.value)}
    />
  );
};
export default ListingDetail;
