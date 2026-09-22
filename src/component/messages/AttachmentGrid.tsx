import DialogPopup from "../ui/dashboard/DialogPopup";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode } from "swiper/modules";
import { useState } from "react";
import Image from "next/image";

const AttachmentGrid = ({
  attachments,
}: {
  attachments: { url: string }[];
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div
        className={`grid gap-1 mt-4 w-[212px] ${
          attachments.length > 1 ? "grid-cols-2 " : ""
        }`}
      >
        {attachments.slice(0, 3).map((item: { url: string }, i: number) => (
          <div
            className={`relative pb-[100%] ${
              attachments.length % 2 === 0 ? "" : "last:col-span-2"
            }`}
            key={`attachments-${i}`}
          >
            <Image
              src={item.url}
              alt="Attachment"
              width={attachments.length % 2 === 0 ? 104 : 212}
              height={attachments.length % 2 === 0 ? 104 : 212}
              className="object-cover w-full h-full absolute top-0 left-0 rounded-lg"
            />{" "}
          </div>
        ))}

        {attachments.length > 3 && (
          <div className="relative w-[104px] h-[104px]">
            <Image
              src={attachments[3].url}
              alt="More"
              width={attachments.length > 1 ? 104 : 208}
              height={attachments.length > 1 ? 104 : 208}
              className="object-cover w-full h-full rounded-lg"
            />
            {attachments.length > 4 && (
              <button
                onClick={() => setOpen(true)}
                className="absolute inset-0 flex items-center justify-center text-white bg-black/40 rounded-lg font-bold text-base"
              >
                +{attachments.length - 4}
              </button>
            )}
          </div>
        )}
      </div>
      <DialogPopup
        heading="Images"
        open={open}
        setShowCreateModal={setOpen}
        mode="light"
        overlayStyle="backdrop-blur-sm"
      >
        {attachments.length && (
          <Swiper
            spaceBetween={10}
            modules={[FreeMode]}
            className="rounded-lg overflow-hidden"
          >
            {attachments.map((item: { url: string }, i: number) => (
              <SwiperSlide
                className={`relative !h-auto`}
                key={`attachments-main-${i}`}
              >
                <Image
                  src={item.url}
                  alt="Attachment"
                  width={700}
                  unoptimized
                  height={700}
                  className="object-cover h-full rounded-lg"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </DialogPopup>
    </div>
  );
};

export default AttachmentGrid;
