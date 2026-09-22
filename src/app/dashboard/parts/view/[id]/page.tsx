// import View from "@/component/dashboard/parts/listing/View";
// import React from "react";

// export const revalidate = 1800;
// export const dynamic = "force-static";

// export default async function Page({ params }: { params: { id: string } }) {
//   const { id } = await params;

//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/parts/${id}`, {
//       next: { revalidate: 1800, tags: [`part-${id}`] },
//       cache: "force-cache",
//     });

//     if (!res.ok) {
//       if (res.status === 404) {
//         return (
//           <div className="flex gap-[4px] flex-col">
//             <div className="text-center mb-8">
//               <div className="text-[120px] font-black text-accent-100 leading-none font-poppins max-tab-sm:text-[80px]">
//                 404
//               </div>
//             </div>
//             <h1 className="text-light-100 text-[26px] font-bold text-center leading-[1.4] font-supreme max-tab-sm:text-[22px]">
//               Part Not Found
//             </h1>
//             <p className="text-[14px] text-gray-5 leading-[16px] text-center max-w-[400px] mx-auto">
//               The page you are looking for might have been removed, had its name
//               changed, or is temporarily unavailable.
//             </p>
//           </div>
//         );
//       }

//       throw new Error(`Failed to fetch part data: ${res.status}`);
//     }

//     const templateData = await res.json();
//     return <View partData={templateData.data} />;
//   } catch (error) {
//     console.error("Failed to fetch part data:", error);
//     return (
//       <div className="text-center text-red-500">
//         Something went wrong while loading this part.
//       </div>
//     );
//   }
// }

import React from 'react'

const page = () => {
  return (
    <div>
      
    </div>
  )
}

export default page
