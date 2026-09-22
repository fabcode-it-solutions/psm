"use client";
import React, { useEffect, useState } from "react";
import { TrendingUp, Users, Bell, Eye, Loader2 } from "lucide-react";
interface DemandStatsProps {
  partSlug: string;
  className?: string;
}

interface DemandData {
  demandScore: number;
  wishlistCount: number;
  inquiryCount: number;
  viewCount: number;
  restockRequestCount: number;
  subscriberCount: number;
  inventory: number;
}

export default function DemandStats({
  partSlug,
  className = "",
}: DemandStatsProps) {
  const [data, setData] = useState<DemandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDemandStats();
  }, [partSlug]);

  const fetchDemandStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/parts/${partSlug}/demand`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch demand stats");
      }
    } catch (err) {
      console.error("Error fetching demand stats:", err);
      setError("Failed to load demand statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin text-gray-4" />
        <span className="ml-2 text-sm text-gray-4 font-sofia-sans">
          Loading demand stats...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  // Only show if out of stock and has some demand
  if (data.inventory > 0 || data.demandScore === 0) {
    return null;
  }

  const stats = [
    {
      icon: TrendingUp,
      label: "Demand Score",
      value: data.demandScore,
      show: true,
    },
    {
      icon: Bell,
      label: "Restock Requests",
      value: data.restockRequestCount,
      show: data.restockRequestCount > 0,
    },
    {
      icon: Users,
      label: "People Watching",
      value: data.wishlistCount,
      show: data.wishlistCount > 0,
    },
    {
      icon: Eye,
      label: "Recent Views",
      value: data.viewCount,
      show: data.viewCount > 0,
    },
  ].filter((stat) => stat.show);

  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-dark-100 border border-gray-5/20 rounded-lg ${className}`}
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="flex items-center gap-3">
            <div className="p-2 bg-accent-100/10 rounded-lg">
              <Icon className="w-5 h-5 text-accent-100" />
            </div>
            <div>
              <div className="text-lg font-semibold text-light-100 font-sofia-sans">
                {stat.value}
              </div>
              <div className="text-xs text-gray-4 font-sofia-sans">
                {stat.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}