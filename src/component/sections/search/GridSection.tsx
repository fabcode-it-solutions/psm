import React from "react";
import { motion } from "framer-motion";
import { GridItem } from "./GridItem";
import { SearchResult } from "@/app/api/search/route";

interface GridSectionProps {
  title: string;
  items: SearchResult[];
  getHref: (id: string) => string;
  gridCols?: string;
}

export const GridSection = React.memo<GridSectionProps>(
  ({ title, items, getHref, gridCols = "grid-cols-5" }) => {
    const motionProps = {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      transition: { duration: 0.3 },
    };

    return (
      <motion.div {...motionProps} key={`tab-${title.toLowerCase()}`}>
        <div className="my-4">
          <h3 className="text-left text-sm leading-[23px] text-dark-blue-cm relative z-[1] font-audiowide font-normal">
            {title}
          </h3>
          <div className={`grid ${gridCols} mt-2 gap-2`}>
            {items.map((item, index) => (
              <GridItem
                key={index}
                item={item}
                href={getHref(item.slug || String(item.id))}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }
);

GridSection.displayName = "GridSection";
