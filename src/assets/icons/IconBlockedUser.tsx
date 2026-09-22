import React from "react";

const IconBlockedUser = ({
  className = "",
  fill = "#4F4F4F",
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V18C20 15.34 14.67 14 12 14ZM19.7071 4.29289C19.3166 3.90237 18.6834 3.90237 18.2929 4.29289L4.29289 18.2929C3.90237 18.6834 3.90237 19.3166 4.29289 19.7071C4.68342 20.0976 5.31658 20.0976 5.70711 19.7071L19.7071 5.70711C20.0976 5.31658 20.0976 4.68342 19.7071 4.29289Z"
        fill={fill}
      />
    </svg>
  );
};

export default IconBlockedUser;
