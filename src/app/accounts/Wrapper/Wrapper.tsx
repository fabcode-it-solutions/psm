"use client";

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const isCompleteSignupPage = pathname === "/accounts/complete-signup";

  return (
    <motion.div
      key={pathname}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ ease: "easeInOut", duration: 0.25 }}
    >
      {!isCompleteSignupPage && (
        <div className=" clip-inset-0 absolute top-0 left-0 w-full h-full pointer-events-none">
          {/* Left Image with fade-in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="fixed max-tab-sm:hidden left-0 bottom-[38px] z-10 max-w-[430px] max-des-xlg:max-w-[240px] max-mb-xl:max-w-[180px] max-mb-md:max-w-[100px] max-mb-md:bottom-0 max-tab-lg:max-w-[130px]"
          >
            <Image
              className="object-contain"
              src="/assets/images/leftImage.png"
              alt="Left Image"
              width={723}
              height={346}
              quality={100}
              unoptimized
            />
          </motion.div>

          {/* Right Image with fade-in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="fixed max-tab-sm:hidden right-0 bottom-[38px] z-10 max-w-[430px] max-des-xlg:max-w-[240px] max-mb-xl:max-w-[180px] max-mb-md:max-w-[100px] max-tab-lg:max-w-[130px] max-mb-md:bottom-0"
          >
            <Image
              className="object-contain"
              src="/assets/images/rightImage.png"
              alt="Right Image"
              width={723}
              height={346}
              quality={100}
              unoptimized
            />
          </motion.div>
        </div>
      )}

      <div className="flex justify-center max-w-[1332px] w-full mx-auto">
        {children}
      </div>
    </motion.div>
  );
};

export default Wrapper;
