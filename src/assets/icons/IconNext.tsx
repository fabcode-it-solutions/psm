import React from "react";

const IconNext = ({
  className = "",
  fill = "#4F4F4F",
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <svg
      width="12"
      height="13"
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.4">
        <path
          d="M4.46967 2.71967C4.17678 3.01256 4.17678 3.48744 4.46967 3.78033L7.18934 6.5L4.46967 9.21967C4.17678 9.51256 4.17678 9.98744 4.46967 10.2803C4.76256 10.5732 5.23744 10.5732 5.53033 10.2803L8.78033 7.03033C9.07322 6.73744 9.07322 6.26256 8.78033 5.96967L5.53033 2.71967C5.23744 2.42678 4.76256 2.42678 4.46967 2.71967Z"
          fill="#002029"
        />
      </g>
    </svg>
  );
};

export default IconNext;
