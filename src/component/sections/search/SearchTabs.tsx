import React from "react";
import { motion } from "framer-motion";

interface SearchTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SearchTabs = React.memo<SearchTabsProps>(
  ({ tabs, activeTab, onTabChange }) => {
    if (tabs.length === 0) return null;

    return (
      <div className="relative flex space-x-6 border-b border-gray-200 my-6">
        {tabs.map((tab, index) => (
          <button
            key={`tabs-${index}`}
            onClick={() => onTabChange(tab)}
            className={`relative pb-2 text-sm font-supreme font-medium transition-colors ${
              activeTab === tab
                ? "text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="underline"
                className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-accent-100 rounded-full"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
          </button>
        ))}
      </div>
    );
  }
);

SearchTabs.displayName = "SearchTabs";
