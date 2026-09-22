import { motion, AnimatePresence, easeInOut } from "framer-motion";
import React from "react";

const collapseVariants = {
  hidden: {
    height: 0,
    opacity: 0,
    overflow: "hidden",
    transition: { duration: 0.3, ease: easeInOut },
  },
  visible: {
    height: "auto",
    opacity: 1,
    overflow: "hidden",
    transition: { duration: 0.3, ease: easeInOut },
  },
  exit: {
    height: 0,
    opacity: 0,
    overflow: "hidden",
    transition: { duration: 0.3, ease: easeInOut },
  },
};

const Accordion: React.FC<{
  id: string;
  label: string;
  open: boolean;
  textColor?: string;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({
  id,
  label,
  open,
  onToggle,
  children,
  textColor = "text-[#000000]",
}) => (
  <div className="py-4 border-t border-[#00000014] pr-[7px]">
    <span
      className={`text-base font-sofia-sans flex justify-between items-center cursor-pointer ${textColor}`}
      onClick={onToggle}
    >
      {label}

      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <circle
          cx="10"
          cy="10"
          r="9"
          fill="white"
          stroke="#002029"
          strokeWidth="1"
        />
        {open ? (
          <path d="M6 10h8" stroke="#002029" strokeWidth="2" />
        ) : (
          <path d="M10 6v8M6 10h8" stroke="#002029" strokeWidth="2" />
        )}
      </motion.svg>
    </span>

    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key={id}
          variants={collapseVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="overflow-hidden"
        >
          <div className="pb-3">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default React.memo(Accordion);
