import React from "react";

const IconBookMark = ({
  className = "",
  fill = "#4F4F4F",
}: {
  className?: string;
  fill?: string;
}) => {
  return (
  <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M10.167 0.5H1.83366C0.916992 0.5 0.166992 1.25 0.166992 2.16667V15.5L6.00033 13L11.8337 15.5V2.16667C11.8337 1.25 11.0837 0.5 10.167 0.5Z"  fill={fill}/>
</svg>


  );
};

export default IconBookMark;
