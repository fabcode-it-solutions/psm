/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Flag,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { FormField } from "@/component/ui/dashboard/FormField";
import PageHeader from "@/component/dashboard/PageHeader";
import { formatDate } from "@/utils/defaults";
import Pagination from "@/component/ui/dashboard/Pagination";
import toast from "react-hot-toast";

interface ModerationItem {
  id: number;
  partId: number;
  partTitle: string;
  partSlug: string;
  status: "pending" | "approved" | "rejected";
  severity: string;
  reason: string;
  reasonLabel: string;
  notes: string;
  flaggedBy: string;
  flaggedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

interface Filters {
  search: string;
  status: string;
  severity: string;
  reason: string;
}

const ModerationQueuePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [pagination, setPagination] = useState<any>({});
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all", // 👈 show ALL, not only pending
    severity: "",
    reason: "",
  });

  const [reviewingItemId, setReviewingItemId] = useState<number | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  /* -------------------------------- API -------------------------------- */

  const getModerationItems = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.severity && { severity: filters.severity }),
      });

      const res = await fetch(`/api/moderation?${params}`);
      const result = await res.json();

      if (result.success) {
        setModerationItems(result.data);
        setPagination(result.pagination);
      }
    } catch {
      toast.error("Failed to load moderation queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getModerationItems();
  }, [currentPage, filters]);

  /* --------------------------- REVIEW HANDLER --------------------------- */

  const handleReview = async (action: "approve" | "reject") => {
    if (!reviewingItemId) return;

    try {
      const res = await fetch(`/api/moderation/${reviewingItemId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notes: reviewNotes,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(
          action === "approve"
            ? "Approved successfully"
            : "Rejected successfully"
        );

        // ✅ UPDATE ROW LOCALLY (DO NOT REMOVE)
        setModerationItems((prev) =>
          prev.map((item) =>
            item.id === reviewingItemId
              ? {
                  ...item,
                  status: action === "approve" ? "approved" : "rejected",
                  reviewedAt: new Date().toISOString(),
                  reviewNotes,
                }
              : item
          )
        );

        setReviewingItemId(null);
        setReviewNotes("");
      } else {
        toast.error(result.error || "Review failed");
      }
    } catch {
      toast.error("Review failed");
    }
  };

  /* ------------------------------ HELPERS ------------------------------- */

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "approved":
        return "bg-green-500/20 text-green-400";
      case "rejected":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "approved":
        return <CheckCircle className="w-3 h-3" />;
      case "rejected":
        return <XCircle className="w-3 h-3" />;
      default:
        return <Flag className="w-3 h-3" />;
    }
  };

  /* -------------------------------- UI --------------------------------- */

  return (
    <div className="bg-dark-100">
      <PageHeader
        heading="Flagged Items"
        describe="Review and manage flagged parts"
      />

      <div className="space-y-6 mt-6">
        {/* Filters */}
        <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-4" />
              <FormField
                type="text"
                placeholder="Search by part name..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, search: e.target.value }))
                }
                name="search"
                inputStyle="pl-10"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((p) => ({ ...p, status: e.target.value }))
              }
              className="px-4 py-2 bg-dark-100 border border-gray-5/20 rounded-lg text-light-100 text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-dark-100 border border-gray-5/20 rounded-lg overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-gray-4">Loading...</div>
          ) : moderationItems.length === 0 ? (
            <div className="py-12 text-center text-gray-4">
              No flagged items
            </div>
          ) : (
            <table className="w-full text-sm font-sofia-sans">
              <thead className="bg-gray-5/10 text-gray-4">
                <tr>
                  <th className="px-4 py-3 text-left">Username</th>
                  <th className="px-4 py-3 text-left">Part Name</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Last Updated</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-5/20">
                {moderationItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-5/5">
                    <td className="px-4 py-3 text-light-100">
                      {item.flaggedBy}
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/parts/view/${item.partSlug}`}
                        className="text-accent-100 hover:underline"
                      >
                        {item.partTitle}
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {getStatusIcon(item.status)}
                        {item.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-4">
                      {formatDate(item.reviewedAt ?? item.flaggedAt)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {item.status === "pending" ? (
                        reviewingItemId === item.id ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleReview("approve")}
                              className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview("reject")}
                              className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReviewingItemId(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent-100/20 text-accent-100 rounded"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            Review
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-gray-4">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
        />
      </div>
    </div>
  );
};

export default ModerationQueuePage;
