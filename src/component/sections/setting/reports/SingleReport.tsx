"use client";
import { useState } from "react";
import Image from "next/image";
import { Check, StepBack } from "lucide-react";
import { IoArrowBack } from "react-icons/io5";
import Link from "next/link";

type Report = {
  id: number;
  reportId: string;
  reporterUserId: number;
  reportedUserId: number;
  reportedUserName: string;
  reason: string;
  description: string;
  category: string;
  status: string;
  adminNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  screenshotUrl?: string;
};

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear() % 100;

  return `${day}/${month}/${year}`;
}

const steps = [
  { id: 1, title: "Report Submitted" },
  { id: 2, title: "Admin Reviewed" },
  { id: 3, title: "Resolved" },
];

export default function SingleReport({ report }: { report: Report }) {
  const [isOpen, setIsOpen] = useState(false);

  const currentStep =
    report.status.toLowerCase() === "pending"
      ? 1
      : report.status.toLowerCase() === "reviewed"
      ? 2
      : 3;

  return (
    <section className="overflow-x-hidden max-w-[949px]">
      <div className="lg:w-[949px] w-[62.76%] bg-[#F4F4F4] rounded-[10px] py-[25.5px] flex flex-col mt-[38px] px-6 gap-4 mx-auto lg:mx-0 overflow-x-hidden">
        <Link href="/settings/reports" className="flex items-center gap-2">
          <IoArrowBack /> Go Back
        </Link>
        <h1 className="font-supreme flex font-bold text-[26px] leading-[18px] tracking-[-0.17px] capitalize text-dark-blue-cm">
          {report.reportId}
        </h1>
        <h2 className="font-supreme font-light text-base leading-[100%] tracking-[0.01em]  text-[#002029]">
          Reported user:{" "}
          <span className="font-supreme font-bold text-base leading-[100%] tracking-[0.01em] text-[#002029]">
            {report.reportedUserName}
          </span>
        </h2>
        <h3 className="font-sofia-sans font-bold text-sm leading-[100%] tracking-[0.04em] text-[#002029]">
          Status: {report.status}
        </h3>
      </div>

      <div className="flex justify-between mt-6 gap-6 flex-wrap mx-8 lg:mx-0">
        <div className="flex flex-col gap-[10px] max-w-[518px]  w-full">
          <>
            <span>
              {report.screenshotUrl && (
                <div
                  className="relative w-1/2 h-[250px] rounded-[10px] overflow-hidden cursor-pointer"
                  onClick={() => setIsOpen(true)}
                >
                  <Image
                    src={report.screenshotUrl || ""}
                    alt="Content preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </span>

            {isOpen && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-10">
                <div className="relative w-[90%] h-[90%]">
                  <Image
                    src={report.screenshotUrl || ""}
                    alt="Fullscreen preview"
                    fill
                    className="object-contain rounded-lg"
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded-lg shadow"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </>
          <p className="font-inter text-xs font-normal  tracking-[0%] text-[#002029]">
            {report.description}
          </p>
          {report.adminNotes && (
            <p className="font-inter text-xs font-normal  tracking-[0%] text-[#002029] bg-white p-4 rounded-md">
              <b>Admin Comment:</b>
              <br />
              {report.adminNotes}
            </p>
          )}
          <span className="flex gap-[7px]">
            <button className="px-[12px] py-[6px] rounded-[6px] bg-[#002029] text-[#54DC00] font-inter font-normal text-xs leading-[100%] tracking-[0em]">
              {report.reason}
            </button>
            <button className="px-[12px] py-[6px] rounded-[6px] bg-[#002029] text-[#54DC00] font-inter font-normal text-xs leading-[100%] tracking-[0em]">
              {report.category}
            </button>
          </span>
        </div>

        <div className="max-w-[400px] w-full rounded-[10px] bg-white pt-4 pl-[18px]  h-[391px] mb-6 lg:mb-0">
          <h2 className="mb-[15px] font-supreme font-medium text-[16px] leading-[100%] tracking-[0.01em] text-[#002029] pl-[0.06px]">
            Status
          </h2>

          <div className="relative ml-3 flex flex-col text-[#002029]">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = step.id < currentStep;
              const isLast = index === steps.length - 1;

              return (
                <div
                  key={step.id}
                  className={`relative pl-[46px] pb-20 last:pb-0 text-[#002029]`}
                >
                  {!isLast && (
                    <div
                      className={`absolute left-[-2px] top-6 flex items-center justify-center h-full border-l-2 border-dashed ${
                        isCompleted ? "border-[#54DC00]" : "border-[#E0E0E0]"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="text-white w-3 h-3" />
                      ) : (
                        ""
                      )}
                    </div>
                  )}

                  <span
                    className={`absolute -left-[13px] top-4 flex h-6 w-6 items-center justify-center rounded-full ${
                      isCompleted
                        ? "bg-[#54DC00]"
                        : isActive
                        ? "border-2 border-dashed border-accent-100 bg-white"
                        : "bg-[#F2F2F2]"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="text-white w-3 h-3" />
                    ) : (
                      ""
                    )}
                  </span>

                  <div className="flex items-center gap-[47.43px]">
                    <span className="flex flex-col gap-2">
                      <p
                        className={`font-sofia font-semibold text-base leading-[24px] tracking-[0.04em] ${
                          isCompleted || isActive
                            ? "text-dark-blue-cm"
                            : "text-dark-blue-cm"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="font-sofia-sans font-normal text-sm leading-[100%] tracking-[0.04em] text-[#BDBDBD]">
                        {formatDateShort(report.createdAt)}
                      </p>
                    </span>

                    {isActive && (
                      <span className="py-[2px] px-[1px]">
                        <svg
                          width="21"
                          height="20"
                          viewBox="0 0 21 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.4336 0C15.9564 0 20.4336 4.47715 20.4336 10C20.4336 15.5228 15.9564 20 10.4336 20C4.91075 20 0.433594 15.5228 0.433594 10C0.433594 4.47715 4.91075 0 10.4336 0ZM13.6533 6.96967L9.18359 11.4393L7.21392 9.46967C6.92103 9.17678 6.44616 9.17678 6.15326 9.46967C5.86037 9.76256 5.86037 10.2374 6.15326 10.5303L8.65326 13.0303C8.94616 13.3232 9.42103 13.3232 9.71392 13.0303L14.7139 8.03033C15.0068 7.73744 15.0068 7.26256 14.7139 6.96967C14.421 6.67678 13.9462 6.67678 13.6533 6.96967Z"
                            fill="#54DC00"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
