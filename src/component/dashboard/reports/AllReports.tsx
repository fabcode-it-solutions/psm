/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useCallback } from "react";
import PageHeader from "@/component/dashboard/PageHeader";
import { FormField } from "@/component/ui/dashboard/FormField";
import Pagination from "@/component/ui/dashboard/Pagination";
import TableSkeleton from "@/component/ui/dashboard/TableSkeleton";
import EmptyTableUi from "@/component/ui/dashboard/EmptyTableUi";
import { userService } from "@/services/user.service";
import { useDebounce } from "@/hooks/useDebounce";
import Dropdown from "@/component/ui/dashboard/Dropdown";
import { Calendar, Eye, MoreHorizontal, CheckCircle } from "lucide-react";
import { formatDate } from "@/utils/defaults";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Report {
  id: number;
  reporterUserId: number;
  reportedUserId: number;
  reportedUserName: string;
  reporterUserName: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const AllReports: React.FC = () => {
  const [state, setState] = useState<{
    reports: Report[];
    searchTerm: string;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
    loading: boolean;
  }>({
    reports: [],
    searchTerm: "",
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
    loading: false,
  });

  const {
    reports,
    searchTerm,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    hasNext,
    hasPrev,
    loading,
  } = state;

  const router = useRouter();
  const adminId = useSelector((state: RootState) => state.user.user)?.user?.id;

  const loadReports = useCallback(async () => {
    if (!adminId) return;
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const result = await userService.getReports({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (result?.success) {
        setState((prev) => ({
          ...prev,
          reports: result.data || [],
          totalPages: result.pagination.totalPages,
          currentPage: result.pagination.currentPage,
          totalItems: result.pagination.totalItems,
          hasNext: result.pagination.hasNext,
          hasPrev: result.pagination.hasPrev,
          loading: false,
        }));
      } else {
        setState((prev) => ({ ...prev, reports: [], loading: false }));
      }
    } catch (err) {
      console.error(err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [currentPage, itemsPerPage, searchTerm, adminId]);

  useDebounce(loadReports, 400, [searchTerm, currentPage, itemsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      searchTerm: e.target.value,
      currentPage: 1,
    }));
  };

  const handleItemsPerPageChange = (value: string) => {
    setState((prev) => ({
      ...prev,
      itemsPerPage: Number(value),
      currentPage: 1,
    }));
  };
  return (
    <div className="bg-dark-100">
      <div className="mx-auto p-4">
        <PageHeader heading="Reports" describe="View and manage all reports" />
        <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
          <div className="flex-1">
            <FormField
              name="search"
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="flex gap-2 max-mb-xl:hidden">
            <Dropdown
              options={[
                { value: "10", label: "10 per page" },
                { value: "25", label: "25 per page" },
                { value: "50", label: "50 per page" },
                { value: "100", label: "100 per page" },
              ]}
              onValueChange={handleItemsPerPageChange}
              placeholder="Items per page"
            />
          </div>
        </div>

        {loading && <TableSkeleton />}

        {!loading && (
          <div className="bg-dark-100 border border-gray-5/20 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-tab-lg:hidden">
              <table className="w-full">
                <thead className="bg-gray-5/10 border-b border-gray-5/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Reported User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Reporter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-5/20">
                  {reports.length === 0 ? (
                    <EmptyTableUi
                      heading="No reports found"
                      description="Try adjusting your search."
                    />
                  ) : (
                    reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-5/10">
                        <td className="px-6 py-4 text-light-100 font-sofia-sans">
                          {report.reportedUserName}
                        </td>
                        <td className="px-6 py-4 text-light-100 font-sofia-sans">
                          {report.reporterUserName}
                        </td>
                        <td className="px-6 py-4 text-light-100 font-sofia-sans">
                          {report.reason}
                        </td>
                        <td className="px-6 py-4 text-light-100 font-sofia-sans capitalize">
                          {report.status}
                        </td>
                        <td className="px-6 py-4 text-light-100 font-sofia-sans flex gap-2 items-center">
                          <Calendar className="w-3 h-3 text-gray-4" />
                          {formatDate(report.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-light-100 font-sofia-sans ">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="p-2 hover:bg-gray-5/10 rounded-full">
                                <MoreHorizontal className="w-4 h-4 text-gray-4" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content
                                className="bg-dark-100 border border-gray-5/20 rounded-md shadow-lg p-1 z-50"
                                align="end"
                              >
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-light-100"
                                  onClick={() =>
                                    router.push(`/dashboard/reports/${report.id}`)
                                  }
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="max-tab-lg:block hidden space-y-4">
              {reports.length === 0 ? (
                <table>
                  <tbody>
                    <EmptyTableUi
                      heading="No reports found"
                      description="Try adjusting your search."
                    />
                  </tbody>
                </table>
              ) : (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-dark-200 border border-gray-5/20 rounded-lg p-4 shadow-sm"
                  >
                    <div className="text-sm font-medium text-light-100">
                      {report.reportedUserName}
                    </div>
                    <div className="text-xs text-light-100">
                      Reporter: {report.reporterUserName}
                    </div>
                    <div className="text-xs text-light-100">
                      Reason: {report.reason}
                    </div>
                    <div className="text-xs text-light-100">
                      Status: {report.status}
                    </div>
                    <div className="text-xs text-light-100">
                      {formatDate(report.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <Pagination
              currentPage={currentPage}
              hasNext={hasNext}
              hasPrev={hasPrev}
              itemsPerPage={itemsPerPage}
              setCurrentPage={(page) =>
                setState((prev) => ({ ...prev, currentPage: page }))
              }
              totalItems={totalItems}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReports;
