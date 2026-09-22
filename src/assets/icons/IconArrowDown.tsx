import React from 'react'

const IconArrowDown =  ({
  className = "",
  fill = "#4F4F4F",
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <div>
      <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M6.03215 8.29289C6.42268 7.90237 7.05584 7.90237 7.44636 8.29289L13.7393 14.5858L20.0322 8.29289C20.4227 7.90237 21.0558 7.90237 21.4464 8.29289C21.8369 8.68342 21.8369 9.31658 21.4464 9.70711L14.4464 16.7071C14.0558 17.0976 13.4227 17.0976 13.0322 16.7071L6.03215 9.70711C5.64163 9.31658 5.64163 8.68342 6.03215 8.29289Z" fill = {fill}/>
</svg>

    </div>
  )
}

export default IconArrowDown
