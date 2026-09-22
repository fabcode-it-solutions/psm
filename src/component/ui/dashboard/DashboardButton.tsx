import { Plus } from "lucide-react";
import React, { MouseEventHandler } from "react";

const DashboardButton = ({
  onClick,
  icon,
  buttonText,
  type,
  className,
}: {
  icon?: React.ReactNode | false;
  buttonText: string;
  type?: "button" | "submit";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}) => {
  return (
    <button
      onClick={onClick}
      type={type || "button"}
      className={`flex items-center gap-2 px-4 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 font-sofia-sans font-medium transition-colors ${
        className || ""
      }`}
    >
      {icon || <Plus className="w-4 h-4" />}
      {buttonText}
    </button>
  );
};

export default DashboardButton;
