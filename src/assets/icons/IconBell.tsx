import React from "react";

const IconBell = ({
  className = "",
  fill = "#4F4F4F",
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <svg
      width="14"
      height="16"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M256 512C282.51 512 304 490.51 304 464H208C208 490.51 229.49 512 256 512ZM467.76 384C459.12 373.52 432 344.36 432 272V208C432 132.29 386.65 71.66 320 57.55V48C320 21.49 298.51 0 272 0H240C213.49 0 192 21.49 192 48V57.55C125.35 71.66 80 132.29 80 208V272C80 344.36 52.88 373.52 44.24 384C37.2 392.26 32 406.27 32 416C32 433.67 46.33 448 64 448H448C465.67 448 480 433.67 480 416C480 406.27 474.8 392.26 467.76 384Z"
        fill={fill}
      />
    </svg>
  );
};

export default IconBell;
