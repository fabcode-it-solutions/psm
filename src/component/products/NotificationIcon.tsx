
import IconAlertNotification from "@/assets/icons/IconAlertNotification";
import IconNotificationMute from "@/assets/icons/IconNotificationMute";
import { cn } from "@sglara/cn";
import React, { useEffect, useState } from "react";

const NotificationIcon = ({
  className,
  id,
  isMarked,
}: {
  className?: string;
  id?: number;
  isMarked: boolean;
}) => {
  const [marked, setMarked] = useState(false);
  const handleBookmark = () => {
    console.log(id);
    setMarked((prev) => !prev);
  };
  useEffect(() => {
    setMarked(isMarked);
  }, [isMarked]);
  return (
    <button
      type="button"
      onClick={() => handleBookmark()}
      className={cn(
        "w-11 h-11 cursor-pointer flex justify-center items-center rounded-[20px] bg-dark-blue-cm/80",
        className
      )}
    >
      {marked ? (
        <IconAlertNotification fill = "#54DC00" className="fill-accent-100" />
      ) : (
        <IconNotificationMute fill = "#54DC00" className="fill-accent-100" />
      )}
    </button>
  );
};

export default NotificationIcon;
