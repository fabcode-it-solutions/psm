"use client";
import LoaderDots from "@/component/ui/loader/LoaderDots";
import { RootState } from "@/libs/redux/store";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
const Wrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const pathname = usePathname();
  const loading = useSelector((state: RootState) => state.dashboard.loading);
  return (
    <motion.div
      key={pathname}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ ease: "easeInOut", duration: 0.25 }}
      className={className || ""}
    >
      {children}
      {loading && (
        <div className="z-[99999] fixed top-0 text-accent-100 font-supreme flex-col gap-3 text-2xl font-bold flex items-center justify-center left-0 bg-dark-blue-cm/20 backdrop-blur-sm w-full h-full">
          <LoaderDots className="!bg-accent-100 !w-4 !h-4" />
          {loading}
        </div>
      )}
    </motion.div>
  );
};

export default Wrapper;
