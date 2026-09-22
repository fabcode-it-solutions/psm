/* eslint-disable @next/next/no-img-element */
"use client";
import { useRef, useEffect, useState } from "react";
import QRCodeStyling, { FileExtension, Options } from "qr-code-styling";
import IconViewAll from "@/assets/icons/IconViewAll";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/component/ui/Button/Button";
import { Download } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Open Camera",
    desc: "Open your device’s camera or the scanner in this app.",
  },
  {
    step: 2,
    title: "Point to QR Code",
    desc: "Align the QR code within the frame of your camera view.",
  },
  {
    step: 3,
    title: "Hold Steady",
    desc: "Keep the camera steady until the QR code is recognized.",
  },
  {
    step: 4,
    title: "Tap the Link",
    desc: "Once detected, tap the notification or link to continue.",
  },
];
const QRBuilderPage = ({
  url,
  download,
}: {
  url: string;
  download?: boolean;
}) => {
  const [options, setOptions] = useState<Options>({
    width: 380,
    height: 380,
    data: "https://overlap-theta.vercel.app/" + url,
    image: "/assets/images/Overlap_HorizontalLogo.png",
    dotsOptions: {
      color: "#000",
      type: "rounded",
    },
    backgroundOptions: {
      color: "#ffffff",
    },
    imageOptions: {
      margin: 0,
      imageSize: 0.9,
      hideBackgroundDots: false,
    },
  });
  const ref = useRef<HTMLDivElement>(null);
  const [qrCode, setQrCode] = useState<QRCodeStyling>();
  const [instruction, setInstruction] = useState(false);
  useEffect(() => {
    setQrCode(new QRCodeStyling(options));
  }, []);
  useEffect(() => {
    if (ref.current) {
      qrCode?.append(ref.current);
    }
  }, [qrCode, ref]);
  const onDownloadClick = () => {
    if (!qrCode) return;
    qrCode.download({
      extension: "jpeg",
    });
  };
  return (
    <section className="w-full  bg-white p-6 rounded-lg ">
      <div className="flex flex-col gap-[40px]">
        <div className="flex justify-center mt-6">
          <div
            className={`relative overflow-hidden `}
            style={{ width: 380, height: 380 }}
          >
            <div ref={ref} />
          </div>
        </div>
        {download && (
          <div className="flex justify-center w-full">
            <Button
              onClick={onDownloadClick}
              type="button"
              classNameInner="!flex items-center gap-2"
            >
              <Download /> Download
            </Button>
          </div>
        )}
        <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-100 p-4">
          <div
            onClick={() => setInstruction((prev) => !prev)}
            className=" cursor-pointer flex items-center gap-4 justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center text-white font-bold shadow-md">
                QR
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Scan QR Code Instruction
                </h2>
              </div>
            </div>
            <div>
              <IconViewAll />
            </div>
          </div>

          <AnimatePresence>
            {instruction && (
              <motion.div
                className="space-y-4 mt-6"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <AnimatePresence mode="popLayout">
                  {steps.map((item, index) => (
                    <motion.div
                      key={`step-${item.step}`}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.08 }}
                      className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border text-teal-600 font-semibold shadow-sm">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default QRBuilderPage;
