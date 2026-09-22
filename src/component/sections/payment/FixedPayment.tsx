"use client";


import ProductImageGallery from "../address/ProductImageGallery";
import BreadcrumbHeader from "../address/BreadcrumbHeader";
import PurchaseBox from "./PurchaseBox";

const FixedPayment = () => {
  const images = [
    "/assets/images/wheel1.jpg",
    "/assets/images/wheel2.jpg",
    "/assets/images/wheel3.png",
    "/assets/images/wheel4.jpg",
    "/assets/images/mainwheel.png",
  ];

  return (
<div className="flex flex-col lg:flex-row max-w-[1272] w-full mx-auto justify-between  overflow-hidden">
     
      <ProductImageGallery
        images={images}
        mainImage="/assets/images/mainwheel.png"
      />

      
      <div className=" flex flex-col max-w-[506px] w-full   pt-8 sm:pt-12 lg:pt-[80px] gap-10 sm:gap-12 lg:gap-11">
        <BreadcrumbHeader
          breadcrumbs={["Home", "Rays", "RAYS Volk Racing"]}
          currentPage="Purchase Product"
          title="RAYS Volk Racing TE37V Mark II"
          onClose={() => console.log("Closed!")}
        />

        <div className="flex flex-col">
         
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex items-center justify-between border border-[#E8E8E866] text-lg leading-[100%] tracking-[1%] rounded-[6px] px-4 bg-white text-dark-blue-cm">
            
               <h3 className="flex-grow outline-none py-4  placeholder:text-dark-blue-cm font-supreme font-bold text-lg leading-[100%] tracking-[0.01em]">
                   Used, 5x120, 18x9.5+45
                   </h3>
              
              <button className="text-blue-500 text-sm ml-2 shrink-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.8911 3.04825C17.2885 1.65064 19.5543 1.65058 20.9519 3.0481C22.3493 4.4455 22.3493 6.71112 20.952 8.10861L20.0602 9.00057L14.9995 3.93991L15.8911 3.04825ZM13.9389 5.00064L3.94103 14.9997C3.5347 15.4061 3.2491 15.9172 3.116 16.4762L2.02041 21.0777C1.96009 21.3311 2.03552 21.5976 2.21968 21.7817C2.40385 21.9659 2.67037 22.0413 2.92373 21.981L7.52498 20.8855C8.08418 20.7523 8.59546 20.4666 9.00191 20.0601L18.9996 10.0613L13.9389 5.00064Z"
                    fill="#002029"
                  />
                </svg>
              </button>
            </div>
          </div>


          <PurchaseBox/>

          
         
        </div>
      </div>
    </div>
  );
};

export default FixedPayment;
