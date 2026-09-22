"use client";

import React from "react";
import { Boxes, FolderTree, Folders } from "lucide-react";
import { Category } from "@/services/categoryService";

interface CategoriesStatsProps {
  categories: Category[];
  loading?: boolean;
  total?: number;
  stats?: {
    rootCount: number;
    subCount: number;
  };
}

export function CategoriesStats({
  categories,
  loading,
  total,
  stats,
}: CategoriesStatsProps) {
  const data = React.useMemo(() => {
    if (!categories.length) {
      return {
        total: 0,
        rootCategories: 0,
        subCategories: 0,
      };
    }

    return {
      total: total,
      rootCategories: stats?.rootCount,
      subCategories: stats?.subCount,
    };
  }, [categories]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-dark-100 border border-gray-5/20 rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-5/20 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-5/20 rounded w-8"></div>
              </div>
              <div className="w-10 h-10 bg-gray-5/20 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Categories",
      value: data.total,
      icon: Boxes,
      color: "text-accent-100",
      bgColor: "bg-accent-100/10",
    },
    {
      title: "Root Categories",
      value: data.rootCategories,
      icon: FolderTree,
      color: "text-accent-100",
      bgColor: "bg-accent-100/10",
    },
    {
      title: "Sub Categories",
      value: data.subCategories,
      icon: Folders,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-dark-100 border border-gray-5/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-4 text-sm font-sofia-sans">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-light-100 font-supreme">
                {stat.value && stat.value.toLocaleString()}
              </p>
            </div>
            <div
              className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}
            >
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
