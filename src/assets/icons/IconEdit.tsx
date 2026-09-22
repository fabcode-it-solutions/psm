import React from "react";

const IconEdit = ({
  className = "",
  fill = "#4F4F4F",
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className || ''}`}
    >
      <path
        d="M9.87236 6.51333L10.4857 7.12667L4.44569 13.1667H3.83236V12.5533L9.87236 6.51333ZM12.2724 2.5C12.1057 2.5 11.9324 2.56667 11.8057 2.69333L10.5857 3.91333L13.0857 6.41333L14.3057 5.19333C14.5657 4.93333 14.5657 4.51333 14.3057 4.25333L12.7457 2.69333C12.6124 2.56 12.4457 2.5 12.2724 2.5ZM9.87236 4.62667L2.49902 12V14.5H4.99902L12.3724 7.12667L9.87236 4.62667Z"
        fill={fill}
      />
    </svg>
  );
};

export default IconEdit;
