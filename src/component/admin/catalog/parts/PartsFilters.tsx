"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown, X } from "lucide-react";

export function PartsFilters() {
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-gray-4 font-sofia-sans mb-2 block">
            Category
          </label>
          <Select.Root>
            <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-dark-blue-cm/50 border border-gray-5/20 rounded-lg text-light-100 font-sofia-sans text-sm hover:border-gray-4 transition-colors">
              <Select.Value placeholder="All Categories" />
              <Select.Icon>
                <ChevronDown className="w-4 h-4 text-gray-4" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="bg-dark-100 border border-gray-5/20 rounded-lg p-1 shadow-xl">
                <Select.Viewport>
                  <Select.Item value="all" className="px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none font-sofia-sans text-sm">
                    <Select.ItemText>All Categories</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="wheels" className="px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none font-sofia-sans text-sm">
                    <Select.ItemText>Wheels</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="body" className="px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none font-sofia-sans text-sm">
                    <Select.ItemText>Body Parts</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="brakes" className="px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none font-sofia-sans text-sm">
                    <Select.ItemText>Brakes</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
        
        <div>
          <label className="text-xs text-gray-4 font-sofia-sans mb-2 block">
            Status
          </label>
          <Select.Root>
            <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-dark-blue-cm/50 border border-gray-5/20 rounded-lg text-light-100 font-sofia-sans text-sm hover:border-gray-4 transition-colors">
              <Select.Value placeholder="All Status" />
              <Select.Icon>
                <ChevronDown className="w-4 h-4 text-gray-4" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="bg-dark-100 border border-gray-5/20 rounded-lg p-1 shadow-xl">
                <Select.Viewport>
                  <Select.Item value="all" className="px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none font-sofia-sans text-sm">
                    <Select.ItemText>All Status</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="active" className="px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none font-sofia-sans text-sm">
                    <Select.ItemText>Active</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="draft" className="px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none font-sofia-sans text-sm">
                    <Select.ItemText>Draft</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="archived" className="px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none font-sofia-sans text-sm">
                    <Select.ItemText>Archived</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
        
        <div>
          <label className="text-xs text-gray-4 font-sofia-sans mb-2 block">
            Stock Status
          </label>
          <Select.Root>
            <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-dark-blue-cm/50 border border-gray-5/20 rounded-lg text-light-100 font-sofia-sans text-sm hover:border-gray-4 transition-colors">
              <Select.Value placeholder="All" />
              <Select.Icon>
                <ChevronDown className="w-4 h-4 text-gray-4" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="bg-dark-100 border border-gray-5/20 rounded-lg p-1 shadow-xl">
                <Select.Viewport>
                  <Select.Item value="all" className="px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none font-sofia-sans text-sm">
                    <Select.ItemText>All</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="in_stock" className="px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none font-sofia-sans text-sm">
                    <Select.ItemText>In Stock</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="low_stock" className="px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none font-sofia-sans text-sm">
                    <Select.ItemText>Low Stock</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="out_of_stock" className="px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none font-sofia-sans text-sm">
                    <Select.ItemText>Out of Stock</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
        
        <div>
          <label className="text-xs text-gray-4 font-sofia-sans mb-2 block">
            Price Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              className="flex-1 px-3 py-2 bg-dark-blue-cm/50 border border-gray-5/20 rounded-lg text-light-100 placeholder:text-gray-4 font-sofia-sans text-sm focus:outline-none focus:border-accent-100/50"
            />
            <input
              type="number"
              placeholder="Max"
              className="flex-1 px-3 py-2 bg-dark-blue-cm/50 border border-gray-5/20 rounded-lg text-light-100 placeholder:text-gray-4 font-sofia-sans text-sm focus:outline-none focus:border-accent-100/50"
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-100/20 text-accent-100 rounded-full text-xs font-sofia-sans">
            Category: Wheels
            <button className="hover:text-accent-100/80">
              <X className="w-3 h-3" />
            </button>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-100/20 text-accent-100 rounded-full text-xs font-sofia-sans">
            Status: Active
            <button className="hover:text-accent-100/80">
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
        <button className="text-gray-4 hover:text-light-100 font-sofia-sans text-sm transition-colors">
          Clear all filters
        </button>
      </div>
    </div>
  );
}