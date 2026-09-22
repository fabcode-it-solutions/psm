"use client";

import React, { useState } from "react";
import { Flag } from "lucide-react";
import Button from "@/component/ui/Button/Button";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";


const FLAG_REASONS = [
  { value: "incorrect", label: "Incorrect information" },
  { value: "duplicate", label: "Duplicate listing" },
  { value: "spam", label: "Spam or fake" },
  { value: "policy", label: "Policy violation" },
];

export default function FlagPart({ partId }: { partId: number }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitFlag() {
    if (!reason || !severity) return;

    setLoading(true);

    const res = await fetch(`/api/parts/${partId}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason,
        reasonLabel: reason,
        severity,
        notes,
      }),
    });

    setLoading(false);

    if (res.status === 401) {
      alert("Please login to flag this part");
      return;
    }

    if (res.ok) {
      alert("Part flagged for review");
      setOpen(false);
      setReason("");
      setSeverity("");
      setNotes("");
    } else {
      alert("Failed to submit flag");
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <Button
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Flag className="w-4 h-4" />
        Flag
      </Button>

      {/* Popup */}
      <DialogPopup
        open={open}
        setShowCreateModal={setOpen}
        heading="Flag this part"
        mode="light"
      >
        <div className="space-y-4">
          {/* Reason */}
          <div>
            <label className="text-sm font-medium">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full mt-1 border rounded-md px-3 py-2"
            >
              <option value="">Select reason</option>
              {FLAG_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="text-sm font-medium">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full mt-1 border rounded-md px-3 py-2"
            >
              <option value="">Select severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-1 border rounded-md px-3 py-2 min-h-[80px]"
              placeholder="Add extra details for admin review"
            />
          </div>

          {/* Submit */}
          <Button
            className="w-full"
            disabled={!reason || !severity || loading}
            onClick={submitFlag}
          >
            {loading ? "Submitting..." : "Submit Flag"}
          </Button>
        </div>
      </DialogPopup>
    </>
  );
}
