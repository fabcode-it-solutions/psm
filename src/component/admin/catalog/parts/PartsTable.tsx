"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash, Copy, Eye } from "lucide-react";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { cn } from "@sglara/cn";


const mockParts = [
  {
    id: 1,
    title: "Premium Alloy Wheel Set",
    slug: "premium-alloy-wheel-set",
    category: "Wheels",
    variants: 4,
    price: "$450",
    stock: 12,
    status: "active",
    image: "/api/placeholder/60/60",
  },
  {
    id: 2,
    title: "Carbon Fiber Hood",
    slug: "carbon-fiber-hood",
    category: "Body Parts",
    variants: 2,
    price: "$1,200",
    stock: 5,
    status: "active",
    image: "/api/placeholder/60/60",
  },
  {
    id: 3,
    title: "Performance Brake Kit",
    slug: "performance-brake-kit",
    category: "Brakes",
    variants: 3,
    price: "$899",
    stock: 0,
    status: "draft",
    image: "/api/placeholder/60/60",
  },
];

export function PartsTable() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const toggleRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedRows(
      selectedRows.length === mockParts.length ? [] : mockParts.map((p) => p.id)
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-5/20">
            <th className="text-left p-4">
              <Checkbox.Root
                checked={selectedRows.length === mockParts.length}
                onCheckedChange={toggleAll}
                className="w-5 h-5 border border-gray-4 rounded flex items-center justify-center data-[state=checked]:bg-accent-100 data-[state=checked]:border-accent-100"
              >
                <Checkbox.Indicator>
                  <Check className="w-3 h-3 text-dark-100" />
                </Checkbox.Indicator>
              </Checkbox.Root>
            </th>
            <th className="text-left p-4 text-gray-4 font-sofia-sans font-normal text-sm">Product</th>
            <th className="text-left p-4 text-gray-4 font-sofia-sans font-normal text-sm">Category</th>
            <th className="text-left p-4 text-gray-4 font-sofia-sans font-normal text-sm">Variants</th>
            <th className="text-left p-4 text-gray-4 font-sofia-sans font-normal text-sm">Price</th>
            <th className="text-left p-4 text-gray-4 font-sofia-sans font-normal text-sm">Stock</th>
            <th className="text-left p-4 text-gray-4 font-sofia-sans font-normal text-sm">Status</th>
            <th className="text-right p-4 text-gray-4 font-sofia-sans font-normal text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockParts.map((part) => (
            <tr
              key={part.id}
              className="border-b border-gray-5/20 hover:bg-gray-5/5 transition-colors"
            >
              <td className="p-4">
                <Checkbox.Root
                  checked={selectedRows.includes(part.id)}
                  onCheckedChange={() => toggleRow(part.id)}
                  className="w-5 h-5 border border-gray-4 rounded flex items-center justify-center data-[state=checked]:bg-accent-100 data-[state=checked]:border-accent-100"
                >
                  <Checkbox.Indicator>
                    <Check className="w-3 h-3 text-dark-100" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-5/20 rounded-lg overflow-hidden">
                    {/* <Image
                      src={part.image}
                      alt={part.title}
                      className="w-full h-full object-cover"
                    /> */}
                  </div>
                  <div>
                    <p className="text-light-100 font-sofia-sans font-medium">
                      {part.title}
                    </p>
                    <p className="text-gray-4 text-sm">{part.slug}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className="text-light-200 font-sofia-sans">{part.category}</span>
              </td>
              <td className="p-4">
                <span className="text-light-200 font-sofia-sans">{part.variants}</span>
              </td>
              <td className="p-4">
                <span className="text-light-200 font-sofia-sans font-medium">
                  {part.price}
                </span>
              </td>
              <td className="p-4">
                <span
                  className={cn(
                    "font-sofia-sans",
                    part.stock === 0 ? "text-red-500" : "text-light-200"
                  )}
                >
                  {part.stock === 0 ? "Out of stock" : part.stock}
                </span>
              </td>
              <td className="p-4">
                <span
                  className={`
                    "px-2 py-1 rounded-full text-xs font-sofia-sans"
                   ${ part.status === "active"
                      ? "bg-accent-100/20 text-accent-100"
                      : "bg-gray-5/20 text-gray-4"}
                  `}
                >
                  {part.status}
                </span>
              </td>
              <td className="p-4 text-right">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="p-2 text-gray-4 hover:text-light-100 hover:bg-gray-5/10 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="bg-dark-100 border border-gray-5/20 rounded-lg p-1 min-w-[160px] shadow-xl"
                      sideOffset={5}
                    >
                      <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                        <Eye className="w-4 h-4" />
                        <span className="font-sofia-sans text-sm">View</span>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                        <Edit className="w-4 h-4" />
                        <span className="font-sofia-sans text-sm">Edit</span>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                        <Copy className="w-4 h-4" />
                        <span className="font-sofia-sans text-sm">Duplicate</span>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-gray-5/20 my-1" />
                      <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded cursor-pointer outline-none">
                        <Trash className="w-4 h-4" />
                        <span className="font-sofia-sans text-sm">Delete</span>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-gray-5/20">
        <p className="text-sm text-gray-4 font-sofia-sans">
          Showing 1-10 of 2,456 parts
        </p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-gray-5/20 rounded-lg text-light-100 hover:bg-gray-5/10 font-sofia-sans text-sm transition-colors">
            Previous
          </button>
          <button className="px-3 py-1.5 border border-gray-5/20 rounded-lg text-light-100 hover:bg-gray-5/10 font-sofia-sans text-sm transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}