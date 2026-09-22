"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OfferManagementProps {
  offers: {
    status: string;
    date: string;
    time?: string;
    icon: React.ReactNode;
    price: string;
    userName: string;
  }[];
}

const OfferManagement: React.FC<OfferManagementProps> = ({ offers }) => {
  const [isOpen, setIsOpen] = useState(true); 
  return (
    <div className={`px-[20px]  max-tab-lg:w-full bg-white ${isOpen ? "pt-[20px] pb-[35px]" : "py-[20px]"}`}>
      <span className={`flex justify-between items-center  cursor-pointer ${isOpen ? "pb-[21px]" : "pb-0"}`} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Offer List">
        <h2 className="text-base text-[#002029] leading-[1.23] tracking-[0.16px]">
          Offer Management
        </h2>
        <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Offer List">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          >
            <circle
              cx="16"
              cy="16"
              r="15.25"
              stroke="#002029"
              strokeOpacity="0.08"
              strokeWidth="1.5"
            />
            <path
              d="M7.99658 17H24.0001C24.5524 17 25.0001 16.5523 25.0001 16C25.0001 15.4477 24.5524 15 24.0001 15H7.99658C7.4443 15 6.99658 15.4477 6.99658 16C6.99658 16.5523 7.4443 17 7.99658 17Z"
              fill="#212121"
            />
          </svg>
        </button>
      </span>

      <AnimatePresence>
        {isOpen && (
         <motion.div
  className="flex gap-1 w-full flex-col origin-top"
  initial={{ opacity: 0, scaleY: 0 }}
  animate={{ opacity: 1, scaleY: 1 }}
  exit={{ opacity: 0, scaleY: 0 }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
>

            
            <div className="flex justify-between w-full py-[20px] px-[20px] bg-[#CDD2C8] rounded-t-[6px]">
              <h2 className="text-xs font-bold text-[#002029] w-[21.547325%]">Username</h2>
              <h2 className="text-xs font-bold text-[#002029] w-[8.55893004%]">Price</h2>
              <h2 className="text-xs font-bold text-[#002029]">Date & Time</h2>
              <h2 className="text-xs font-bold text-[#002029] w-[10.2880658%]">Status</h2>
            </div>

            {offers.map((offer, index) => (
              <div
                key={index}
                className="flex justify-between w-full py-[12px] px-[20px] bg-[#FFFFFF] border-[1.5] border-[#E8E8E866] items-center max-h-[55px]"
              >
                <p className="text-xs font-normal text-[#000000] w-[21.547325%]">{offer.userName}</p>
                <p className="text-xs font-normal text-[#000000] w-[8.55893004%]">{offer.price}</p>
                <p className="text-xs font-normal text-[#000000]">
                  {offer.date}
                  <br />
                  {offer.time}
                </p>
                <span className="flex gap-1 w-[10.2880658%]">
                  {offer.status === "Accepted" ? (
                    <>
                    
                      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                        <circle cx="13" cy="13" r="13" fill="#54DC00" />
                        <path
                          d="M19.0458 8.4856C19.3299 8.78703 19.3158 9.26169 19.0144 9.54579L11.0846 17.0197C10.7483 17.3366 10.2204 17.3269 9.89609 16.9977L7.21576 14.2774C6.92504 13.9823 6.92856 13.5075 7.22361 13.2167C7.51867 12.926 7.99353 12.9295 8.28424 13.2246L10.5184 15.4921L17.9856 8.45421C18.287 8.17011 18.7617 8.18416 19.0458 8.4856Z"
                          fill="white"
                        />
                      </svg>

                      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                        <circle cx="13" cy="13" r="13" fill="#EB5757" />
                        <path
                          d="M7.39705 7.55379L7.46967 7.46967C7.73594 7.2034 8.1526 7.1792 8.44621 7.39705L13 11.939L17.4697 7.46967C17.7626 7.17678 18.2374 7.17678 18.5303 7.46967C18.8232 7.76256 18.8232 8.23744 18.5303 8.53033L14.061 13L18.5303 17.4697C18.7966 17.7359 18.8208 18.1526 18.6029 18.4462L13 14.061L8.53033 18.5303C8.23744 18.8232 7.76256 18.8232 7.46967 18.5303C7.17678 18.2374 7.17678 17.7626 7.46967 17.4697L11.939 13L7.46967 8.53033C7.2034 8.26406 7.1792 7.8474 7.39705 7.55379Z"
                          fill="white"
                        />
                      </svg>
                    </>
                  ) : (
                    <p className="text-xs font-normal text-[#000000]">Rejected</p>
                  )}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OfferManagement;
