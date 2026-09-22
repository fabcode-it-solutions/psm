
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
  orderHistorySteps: [
    {
      status: "Offer Sent",
      date: "12/2/23",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.0002 8.33366C27.8242 8.33366 34.1668 14.6763 34.1668 22.5003C34.1668 30.3244 27.8242 36.667 20.0002 36.667C12.1761 36.667 5.8335 30.3244 5.8335 22.5003C5.8335 14.6763 12.1761 8.33366 20.0002 8.33366ZM20.0002 13.3337C19.3673 13.3337 18.8443 13.8039 18.7616 14.414L18.7502 14.5837V22.0837L18.7616 22.2533C18.8443 22.8634 19.3673 23.3337 20.0002 23.3337C20.633 23.3337 21.156 22.8634 21.2388 22.2533L21.2502 22.0837V14.5837L21.2388 14.414C21.156 13.8039 20.633 13.3337 20.0002 13.3337ZM23.7502 4.16699C24.4405 4.16699 25.0002 4.72664 25.0002 5.41699C25.0002 6.04982 24.5299 6.57281 23.9198 6.65558L23.7502 6.66699H16.2502C15.5598 6.66699 15.0002 6.10735 15.0002 5.41699C15.0002 4.78417 15.4704 4.26117 16.0805 4.1784L16.2502 4.16699H23.7502Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      status: "Offer Pending Sellers Approval",
      date: "12/2/23",
      icon: (
        <svg
          width="41"
          height="40"
          viewBox="0 0 41 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21.8579 20.3282L9.3059 22.4202C9.01191 22.4692 8.76647 22.6715 8.66221 22.9507L4.33239 34.5464C3.91793 35.6121 5.03364 36.6289 6.05641 36.1175L36.0564 21.1175C36.9777 20.6568 36.9777 19.3421 36.0564 18.8814L6.05641 3.88141C5.03364 3.37002 3.91793 4.38676 4.33239 5.4525L8.66221 17.0482C8.76647 17.3274 9.01191 17.5296 9.3059 17.5786L21.8579 19.6706C22.0395 19.7009 22.1622 19.8727 22.1319 20.0542C22.1085 20.1947 21.9984 20.3048 21.8579 20.3282Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      status: "Complete Payment",
      date: "12/2/23",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17 6C23.0751 6 28 10.9249 28 17C28 19.4966 27.1682 21.799 25.7667 23.6451L34.0607 31.9393C34.6464 32.5251 34.6464 33.4749 34.0607 34.0607C33.5281 34.5932 32.6948 34.6416 32.1076 34.2059L31.9393 34.0607L23.6451 25.7667C22.5668 26.5854 21.3327 27.2097 19.9952 27.5873C19.9984 27.4485 20 27.309 20 27.1688V24.4185C22.9318 23.2317 25 20.3574 25 17C25 12.5817 21.4183 9 17 9C12.8618 9 9.45753 12.142 9.04249 16.1704C8.65795 16.3118 8.29797 16.5412 7.99313 16.8586C7.36331 17.5144 6.73033 18.0264 6.08955 18.4102C6.03046 17.9485 6 17.4778 6 17C6 10.9249 10.9249 6 17 6ZM14 20.6942C13.3113 20.4048 12.645 20.0167 12 19.5288C11.5103 19.1584 11.033 18.7305 10.5674 18.2446C10.2551 17.9187 9.74828 17.9184 9.43564 18.244C7.44666 20.315 5.24676 21.3333 2.8 21.3333C2.35817 21.3333 2 21.7064 2 22.1667V27.1688L2.00875 27.6994C2.06186 29.2931 2.35662 30.7281 2.88938 32C3.19054 32.719 3.56774 33.3859 4.02034 34C4.56934 34.7449 5.22927 35.412 5.99893 36C7.04613 36.8 8.29649 37.4536 9.74702 37.9572C9.91123 38.0143 10.0888 38.0143 10.253 37.9572C15.374 36.1791 18 32.5326 18 27.1688V22.1667L17.9837 21.9987C17.9091 21.619 17.5866 21.3333 17.2 21.3333C16.7931 21.3333 16.3932 21.3053 16 21.2489C15.313 21.1505 14.6466 20.9659 14 20.6942Z"
            fill="#212121"
          />
        </svg>
      ),
    },
  ],
  isUpdate: true,
  isUpdateMode: true,
};

const OfferDetail = () => {
  return (
    <PurchaseOrder
      {...Data}
      accordionType="multiple"
      accordionDefaultValue={Data.accordionItems.map((item) => item.value)}
     
    />
  );
};
export default OfferDetail;
