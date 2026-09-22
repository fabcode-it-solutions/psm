import React from "react";

const IconReport = ({
  className = "",
  fill = "#4F4F4F",
}: {
  className?: string;
  fill?: string;
}) => {
  return (
  <svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  className={className}
>

  <path
    d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V7z"
    fill={fill}
  />


  <path
    d="M11 9h2v5h-2V9zm0 6h2v2h-2v-2z"
    fill="white"
  />
</svg>




  );
};

export default IconReport;
