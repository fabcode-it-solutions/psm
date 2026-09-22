"use client";

import React from "react";
import { TrendingUp, Users, Bell, Eye } from "lucide-react";
import { formatDemandStats, getDemandMetrics } from "@/utils/demand.util";

interface DemandBadgeProps {
  demandScore: number;
  inventory: number;
  wishlistCount?: number;
  inquiryCount?: number;
  restockRequestCount?: number;
  className?: string;
  showStats?: boolean;
  variant?: "default" | "compact" | "detailed";
}

export default function DemandBadge({
  demandScore,
  inventory,
  wishlistCount = 0,
  inquiryCount = 0,
  restockRequestCount = 0,
  className = "",
  showStats = false,
  variant = "default",
}: DemandBadgeProps) {
  const demand = getDemandMetrics(demandScore, inventory);
console.log(demand,"demand")
  if (!demand) return null;

  const stats = formatDemandStats({
    wishlistCount,
    inquiryCount,
    restockRequestCount,
  });

  // Compact variant (for tables)
  if (variant === "compact") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${demand.color} ${className}`}
        title={`Demand Score: ${demand.score}`}
      >
        <TrendingUp className="w-3 h-3" />
        {demand.level === "very-high" && "Very High"}
        {demand.level === "high" && "High"}
        {demand.level === "medium" && "Medium"}
        {demand.level === "low" && "Low"}
      </span>
    );
  }

  // Detailed variant
  if (variant === "detailed") {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Main Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${demand.bgColor} ${demand.color} font-sofia-sans text-sm font-semibold`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>{demand.label}</span>
          <span className="ml-2 px-2 py-0.5 bg-white/10 rounded text-xs">
            Score: {demand.score}
          </span>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-2">
          {restockRequestCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-light-100">
              <div className="p-1.5 bg-gray-5/10 rounded">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">{restockRequestCount}</div>
                <div className="text-xs text-gray-4">
                  Restock {restockRequestCount === 1 ? "Request" : "Requests"}
                </div>
              </div>
            </div>
          )}

          {wishlistCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-light-100">
              <div className="p-1.5 bg-gray-5/10 rounded">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">{wishlistCount}</div>
                <div className="text-xs text-gray-4">
                  {wishlistCount === 1 ? "Person" : "People"} Watching
                </div>
              </div>
            </div>
          )}

          {inquiryCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-light-100">
              <div className="p-1.5 bg-gray-5/10 rounded">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">{inquiryCount}</div>
                <div className="text-xs text-gray-4">
                  Recent {inquiryCount === 1 ? "Inquiry" : "Inquiries"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main Badge */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${demand.bgColor} ${demand.color} font-sofia-sans text-sm font-medium`}
      >
        <TrendingUp className="w-4 h-4" />
        {demand.label}
      </div>

      {/* Stats (optional) */}
      {showStats && stats.length > 0 && (
        <div className="flex flex-wrap gap-3 text-xs text-gray-4">
          {restockRequestCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Bell className="w-3 h-3" />
              {stats[0]}
            </span>
          )}
          {wishlistCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Users className="w-3 h-3" />
              {stats.find((s) => s.includes("watching"))}
            </span>
          )}
          {inquiryCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {stats.find((s) => s.includes("inquir"))}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Export compact variant as separate component for convenience
export function DemandBadgeCompact({
  demandScore,
  inventory,
}: {
  demandScore: number;
  inventory: number;
}) {
  return (
    <DemandBadge
      demandScore={demandScore}
      inventory={inventory}
      variant="compact"
    />
  );
}