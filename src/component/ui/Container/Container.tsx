import React, { ReactNode } from "react";

const Container = ({ className, children }: { className?: string, children: ReactNode }) => {
  return (
    <div
      className={`max-w-[1332px] mx-auto px-[30px] max-tab-lg:px-4 w-full ${className || ""}`}
    >
        {children}
    </div>
  );
};

export default Container;
