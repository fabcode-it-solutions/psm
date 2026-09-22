'use client';
import React from 'react';
import Image from 'next/image';
import BreadcrumbHeader from '../address/BreadcrumbHeader';
import SearchProductCard from './SearchProductCard';

const SearchProductPage2 = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full overflow-hidden ">
         <div className="lg:w-[50.66%]  relative aspect-[766/662] lg:max-h-[662px] mb-4 lg:mb-0">
           <Image
             src="/assets/images/mainwheel.png"
             alt="Main Product Image"
             fill
             className="object-cover"
           />
           <div className="absolute inset-0 bg-black/20 opacity-100 group-hover:opacity-100 transition" />
         </div>
   
         <div className=" flex flex-col w-full lg:w-[33.46%] lg:mx-auto mx-5 mt-20 ">
           <BreadcrumbHeader
             breadcrumbs={["Create Listing"]}
             currentPage="Search Product"
             title="What Parts are you looking to sell?"
             onClose={() => console.log("Closed!")}
           />
   
           <div className="flex flex-col mt-15 mb-4 mr-10 lg:mr-0">
             <div className="flex items-center justify-between border border-[#E8E8E866] text-lg leading-[100%] tracking-[1%] rounded-[6px] bg-white text-dark-blue-cm">
               <div className="flex items-center gap-[10px] py-[15px] px-5 w-full border-[1.5px] border-[#E8E8E866] rounded-[6px] ">
                 <svg
                   width="25"
                   height="24"
                   viewBox="0 0 25 24"
                   fill="none"
                   xmlns="http://www.w3.org/2000/svg"
                 >
                   <path
                     d="M10.5 2.5C14.6421 2.5 18 5.85786 18 10C18 11.7101 17.4276 13.2866 16.464 14.5483L21.2071 19.2929C21.5976 19.6834 21.5976 20.3166 21.2071 20.7071C20.8466 21.0676 20.2794 21.0953 19.8871 20.7903L19.7929 20.7071L15.0483 15.964C13.7866 16.9276 12.2101 17.5 10.5 17.5C6.35786 17.5 3 14.1421 3 10C3 5.85786 6.35786 2.5 10.5 2.5ZM10.5 4.5C7.46243 4.5 5 6.96243 5 10C5 13.0376 7.46243 15.5 10.5 15.5C13.5376 15.5 16 13.0376 16 10C16 6.96243 13.5376 4.5 10.5 4.5Z"
                     fill="#002029"
                   />
                 </svg>
   
                 <input
                   type="text"
                   placeholder="Search for Car, Manufacturer, Part, Offset..."
                   className="flex-grow outline-none placeholder:text-dark-blue-cm font-supreme font-normal text-sm leading-[100%] tracking-[0em]"
                 />
               </div>
             </div>
           </div>
           
            <SearchProductCard/>

         </div>
       </div>
  )
}

export default SearchProductPage2;
