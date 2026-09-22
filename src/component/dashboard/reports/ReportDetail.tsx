/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import { FormField } from "@/component/ui/dashboard/FormField";
import { useForm } from "react-hook-form";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import DeleteConfirmationDialog from "@/component/ui/dashboard/DeleteConfirmationDialog";
import toast from "react-hot-toast";

interface Report {
  id: number;
  reportId: string;
  reason: string;
  description: string | null;
  category: string | null;
  status: string | null;
  reporterUsername: string | null;
  reportedUsername: string | null;
  imageUrl?: string | null;
}

interface ReportPageProps {
  report: Report;
}

interface ResolveFormData {
  adminNotes: string;
}

export default function ReportDetail({ report }: ReportPageProps) {
  const [openResolve, setOpenResolve] = useState(false);
  const [selectedReportIdForReview, setSelectedReportIdForReview] = useState<
    number | null
  >(null);
  const [status, setStatus] = useState(report.status);
  const [loading, setLoading] = useState(false);

  const currentUserId = useSelector(
    (state: RootState) => state.user.user?.user?.id
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResolveFormData>({
    defaultValues: { adminNotes: "Checked screenshots, valid report." },
  });

  const updateStatus = async (
    newStatus: "reviewed" | "resolved",
    notes?: string
  ) => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reports/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: report.id,
          adminId: currentUserId,
          adminNotes: notes,
          statusRecord: [{ label: newStatus }],
        }),
      });

      if (res.ok) {
        toast.success(`Report ${newStatus} successfully`);
        setStatus(newStatus);
        setOpenResolve(false);
        setSelectedReportIdForReview(null);
        reset();
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to update report");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="overflow-x-hidden max-w-[949px]">
      <div className="lg:w-[949px] w-[62.76%] bg-white rounded-[10px] py-[25.5px] flex flex-col mt-[38px] px-6 gap-4 mx-auto lg:mx-0 overflow-x-hidden">
        <h2 className="font-supreme font-bold text-[26px] leading-[18px] tracking-[-0.17px] capitalize text-dark-blue-cm">
          {report.reportId}
        </h2>
        <h3 className="font-supreme font-light text-base leading-[100%] tracking-[0.01em] text-[#002029]">
          Reported user:{" "}
          <span className="font-supreme font-bold text-base leading-[100%] tracking-[0.01em] text-[#002029]">
            {report.reporterUsername}
          </span>
        </h3>
      </div>
      <div className="flex flex-col gap-[25px] max-w-[518px] w-full mt-[20px]">
        {report.imageUrl && (
          <div className="mt-4">
            <img
              src={report.imageUrl}
              alt="Report Media"
              className="max-w-full rounded-lg object-cover"
            />
          </div>
        )}

        <p className="font-inter text-xs font-normal tracking-[0%] text-gray-100 mt-4">
          {report.description}
        </p>

        <span className="flex gap-[7px] ">
          <button className="px-[12px] py-[8px] capitalize rounded-[6px] bg-white text-[#54DC00] font-inter font-normal text-xs leading-[100%] tracking-[0em]">
            {report.reason}
          </button>
          <button className="px-[12px] py-[8px] capitalize rounded-[6px] bg-white text-[#54DC00] font-inter font-normal text-xs leading-[100%] tracking-[0em]">
            {report.category}
          </button>
        </span>
        <div className="flex gap-4">
          <button
            type="button"
            className={`px-4 py-2 rounded font-semibold ${
              status === "resolved"
                ? "bg-green-500 text-white"
                : status === "reviewed"
                ? "bg-green-500 text-white !cursor-not-allowed"
                : "bg-gray-300 text-black cursor-pointer"
            }`}
            disabled={status === "reviewed" || status === "resolved"}
            onClick={() => setSelectedReportIdForReview(report.id)}
          >
            {status === "reviewed" || status === "resolved"
              ? "Reviewed"
              : "Review"}
          </button>
          <button
            type="button"
            className={`px-4 py-2 border rounded font-sofia-sans transition-colors duration-200 ${
              status === "reviewed"
                ? "bg-amber-200 text-black cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            onClick={() => {
              if (status !== "reviewed") {
                toast.error("Please review the report before resolving");
                return;
              }
              setOpenResolve(true);
            }}
          >
            {status === "reviewed" ? "Issue Resolve" : "Report Solved"}
          </button>
        </div>
      </div>
      <DialogPopup
        heading="Resolve Report"
        open={openResolve}
        setShowCreateModal={setOpenResolve}
      >
        <form
          onSubmit={handleSubmit((data) =>
            updateStatus("resolved", data.adminNotes)
          )}
          className="flex flex-col gap-4 p-4"
        >
          <FormField
            type="text"
            label="Admin Notes"
            placeholder="Add notes"
            {...register("adminNotes")}
            error={errors.adminNotes}
            required
          />
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={() => {
                setOpenResolve(false);
                reset();
              }}
              className="px-4 py-2 border border-gray-5/20 rounded text-light-100 hover:bg-gray-5/10 font-sofia-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-sofia-sans font-medium"
              disabled={loading}
            >
              Resolve
            </button>
          </div>
        </form>
      </DialogPopup>
      {selectedReportIdForReview !== null && (
        <DeleteConfirmationDialog
          deleteBrandId={selectedReportIdForReview}
          setDeleteBrandId={setSelectedReportIdForReview}
          heading="Confirm Review"
          content="Are you sure you want to mark this report as reviewed?"
          deleteLoading={loading}
          actionLabel="Review"
          confirmDelete={() => updateStatus("reviewed")}
        />
      )}
    </section>
  );
}
