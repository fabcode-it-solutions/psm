import React from "react";

const IconVerified = ({
  className = "",
  stroke = "black",
}: {
  className?: string;
  stroke?: string;
}) => {
  return (
 

<svg width="15" height="18" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg"className= {className}>
<path d="M7.75 0.833252L0.25 4.16658V9.16658C0.25 13.7916 3.45 18.1166 7.75 19.1666C12.05 18.1166 15.25 13.7916 15.25 9.16658V4.16658L7.75 0.833252ZM13.5833 9.16658C13.5833 12.9333 11.1 16.4083 7.75 17.4416C4.4 16.4083 1.91667 12.9333 1.91667 9.16658V5.24992L7.75 2.65825L13.5833 5.24992V9.16658ZM3.925 9.65825L2.75 10.8333L6.08333 14.1666L12.75 7.49992L11.575 6.31658L6.08333 11.8083L3.925 9.65825Z" stroke={stroke}/>
</svg>



  );
};

export default IconVerified;
