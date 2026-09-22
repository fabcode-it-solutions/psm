// components/dashboard/parts/ModerationReviewPopup.tsx
"use client";

import React, { useState } from "react";
import { Check, X, Eye, AlertTriangle } from "lucide-react";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import Button from "@/component/ui/Button/Button";
import toast from "react-hot-toast";

interface ModerationFlag {
  id: number;
  partId: number;
  reason: string;
  reasonLabel: string;
  severity: "low" | "medium" | "high";
  notes?: string;
  flaggedBy: string;
  flaggedAt: string;
}

interface ModerationReviewPopupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  flag: ModerationFlag | null;
  partTitle: string;
  onActionComplete?: () => void;
}

export default function ModerationReviewPopup({
  open,
  setOpen,
  flag,
  partTitle,
  onActionComplete,
}: ModerationReviewPopupProps) {
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  if (!flag) return null;

  const handleAction = async (action: "approve" | "reject" | "hide") => {
    setLoading(true);

    try {
      const response = await fetch(`/api/moderation/${flag.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          adminNotes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          action === "approve"
            ? "Flag approved - Part marked for review"
            : action === "reject"
            ? "Flag rejected - Part remains active"
            : "Part hidden from marketplace"
        );
        setOpen(false);
        setAdminNotes("");
        onActionComplete?.();
      } else {
        toast.error(result.error || "Failed to process action");
      }
    } catch (error) {
      console.error("Moderation action error:", error);
      toast.error("Failed to process moderation action");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <DialogPopup
      open={open}
      setShowCreateModal={setOpen}
      heading="Review Moderation Flag"
    >
      <div className="space-y-6">
        {/* Part Info */}
        <div className="bg-gray-5/5 rounded-lg p-4 border border-gray-5/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-4 font-sofia-sans mb-1">
                Flagged Part
              </p>
              <p className="text-base font-semibold text-light-100 font-sofia-sans">
                {partTitle}
              </p>
              <p className="text-xs text-gray-4 font-sofia-sans mt-1">
                Part ID: #{flag.partId}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                flag.severity
              )}`}
            >
              {flag.severity.toUpperCase()} Priority
            </span>
          </div>
        </div>

        {/* Flag Details */}
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-4 font-sofia-sans mb-1">Reason</p>
            <p className="text-base text-light-100 font-sofia-sans">
              {flag.reasonLabel}
            </p>
          </div>

          {flag.notes && (
            <div>
              <p className="text-sm text-gray-4 font-sofia-sans mb-1">
                Additional Notes
              </p>
              <p className="text-sm text-light-100 font-sofia-sans bg-gray-5/5 p-3 rounded border border-gray-5/10">
                {flag.notes}
              </p>
            </div>
          )}

          <div className="flex gap-4 text-xs text-gray-4 font-sofia-sans">
            <div>
              <span className="font-medium">Flagged By:</span> {flag.flaggedBy}
            </div>
            <div>
              <span className="font-medium">Date:</span>{" "}
              {formatDate(flag.flaggedAt)}
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        <div>
          <label className="text-sm font-medium text-light-100 font-sofia-sans mb-2 block">
            Admin Notes (Optional)
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="w-full bg-gray-5/5 border border-gray-5/20 rounded-lg px-3 py-2 text-light-100 placeholder-gray-4 font-sofia-sans text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-accent-100"
            placeholder="Add notes about your decision..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAction("approve")}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-sofia-sans font-medium disabled:opacity-50 border border-green-500/30"
            >
              <Check className="w-4 h-4" />
              Approve Flag
            </button>

            <button
              onClick={() => handleAction("reject")}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-sofia-sans font-medium disabled:opacity-50 border border-red-500/30"
            >
              <X className="w-4 h-4" />
              Reject Flag
            </button>
          </div>

          <button
            onClick={() => handleAction("hide")}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors font-sofia-sans font-medium disabled:opacity-50 border border-yellow-500/30"
          >
            <AlertTriangle className="w-4 h-4" />
            Hide Part from Marketplace
          </button>
        </div>
        {loading && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-100"></div>
            <span className="ml-2 text-sm text-gray-4 font-sofia-sans">
              Processing...
            </span>
          </div>
        )}
      </div>
    </DialogPopup>
  );
}
