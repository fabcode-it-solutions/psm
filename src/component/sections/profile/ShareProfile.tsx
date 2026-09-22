import IconShare from "@/assets/icons/IconShare";
import TooltipPopup from "@/component/global/TooltipPopup";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import React, { useCallback, useState } from "react";
import QRBuilderPage from "../QR-Builder/QRBuilderPage";
import { usePathname } from "next/navigation";
import { Copy, QrCode } from "lucide-react";
import toast from "react-hot-toast";

const ShareProfile = () => {
  const [openQr, setQr] = useState(false);
  const pathname = usePathname();
  let copiedRate = 0;
  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_APP_URL}${pathname}`
    );
    if (copiedRate < 5) {
      toast.success("Link Copied");
      copiedRate++;
    }
  }, [copiedRate]);
  return !openQr ? (
    <TooltipPopup
      opened={openQr}
      heading="Share Profile"
      headerWrapperStyle="!flex-row justify-between items-center"
      icon={
        <span className="bg-accent-100 w-12 h-12 flex justify-center items-center rounded-full">
          <IconShare fill="#fff" className="w-6 h-6" />
        </span>
      }
    >
      <div className="space-y-4">
        <button
          className="flex items-center group gap-2 p-4 text-dark-blue-cm bg-white rounded-md w-full hover:bg-accent-100 transition-all duration-300 hover:text-white"
          type="button"
          onClick={() => setQr(true)}
        >
          <QrCode className="text-dark-blue-cm group-hover:text-white transition-all duration-300" />{" "}
          Share via qr
        </button>
        <button
          className="flex items-center group gap-2 p-4 text-dark-blue-cm bg-white rounded-md w-full hover:bg-accent-100 transition-all duration-300 hover:text-white"
          type="button"
          onClick={copyLink}
        >
          <Copy className="text-dark-blue-cm group-hover:text-white transition-all duration-300" />{" "}
          Copy profile Link
        </button>
      </div>
    </TooltipPopup>
  ) : (
    <DialogPopup
      heading="QR Builder"
      open={openQr}
      setShowCreateModal={setQr}
      mode="light"
      overlayStyle="backdrop-blur-sm"
    >
      <QRBuilderPage download={true} url={pathname} />
    </DialogPopup>
  );
};

export default ShareProfile;
