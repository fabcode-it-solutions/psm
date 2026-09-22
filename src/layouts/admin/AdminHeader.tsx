"use client";

import { Plus, Menu } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { NotificationBell } from "@/component/notifications/NotificationBell";
import CommandPalette from "@/component/dashboard/search/Search";


export function AdminHeader() {
  return (
    <header className="bg-dark-100 border-b border-gray-5/20 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile menu */}
          <button className="lg:hidden text-light-100 p-2 hover:bg-gray-5/10 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <CommandPalette />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* Add New */}
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button className="hidden lg:flex items-center gap-2 px-4 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 font-sofia-sans font-medium transition-colors">
                <Plus className="w-4 h-4" />
                Add New
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-100 border border-gray-5/20 rounded-xl p-6 w-full max-w-md z-[9999]">
                <Dialog.Title className="text-xl font-sofia-sans font-semibold text-light-100 mb-4">
                  Add New
                </Dialog.Title>
                
                <div className="space-y-2">
                  <a
                    href="/dashboard/parts/create"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-5/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent-100/10 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-accent-100" />
                    </div>
                    <div>
                      <p className="font-sofia-sans text-sm text-light-100">Add Part</p>
                      <p className="font-sofia-sans text-xs text-gray-4">Create a new part</p>
                    </div>
                  </a>

                  <a
                    href="/dashboard/categories/create"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-5/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent-100/10 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-accent-100" />
                    </div>
                    <div>
                      <p className="font-sofia-sans text-sm text-light-100">Add Category</p>
                      <p className="font-sofia-sans text-xs text-gray-4">Create a new category</p>
                    </div>
                  </a>

                  <a
                    href="/dashboard/users/create"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-5/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent-100/10 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-accent-100" />
                    </div>
                    <div>
                      <p className="font-sofia-sans text-sm text-light-100">Add User</p>
                      <p className="font-sofia-sans text-xs text-gray-4">Create a new user</p>
                    </div>
                  </a>

                  <a
                    href="/dashboard/carBrands/create"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-5/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent-100/10 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-accent-100" />
                    </div>
                    <div>
                      <p className="font-sofia-sans text-sm text-light-100">Add Brand</p>
                      <p className="font-sofia-sans text-xs text-gray-4">Create a new brand</p>
                    </div>
                  </a>

                  <a
                    href="/dashboard/carModels/create"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-5/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent-100/10 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-accent-100" />
                    </div>
                    <div>
                      <p className="font-sofia-sans text-sm text-light-100">Add Model</p>
                      <p className="font-sofia-sans text-xs text-gray-4">Create a new model</p>
                    </div>
                  </a>
                </div>

                <Dialog.Close asChild>
                  <button className="absolute top-4 right-4 text-gray-4 hover:text-light-100 transition-colors">
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Notifications */}
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}