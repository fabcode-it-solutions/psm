import React from "react";

const IconFriendRequest = ({
  className = "",
  stroke = "black",
  unFollow,
}: {
  className?: string;
  stroke?: string;
  unFollow?: boolean;
}) => {
  return !unFollow ? (
    <svg
      width="22"
      height="16"
      viewBox="0 0 22 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M19 5V2H17V5H14V7H17V10H19V7H22V5H19ZM8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 2C9.1 2 10 2.9 10 4C10 5.1 9.1 6 8 6C6.9 6 6 5.1 6 4C6 2.9 6.9 2 8 2ZM14.39 10.56C12.71 9.7 10.53 9 8 9C5.47 9 3.29 9.7 1.61 10.56C0.61 11.07 0 12.1 0 13.22V16H16V13.22C16 12.1 15.39 11.07 14.39 10.56ZM14 14H2V13.22C2 12.84 2.2 12.5 2.52 12.34C3.71 11.73 5.63 11 8 11C10.37 11 12.29 11.73 13.48 12.34C13.8 12.5 14 12.84 14 13.22V14Z" />
    </svg>
  ) : (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M20 9H18H15V11H18H20H23V9H20ZM9 12C11.21 12 13 10.21 13 8C13 5.79 11.21 4 9 4C6.79 4 5 5.79 5 8C5 10.21 6.79 12 9 12ZM9 6C10.1 6 11 6.9 11 8C11 9.1 10.1 10 9 10C7.9 10 7 9.1 7 8C7 6.9 7.9 6 9 6ZM15.39 14.56C13.71 13.7 11.53 13 9 13C6.47 13 4.29 13.7 2.61 14.56C1.61 15.07 1 16.1 1 17.22V20H17V17.22C17 16.1 16.39 15.07 15.39 14.56ZM15 18H3V17.22C3 16.84 3.2 16.5 3.52 16.34C4.71 15.73 6.63 15 9 15C11.37 15 13.29 15.73 14.48 16.34C14.8 16.5 15 16.84 15 17.22V18Z" />
    </svg>
  );
};

export default IconFriendRequest;
