
"use client";

import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';

interface CategoriesHeaderProps {
  onCreateNew: () => void;
  onSearch: (query: string) => void;
  onToggleFilters: () => void;
  showFilters: boolean;
  searchQuery: string;
  totalCount?: number;
}

export function CategoriesHeader({ 
  onCreateNew, 
  onSearch, 
  onToggleFilters,
  showFilters,
  searchQuery,
  totalCount = 0 
}: CategoriesHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Title and Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-100 font-supreme">Categories</h1>
          <p className="text-gray-4 font-sofia-sans">
            Manage your product categories and hierarchy
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-4">
          <span className="font-sofia-sans">Total: {totalCount}</span>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-blue-cm border border-gray-5/20 rounded-lg text-light-100 placeholder-gray-4 focus:border-accent-100 focus:outline-none font-sofia-sans"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Filter Toggle */}
          <button
            onClick={onToggleFilters}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-sofia-sans text-sm
              ${showFilters 
                ? 'bg-accent-100/20 text-accent-100 border border-accent-100/30' 
                : 'text-light-100 border border-gray-5/20 hover:bg-gray-5/10'
              }
            `}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

     

          {/* Create Button */}
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 transition-colors font-sofia-sans font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Category</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}