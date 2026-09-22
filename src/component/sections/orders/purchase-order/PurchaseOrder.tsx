"use client"
import PurchaseOrder from "../orderLayout";


const Data = {
  breadcrumbItems: ["Orders", "In Progress", "RAYS Volk Racing "],
  title: "RAYS Volk Racing TE37V Mark II",
  buyPrice: "$1,400",
  images: [
    { src: "/assets/images/products/Rectangle 3057.png" },
    { src: "/assets/images/products/Rectangle 3057.png" },
    { src: "/assets/images/products/Rectangle 3057.png" },
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
  onCancel: () => ("Order cancelled"),
  lastSalePrice: "$2,285",
  lastSaleChange: "-$2,285 (27%)",
   accordionItems : [
    {
      value: 'item-1',
      title: 'Details',
      content:
        'The VOLK RACING Wheel brand represents the benchmark for forged sport wheels that leverage racing technology. The lightness and strength of VOLK RACING wheels has been attained by applying the latest technologies, coupled with real world testing in high pressure motorsport environments...',
    },
    {
      value: 'item-2',
      title: 'Features',
      content: 'Features content goes here...',
    },
    {
      value: 'item-3',
      title: 'Specifications',
      content: 'Specifications content goes here...',
    },
    {
      value: 'item-4',
      title: 'Condition',
      content: 'Condition content goes here...',
    },
    {
      value: 'item-5',
      title: 'Compatible Vehicles',
      content: 'Compatible vehicles content goes here...',
    },
    {
      value: 'item-6',
      title: 'How to Install',
      content: '',
    },
  ],
  orderHistorySteps: [
    {
      status: "In progress",
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
    status: "Shipped to buyer: 09 Arnulfo Crossing, Botsfordborough, NSW",
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
    status: "Expected Arrival Time",
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
          d="M1.6665 14.2894V7.37956C1.6665 6.43263 2.20151 5.56697 3.04847 5.14349L8.8818 2.22682C9.58562 1.87491 10.4141 1.87491 11.1179 2.22682L16.9512 5.14349C17.7982 5.56697 18.3332 6.43263 18.3332 7.37956V14.2894C18.3332 15.2363 17.7982 16.102 16.9512 16.5255L11.1179 19.4421C10.4141 19.794 9.58562 19.794 8.8818 19.4421L3.04847 16.5255C2.20151 16.102 1.6665 15.2363 1.6665 14.2894ZM4.25448 7.54513C4.04866 7.95678 4.21551 8.45734 4.62716 8.66316L9.1665 10.9328V15.8345C9.1665 16.2947 9.5396 16.6678 9.99984 16.6678C10.4601 16.6678 10.8332 16.2947 10.8332 15.8345V10.9328L15.3725 8.66316C15.7842 8.45734 15.951 7.95678 15.7452 7.54513C15.5394 7.13348 15.0388 6.96662 14.6272 7.17245L9.99984 9.48611L5.37252 7.17245C4.96087 6.96662 4.46031 7.13348 4.25448 7.54513ZM19.2543 5.00081C19.7308 5.68629 19.9998 6.51233 19.9998 7.37923V14.2891C19.9998 15.8673 19.1082 17.31 17.6966 18.0158L11.8632 20.9325C10.6902 21.519 9.30948 21.519 8.13645 20.9325L3.33317 18.5309V28.7508C3.33317 30.7038 4.8261 32.3081 6.73296 32.4847C7.12303 34.8574 9.18337 36.6675 11.6665 36.6675C14.144 36.6675 16.2006 34.8656 16.5974 32.5008H20.069C20.4657 34.8656 22.5223 36.6675 24.9998 36.6675C27.4773 36.6675 29.534 34.8656 29.9307 32.5008H32.9165C34.9876 32.5008 36.6665 30.8219 36.6665 28.7508V19.7296C36.6665 19.1744 36.5432 18.6261 36.3055 18.1243L33.4734 12.1455C32.8531 10.8358 31.5336 10.0008 30.0844 10.0008H27.4998V8.75081C27.4998 6.67975 25.8209 5.00081 23.7498 5.00081H19.2543ZM32.0832 25.8342H34.1665V28.3342H32.0832C31.3928 28.3342 30.8332 27.7746 30.8332 27.0842C30.8332 26.3939 31.3928 25.8342 32.0832 25.8342ZM31.2141 13.2157L33.6386 18.3341L27.4998 18.3341V12.5008H30.0844C30.5675 12.5008 31.0073 12.7791 31.2141 13.2157ZM14.1665 31.6675C14.1665 33.0482 13.0472 34.1675 11.6665 34.1675C10.2858 34.1675 9.1665 33.0482 9.1665 31.6675C9.1665 30.2868 10.2858 29.1675 11.6665 29.1675C13.0472 29.1675 14.1665 30.2868 14.1665 31.6675ZM24.9998 29.1675C26.3805 29.1675 27.4998 30.2868 27.4998 31.6675C27.4998 33.0482 26.3805 34.1675 24.9998 34.1675C23.6191 34.1675 22.4998 33.0482 22.4998 31.6675C22.4998 30.2868 23.6191 29.1675 24.9998 29.1675Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
],
};

const OrderPage = () => {
  return <PurchaseOrder {...Data} accordionType="single"
  accordionDefaultValue={undefined} />;
};
export default OrderPage;
