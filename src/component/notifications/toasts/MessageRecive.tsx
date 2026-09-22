import IconClose from "@/assets/icons/IconClose";
import Image from "next/image";
import React from "react";
import toast from "react-hot-toast";

const MessageRecive = ({
  data,
  id,
  visible,
}: {
  data: { profieImage: string; username: string; message: string };
  id: string;
  visible: boolean;
}) => {
  return (
    <div
      className={`${
        visible ? "animate-custom-enter" : "animate-custom-leave"
      } max-w-md w-full bg-white relative shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 pt-0.5">
            <Image
              className="h-10 w-10 rounded-full"
              src={data.profieImage || "/assets/images/WithoutProfil.png"}
              width={40}
              height={40}
              alt="WithoutProfile"
            />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-dark-blue-cm">
              <span className="text-xs ">New message:</span> {data.username}
            </p>
            <p className="mt-1 text-sm text-gray-500 text-overflow-splice !max-w-xs">
              {data.message.slice(0, 200)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(id)}
          className="absolute top-0 right-0 p-1 flex items-center justify-center"
        >
          <IconClose />
        </button>
      </div>
    </div>
  );
};

export default MessageRecive;
