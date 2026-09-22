/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useCallback } from "react";
import PageHeader from "@/component/dashboard/PageHeader";
import { FormField } from "@/component/ui/dashboard/FormField";
import Pagination from "@/component/ui/dashboard/Pagination";
import TableSkeleton from "@/component/ui/dashboard/TableSkeleton";
import EmptyTableUi from "@/component/ui/dashboard/EmptyTableUi";
import { userService } from "@/services/user.service";
import { User } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import Dropdown from "@/component/ui/dashboard/Dropdown";
import AddUsers from "./AddUsers";
import { useTheme } from "@/providers/ThemeProvider";
import { useMemo } from "react";
import {
  BlocksIcon,
  Calendar,
  Eye,
  MoreHorizontal,
  UserX,
  KeyRound,
  BadgeCheck,
  User as UserIcon,
  Flag,
  Download,
  UserMinus,
  BarChart3,
  X,
  ArrowRight,
  ArrowBigRight,
} from "lucide-react";
import { formatDate } from "@/utils/defaults";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import BlockUserPopup from "./BlockUser";
import SuspendUserPopup from "./SuspendUser";
import { countryList } from "@/utils/countrydata";

import ResetPasswordPopup from "./ResetPasswordPopup";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import toast from "react-hot-toast";
import DeleteConfirmationDialog from "@/component/ui/dashboard/DeleteConfirmationDialog";
import { useRouter } from "next/navigation";
const UsersPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [joinDateRange, setJoinDateRange] = useState<{
    from: string | null;
    to: string | null;
  }>({
    from: null,
    to: null,
  });

  const [state, setState] = useState<{
    users: User[];
    allUsers: User[];
    searchTerm: string;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
    loading: boolean;
  }>({
    users: [],
    allUsers: [],
    searchTerm: "",
    currentPage: 1,
    itemsPerPage: 12,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
    loading: false,
  });

  const {
    users,
    allUsers,
    searchTerm,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    hasNext,
    hasPrev,
    loading,
  } = state;

  const loadUsers = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const result = await userService.getAllUsers({
        page: 1,
        limit: 50,
        search: searchTerm,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (result?.success) {
        setState((prev) => ({
          ...prev,
          allUsers: result.usersData || [],
          loading: false,
        }));
      } else {
        setState((prev) => ({ ...prev, allUsers: [], loading: false }));
      }
    } catch (err) {
      console.error(err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [searchTerm]);

  React.useEffect(() => {
    loadUsers();
  }, []);

  const countryOptions = useMemo(() => {
    const callingCodes = new Set<string>();

    allUsers.forEach((u) => {
      if (u.countryCode) {
        callingCodes.add(String(u.countryCode));
      }
    });

    return [
      { value: "all", label: "All Countries" },
      ...Array.from(callingCodes).map((code) => {
        const country = countryList.find((c) => c.callingCodes.includes(code));

        return {
          value: code,
          label: country ? `${country.name} (+${code})` : `+${code}`,
        };
      }),
    ];
  }, [allUsers]);

  const applyFiltersAndPagination = useCallback(() => {
    let filteredUsers = allUsers;

    // Apply filter
    if (filterType === "active") {
      filteredUsers = filteredUsers.filter(
        (u: User) => !u.isSuspended && !u.isBlocked && !u.flagged
      );
    } else if (filterType === "verified") {
      filteredUsers = filteredUsers.filter((u: User) => u.isVerified === true);
    } else if (filterType === "suspended") {
      filteredUsers = filteredUsers.filter((u: User) => u.isSuspended === true);
    } else if (filterType === "blocked") {
      filteredUsers = filteredUsers.filter((u: User) => u.isBlocked === true);
    } else if (filterType === "flagged") {
      filteredUsers = filteredUsers.filter((u: User) => u.flagged === true);
    } else if (filterType === "country" && selectedCountry !== "all") {
      filteredUsers = filteredUsers.filter(
        (u) => String(u.countryCode) === selectedCountry
      );
    }
    if (filterType === "date" && (joinDateRange.from || joinDateRange.to)) {
      filteredUsers = filteredUsers.filter((u: User) => {
        if (!u.createdAt) return false;

        const userDate = new Date(u.createdAt);
        userDate.setHours(0, 0, 0, 0);

        if (joinDateRange.from) {
          const fromDate = new Date(joinDateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          if (userDate < fromDate) return false;
        }

        if (joinDateRange.to) {
          const toDate = new Date(joinDateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (userDate > toDate) return false;
        }

        return true;
      });
    }

    // Calculate pagination
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    setState((prev) => ({
      ...prev,
      users: paginatedUsers,
      totalPages,
      totalItems,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    }));
  }, [
    allUsers,
    selectedCountry,
    filterType,
    joinDateRange.from,
    joinDateRange.to,
    currentPage,
    itemsPerPage,
  ]);

  useDebounce(loadUsers, 800, [searchTerm]);

  React.useEffect(() => {
    if (allUsers.length > 0) {
      applyFiltersAndPagination();
    }
  }, [applyFiltersAndPagination]);

  React.useEffect(() => {
    if (filterType !== "country") {
      setSelectedCountry("all");
    }

    if (filterType !== "date") {
      setJoinDateRange({ from: null, to: null });
    }
  }, [filterType]);

  // custom format to display date and time
  const formatDateTime = (date: Date) => {
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
  });
};


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

  const [blockPopupOpen, setBlockPopupOpen] = useState(false);
  const [suspendPopupOpen, setSuspendPopupOpen] = useState(false);
  const [resetPasswordPopupOpen, setResetPasswordPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedUserForSuspend, setSelectedUserForSuspend] = useState<
    number | number[] | null
  >(null);
  const [selectedUserForPasswordReset, setSelectedUserForPasswordReset] =
    useState<number | null>(null);
  const adminId = useSelector((state: RootState) => state.user.user)?.user?.id;
  const [selectedUserForUnblock, setSelectedUserForUnblock] = useState<
    number | null
  >(null);
  const [selectedUserForUnsuspend, setSelectedUserForUnsuspend] = useState<
    number | null
  >(null);
  const [unblockLoading, setUnblockLoading] = useState(false);
  const [unsuspendLoading, setUnsuspendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [flagLoading, setFlagLoading] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupData, setSignupData] = useState<
    { date: string; count: number }[]
  >([]);

  const router = useRouter();
  const { setLoader } = useTheme();

  const handleResetPassword = (userId: number) => {
    setSelectedUserForPasswordReset(userId);
    setResetPasswordPopupOpen(true);
  };

  const handleVerifyUser = async (
    userId: number,
    currentVerificationStatus: boolean
  ) => {
    setVerifyLoading(true);
    const action = !currentVerificationStatus
      ? "Verifying User"
      : "Unverifying User";
    setLoader(action);
    try {
      const result = await userService.updateUser({
        userId,
        updates: { isVerified: !currentVerificationStatus },
      });

      if (result?.success) {
        toast.success(
          `User ${
            !currentVerificationStatus ? "verified" : "unverified"
          } successfully`
        );
        loadUsers();
      } else {
        toast.error(result?.message || "Failed to update verification status");
      }
    } catch (error) {
      toast.error("Failed to update verification status");
    } finally {
      setVerifyLoading(false);
      setLoader("");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(
        users.filter((u) => u.role !== "superAdmin").map((u) => u.id)
      );
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUserIds((prev) => [...prev, userId]);
    } else {
      setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleBulkExportUsers = () => {
    try {
      const selectedUsersData = allUsers.filter((user) =>
        selectedUserIds.includes(user.id)
      );

      if (selectedUsersData.length === 0) {
        toast.error("Please select at least one user");
        return;
      }

      const headers = [
        "ID",
        "Username",
        "Email",
        "Role",
        "Verified",
        "Suspended",
        "Blocked",
        "Flagged",
        "Reports Count",
        "Last Login",
        "Created on",
      ];

      const csvContent = [
        headers.join(","),

        ...selectedUsersData.map((u) =>
          [
            u.id,
            `"${u.username || ""}"`,
            `"${u.email || ""}"`,
            u.role,
            u.isVerified ? "Verified" : "Not Verified",
            u.isSuspended ? "Suspended" : "Active",
            u.isBlocked ? "Blocked" : "Not Blocked",
            u.flagged ? "Flagged" : "Not Flagged",
            u.reportsCount || 0,
            u.lastLoginAt ? formatDate(u.lastLoginAt) : "Never",
            formatDate(u.createdAt),
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();

      window.URL.revokeObjectURL(url);

      toast.success(
        `Exported ${selectedUsersData.length} user(s) successfully`
      );

      setSelectedUserIds([]);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export users");
    }
  };

  const bulkUpdateUsers = async (
    userIds: number[],
    updateData: { isVerified?: boolean },
    actionText: string
  ) => {
    try {
      await Promise.all(
        userIds.map((userId) =>
          userService.updateUser({
            userId,
            updates: updateData,
          })
        )
      );
      toast.success(`${userIds.length} user(s) ${actionText} successfully`);
    } catch (error) {
      toast.error(`Failed to ${actionText}`);
      console.error(`Failed to ${actionText}:`, error);
    }
  };

  const handleBulkVerify = async () => {
    if (selectedUserIds.length === 0) return;

    setBulkActionLoading(true);
    setLoader("Verifying users");

    await bulkUpdateUsers(
      selectedUserIds,
      { isVerified: true },
      "verify users"
    );

    setSelectedUserIds([]);
    setBulkActionLoading(false);
    setLoader("");
    loadUsers();
  };

  const handleBulkUnverify = async () => {
    if (selectedUserIds.length === 0) return;

    setBulkActionLoading(true);
    setLoader("Unverifying users");

    await bulkUpdateUsers(
      selectedUserIds,
      { isVerified: false },
      "unverify users"
    );

    setSelectedUserIds([]);
    setBulkActionLoading(false);
    setLoader("");
    loadUsers();
  };

  const handleBulkSuspend = () => {
    if (selectedUserIds.length === 0) return;
    setSuspendPopupOpen(true);
    setSelectedUserForSuspend(selectedUserIds);
  };

  const handleBulkSuspendSuccess = () => {
    setSelectedUserIds([]);
    loadUsers();
  };

  const handleFlagUser = async (userId: number, currentFlagStatus: boolean) => {
    setFlagLoading(true);
    const action = !currentFlagStatus ? "Flagging User" : "Unflagging User";
    setLoader(action);
    try {
      const result = await userService.updateUser({
        userId,
        updates: { flagged: !currentFlagStatus },
      });

      if (result?.success) {
        toast.success(
          `User ${!currentFlagStatus ? "flagged" : "unflagged"} successfully`
        );
        loadUsers();
      } else {
        toast.error(result?.message || "Failed to update flag status");
      }
    } catch (error) {
      toast.error("Failed to update flag status");
    } finally {
      setFlagLoading(false);
      setLoader("");
    }
  };

  const handleShowSignupGraph = async () => {
    setLoader("Loading signup data");
    try {
      const res = await fetch("/api/stats/signup-30-days");
      const json = await res.json();
      setSignupData(json.data);
      setShowSignupModal(true);
    } finally {
      setLoader("");
    }
  };

  return (
    <div className="bg-dark-100">
      <div className="mx-auto p-4">
        <PageHeader
          heading="Users"
          describe="See all your users"
          button={<AddUsers onUserAdded={loadUsers} />}
        />
        <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
          <div className="flex-1">
            <FormField
              name="search"
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button
            onClick={handleShowSignupGraph}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors font-sofia-sans text-sm font-medium"
          >
            <BarChart3 className="w-4 h-4" />
            Signup Graph
          </button>
          <Dropdown
            options={[
              { value: "all", label: "All Users" },
              { value: "active", label: "Active Users" },
              { value: "verified", label: "Verified Users" },
              { value: "suspended", label: "Suspended Users" },
              { value: "blocked", label: "Blocked Users" },
              { value: "flagged", label: "Flagged Users" },
              { value: "country", label: "Country" },
              { value: "date", label: "Date" },
            ]}
            placeholder="Filter"
            onValueChange={(value) => {
              setFilterType(value);
              setState((prev) => ({ ...prev, currentPage: 1 }));
            }}
          />

          {filterType === "country" && (
            <Dropdown
              selectedText={selectedCountry}
              options={countryOptions}
              onValueChange={(value: string) => {
                setSelectedCountry(value);
                setState((prev) => ({ ...prev, currentPage: 1 }));
              }}
              placeholder="Select Country"
            />
          )}

          {filterType === "date" && (
            <div className="flex gap-2">
              <input
                type="date"
                className="px-3 py-2 text-white border border-gray-5/20 rounded-lg text-sm [color-scheme:dark] bg-gray-5/10"
                value={joinDateRange.from ?? ""}
                onChange={(e) =>
                  setJoinDateRange((prev) => ({
                    ...prev,
                    from: e.target.value,
                  }))
                }
              />

              <input
                type="date"
               className="px-3 py-2 text-white border border-gray-5/20 rounded-lg text-sm [color-scheme:dark] bg-gray-5/10"
                value={joinDateRange.to ?? ""}
                onChange={(e) =>
                  setJoinDateRange((prev) => ({ ...prev, to: e.target.value }))
                }
              />
            </div>
          )}

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

        {selectedUserIds.length > 0 && (
          <div className="bg-yellow-400/10 border-2 border-yellow-400/40 rounded-lg p-4 relative ">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-yellow-400 font-sofia-sans">
                  Bulk Actions:
                </span>
                <span className="text-sm font-medium text-light-100 font-sofia-sans">
                  {selectedUserIds.length} User(s) selected
                </span>
                <button
                  onClick={() => setSelectedUserIds([])}
                  className="text-xs text-gray-4 hover:text-light-100 transition-colors font-sofia-sans underline"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleBulkVerify}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-sofia-sans text-sm font-medium disabled:opacity-50"
                >
                  <BadgeCheck className="w-4 h-4" />
                  Verify
                </button>
                <button
                  onClick={handleBulkUnverify}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors font-sofia-sans text-sm font-medium disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" />
                  Unverify
                </button>
                <button
                  onClick={handleBulkSuspend}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-sofia-sans text-sm font-medium disabled:opacity-50"
                >
                  <UserMinus className="w-4 h-4" />
                  Suspend
                </button>
                <button
                  onClick={handleBulkExportUsers}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors font-sofia-sans text-sm font-medium disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Export as CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && <TableSkeleton />}

        {!loading && (
          <div className="bg-dark-100 border border-gray-5/20 rounded-lg overflow-hidden mt-6">
            <div className="overflow-x-auto max-tab-lg:hidden">
              <table className="w-full">
                <thead className="bg-gray-5/10 border-b border-gray-5/20">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      <input
                        type="checkbox"
                        checked={
                          selectedUserIds.length ===
                            users.filter((u) => u.role !== "superAdmin")
                              .length && users.length > 0
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Username
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Email
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Reports
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Role
                    </th>
                    {/* <th className="p-1 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Last Login
                    </th> */}
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      LastLogin
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-5/20">
                  {users.length === 0 ? (
                    <EmptyTableUi
                      heading="No users found"
                      description="Try adjusting your search or add a new user."
                    />
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-5/10">
                        <td className="px-5 py-4">
                          {user.role !== "superAdmin" && (
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(user.id)}
                              onChange={(e) =>
                                handleSelectUser(user.id, e.target.checked)
                              }
                              className="w-4 h-4 cursor-pointer"
                            />
                          )}
                        </td>
                        <td className="px-4 py-4 text-light-100 font-sofia-sans capitalize ">
                          {/* <div className="flex  flex-wrap items-center gap-2">
                            {user.username || user.firstName}
                            {user.isBlocked === true ? (
                              <p className="text-xs bg-orange-600 w-fit px-2 py-[2px] rounded-xl">
                                Blocked
                              </p>
                            ) : user.isSuspended === true ? (
                              <p className="text-xs bg-red-600 w-fit px-2 py-[2px] rounded-xl">
                                Suspended
                              </p>
                            ) : user.isVerified === true ? (
                              <BadgeCheck size={18} color="green" />
                            ) : (
                           ""
                            )}
                          </div> */}

                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              {user.username || user.firstName}

                              {user.isVerified && (
                                <BadgeCheck
                                  size={18}
                                  className="text-green-600"
                                />
                              )}
                            </div>

                            {/* Status Labels */}
                            {user.isSuspended ? (
                              <p className="text-xs w-fit px-2 py-[2px] rounded-xl bg-red-600">
                                Suspended
                              </p>
                            ) : (
                              <div className="flex items-center gap-2">
                                {/* Blocked */}
                                {user.isBlocked && (
                                  <p className="text-xs w-fit px-2 py-[2px] rounded-xl bg-orange-600">
                                    Blocked
                                  </p>
                                )}

                                {/* Flagged */}
                                {(user.reportsCount || 0) > 0 &&
                                  user.flagged && (
                                    <span className="text-xs w-fit px-2 py-[2px] rounded-xl bg-red-600">
                                      Flagged
                                    </span>
                                  )}
                              </div>
                            )}
                            {/*User LastLogin Hover Tooltip */}
                                                 
                                                    {/* <div
                                                      className="
                                        absolute bottom-0 left-20
                                        hidden group-hover:flex
                                        bg-dark-100 border border-green-500
                                        items-center gap-1
                                        rounded-md px-2 py-1
                                        text-xs text-green-500
                                        shadow-xl
                                        whitespace-nowrap
                                        z-50
                                      "
                                                    >
                                                      {user.lastLoginAt
                            ? formatDate(new Date(user.lastLoginAt))
                            : formatDate(user.createdAt)}
                                                    </div> */}
                                                 
                          </div>
                        </td>
                        <td className="px-4 py-4 text-light-100 font-sofia-sans">
                          {user.email}
                        </td>
                        <td className="px-4 py-4 text-light-100 font-sofia-sans">
                          <div className="flex flex-col justify-center items-center gap-1">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                (user.reportsCount || 0) > 0
                                  ? "bg-red-500/20 text-red-500"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {user.reportsCount || 0}
                            </span>
                            {/* {(user.reportsCount || 0) > 0 && user.flagged && (
                              <span className="text-xs bg-red-600 rounded-full px-2 py-[2px]">
                                Flagged
                              </span>
                            )} */}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-light-100 font-sofia-sans capitalize">
                          {user.role}
                        </td>
                        {/* <td className="p-1 text-green-300 font-sofia-sans">
                          {user.lastLoginAt
                            ? formatDateTime(new Date(user.lastLoginAt))
                            : formatDate(user.createdAt)}
                        </td> */}
                        <td className="p-4 text-green-400 font-sofia-sans">
                          {/* <Calendar className="w-3 h-3 text-gray-4" /> */}
                          {user.lastLoginAt
                            ? formatDate(new Date(user.lastLoginAt))
                            : formatDate(user.createdAt)}
                        </td>
                        {/* <td className="px-2 py-4 text-light-100 font-sofia-sans flex gap-2 items-center">
                          <Calendar className="w-3 h-3 text-gray-4" />
                          {formatDate(user.createdAt)}
                        </td> */}
                        
                        <td className="px-5 py-4 text-light-100 font-sofia-sans ">
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
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-light-100 font-sofia-sans"
                                  onClick={() =>
                                    router.push(`/profile/${user.id}`)
                                  }
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </DropdownMenu.Item>
                                {user.role !== "superAdmin" && (
                                  <>
                                    <DropdownMenu.Item
                                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded font-sofia-sans ${
                                        user.isSuspended
                                          ? "text-gray-4 cursor-not-allowed"
                                          : "hover:bg-gray-5/10 cursor-pointer text-light-100"
                                      }`}
                                      onClick={() => {
                                        if (!user.isSuspended) {
                                          if (user.isBlocked) {
                                            setSelectedUserForUnblock(user.id);
                                          } else {
                                            setSelectedUser(user.id);
                                            setBlockPopupOpen(true);
                                          }
                                        }
                                      }}
                                    >
                                      <BlocksIcon className="w-4 h-4" />
                                      {user.isBlocked ? "Unblock" : "Block"}
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded font-sofia-sans ${
                                        user.isSuspended
                                          ? "text-red-500 cursor-not-allowed"
                                          : "hover:bg-gray-5/10 cursor-pointer text-light-100"
                                      }`}
                                      onClick={() => {
                                        if (!user.isSuspended) {
                                          setSelectedUserForSuspend(user.id);
                                          setSuspendPopupOpen(true);
                                        }
                                      }}
                                    >
                                      <UserX className="w-4 h-4" />
                                      {user.isSuspended
                                        ? "Suspended"
                                        : "Suspend"}
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded font-sofia-sans ${
                                        user.isSuspended
                                          ? "text-gray-4 cursor-not-allowed"
                                          : "hover:bg-gray-5/10 cursor-pointer text-light-100"
                                      }`}
                                      onClick={() => {
                                        if (!user.isSuspended) {
                                          handleResetPassword(user.id);
                                        }
                                      }}
                                    >
                                      <KeyRound className="w-4 h-4" />
                                      Reset Password
                                    </DropdownMenu.Item>

                                    <DropdownMenu.Item
                                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded font-sofia-sans ${
                                        user.isSuspended || verifyLoading
                                          ? "text-gray-4 cursor-not-allowed"
                                          : "hover:bg-gray-5/10 cursor-pointer text-light-100"
                                      }`}
                                      onClick={() => {
                                        if (
                                          !verifyLoading &&
                                          !user.isSuspended
                                        ) {
                                          handleVerifyUser(
                                            user.id,
                                            user.isVerified || false
                                          );
                                        }
                                      }}
                                    >
                                      <BadgeCheck className="w-4 h-4" />
                                      {user.isVerified ? "Unverify" : "Verify"}
                                    </DropdownMenu.Item>
                                    {(user.reportsCount || 0) > 0 && (
                                      <DropdownMenu.Item
                                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded font-sofia-sans ${
                                          user.isSuspended || flagLoading
                                            ? "text-gray-4 cursor-not-allowed"
                                            : "hover:bg-gray-5/10 cursor-pointer text-light-100"
                                        }`}
                                        onClick={() => {
                                          if (
                                            !flagLoading &&
                                            !user.isSuspended
                                          ) {
                                            handleFlagUser(
                                              user.id,
                                              user.flagged || false
                                            );
                                          }
                                        }}
                                      >
                                        <Flag className="w-4 h-4" />
                                        {user.flagged ? "Unflag" : "Flag"}
                                      </DropdownMenu.Item>
                                    )}

                                    {/* <DropdownMenu.Item
                                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded font-sofia-sans ${
                                        user.isSuspended
                                          ? "text-gray-4 cursor-not-allowed"
                                          : "hover:bg-gray-5/10 cursor-pointer text-light-100"
                                      }`}
                                      onClick={() => {
                                        if (!user.isSuspended) {
                                          handleResetPassword(user.id);
                                        }
                                      }}
                                    >
                                      <KeyRound className="w-4 h-4" />
                                      Reset Password
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer font-sofia-sans ${
                                        verifyLoading || user.isSuspended
                                          ? "text-gray-4 cursor-not-allowed"
                                          : "hover:bg-gray-5/10 text-light-100"
                                      }`}
                                      onClick={() => {
                                        if (!verifyLoading && !user.isSuspended) {
                                          handleVerifyUser(user.id, user.isVerified || false);
                                        }
                                      }}
                                    >
                                      <BadgeCheck className="w-4 h-4" />
                                      {user.isVerified ? "Unverify" : "Verify"}
                                    </DropdownMenu.Item> */}
                                  </>
                                )}
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
              {users.length === 0 ? (
                <table>
                  <tbody>
                    <EmptyTableUi
                      heading="No users found"
                      description="Try adjusting your search or add a new user."
                    />
                  </tbody>
                </table>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-dark-200 border border-gray-5/20 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-light-100 font-sofia-sans flex items-center gap-2">
                          {user.username || user.firstName}
                          {user.isSuspended ? (
                            <p className="text-sm bg-red-600 w-fit px-2 py-[2px] rounded-xl">
                              Suspended
                            </p>
                          ) : user.isBlocked ? (
                            <p className="text-sm bg-orange-600 w-fit px-2 py-[2px] rounded-xl">
                              Blocked
                            </p>
                          ) : user.isVerified ? (
                            <BadgeCheck size={16} color="green" />
                          ) : (
                            <UserIcon size={16} className="text-gray-4" />
                          )}
                        </div>
                        <div className="text-xs text-light-100 font-sofia-sans">
                          {user.email}
                        </div>
                        <div className="text-xs text-light-100 font-sofia-sans">
                          Last Login: {user.lastLoginAt
                            ? formatDate(new Date(user.lastLoginAt))
                            : "Never"}
                        </div>
                        <div className="text-xs text-light-100 font-sofia-sans flex items-center gap-2">
                          <span>Reports:</span>
                          <div className="flex flex-col justify-center items-center gap-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                (user.reportsCount || 0) > 0
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {user.reportsCount || 0}
                            </span>
                            {/* {(user.reportsCount || 0) > 0 && user.flagged && (
                              <span className="text-xs text-red-400 font-medium">
                                Flagged
                              </span>
                            )} */}
                          </div>
                        </div>
                        <div className="text-xs text-light-100 font-sofia-sans">
                          {user.role}
                        </div>
                         <div className="text-xs text-light-100 font-sofia-sans">
                          {user.lastLoginAt
                            ? formatDate(new Date(user.lastLoginAt))
                            : "Never"}
                        </div>
                        <div className="text-xs text-light-100 font-sofia-sans">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
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
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-light-100 font-sofia-sans"
                              onClick={() => router.push(`/profile/${user.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </DropdownMenu.Item>
                            {user.role !== "superAdmin" && (
                              <>
                                <DropdownMenu.Item
                                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded font-sofia-sans ${
                                    user.isSuspended
                                      ? "text-gray-4 cursor-not-allowed"
                                      : "hover:bg-gray-5/10 cursor-pointer text-light-100"
                                  }`}
                                  onClick={() => {
                                    if (!user.isSuspended) {
                                      if (user.isBlocked) {
                                        setSelectedUserForUnblock(user.id);
                                      } else {
                                        setSelectedUser(user.id);
                                        setBlockPopupOpen(true);
                                      }
                                    }
                                  }}
                                >
                                  <BlocksIcon className="w-4 h-4" />
                                  {user.isBlocked ? "Unblock" : "Block"}
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded font-sofia-sans ${
                                    user.isSuspended
                                      ? "text-red-500 cursor-not-allowed"
                                      : "hover:bg-gray-5/10 cursor-pointer text-light-100"
                                  }`}
                                  onClick={() => {
                                    if (!user.isSuspended) {
                                      setSelectedUserForSuspend(user.id);
                                      setSuspendPopupOpen(true);
                                    }
                                  }}
                                >
                                  <UserX className="w-4 h-4" />
                                  {user.isSuspended ? "Suspended" : "Suspend"}
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded font-sofia-sans ${
                                    user.isSuspended
                                      ? "text-gray-4 cursor-not-allowed"
                                      : "hover:bg-gray-5/10 cursor-pointer text-light-100"
                                  }`}
                                  onClick={() => {
                                    if (!user.isSuspended) {
                                      handleResetPassword(user.id);
                                    }
                                  }}
                                >
                                  <KeyRound className="w-4 h-4" />
                                  Reset Password
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer font-sofia-sans ${
                                    verifyLoading || user.isSuspended
                                      ? "text-gray-4 cursor-not-allowed"
                                      : "hover:bg-gray-5/10 text-light-100"
                                  }`}
                                  onClick={() => {
                                    if (!verifyLoading && !user.isSuspended) {
                                      handleVerifyUser(
                                        user.id,
                                        user.isVerified || false
                                      );
                                    }
                                  }}
                                >
                                  <BadgeCheck className="w-4 h-4" />
                                  {user.isVerified ? "Unverify" : "Verify"}
                                </DropdownMenu.Item>
                                {(user.reportsCount || 0) > 0 && (
                                  <DropdownMenu.Item
                                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded font-sofia-sans ${
                                      user.isSuspended || flagLoading
                                        ? "text-gray-4 cursor-not-allowed"
                                        : "hover:bg-gray-5/10 cursor-pointer text-light-100"
                                    }`}
                                    onClick={() => {
                                      if (!flagLoading && !user.isSuspended) {
                                        handleFlagUser(
                                          user.id,
                                          user.flagged || false
                                        );
                                      }
                                    }}
                                  >
                                    <Flag className="w-4 h-4" />
                                    {user.flagged ? "Unflag" : "Flag"}
                                  </DropdownMenu.Item>
                                )}
                              </>
                            )}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
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

        {selectedUser !== null && adminId && (
          <BlockUserPopup
            userId={selectedUser}
            adminId={adminId}
            open={blockPopupOpen}
            setOpen={setBlockPopupOpen}
            onUserBlocked={loadUsers}
          />
        )}
        {selectedUserForSuspend !== null && adminId && (
          <SuspendUserPopup
            userId={selectedUserForSuspend}
            adminId={adminId}
            open={suspendPopupOpen}
            setOpen={(open) => {
              setSuspendPopupOpen(open);
              if (!open) setSelectedUserForSuspend(null);
            }}
            onUserSuspended={() => {
              handleBulkSuspendSuccess();
              loadUsers();
            }}
          />
        )}
        {selectedUserForUnblock && adminId && (
          <DeleteConfirmationDialog
            deleteBrandId={selectedUserForUnblock}
            setDeleteBrandId={setSelectedUserForUnblock}
            heading="Confirm Unblock"
            content="Are you sure to unblock this user ? "
            deleteLoading={unblockLoading}
            actionLabel="Unblock"
            confirmDelete={async () => {
              setUnblockLoading(true);
              if (!selectedUserForUnblock) return;

              const result = await userService.unBlockUserAsAdmin({
                userId: selectedUserForUnblock,
                adminId,
              });

              if (result.success) {
                toast.success(result.message || "User unblocked successfully");
                loadUsers();
              } else {
                toast.error(result.message || "Failed to unblock user");
              }

              setUnblockLoading(false);
              setSelectedUserForUnblock(null);
            }}
          />
        )}
        {selectedUserForUnsuspend && adminId && (
          <DeleteConfirmationDialog
            deleteBrandId={selectedUserForUnsuspend}
            setDeleteBrandId={setSelectedUserForUnsuspend}
            heading="Confirm Unsuspend"
            content="Are you sure to unsuspend this user ? "
            deleteLoading={unsuspendLoading}
            actionLabel="Unsuspend"
            confirmDelete={async () => {
              setUnsuspendLoading(true);
              if (!selectedUserForUnsuspend) return;

              const result = await userService.unsuspendUserAsAdmin({
                userId: selectedUserForUnsuspend,
                adminId,
              });

              if (result.success) {
                toast.success(
                  result.message || "User unsuspended successfully"
                );
                loadUsers();
              } else {
                toast.error(result.message || "Failed to unsuspend user");
              }

              setUnsuspendLoading(false);
              setSelectedUserForUnsuspend(null);
            }}
          />
        )}
        {selectedUserForPasswordReset !== null && adminId && (
          <ResetPasswordPopup
            userId={selectedUserForPasswordReset}
            adminId={adminId}
            open={resetPasswordPopupOpen}
            setOpen={(open) => {
              setResetPasswordPopupOpen(open);
              if (!open) setSelectedUserForPasswordReset(null);
            }}
            onPasswordReset={loadUsers}
          />
        )}

        {showSignupModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 cursor-pointer"
            onClick={() => setShowSignupModal(false)}
          >
            <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-light-100 font-sofia-sans">
                  User Signups - Last 30 Days
                </h2>

                <button
                  onClick={() => setShowSignupModal(false)}
                  className="p-2 hover:bg-gray-5/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-dark-200 p-4 rounded-lg border border-green-500">
                    <div className="text-sm text-light-100 font-sofia-sans">
                      Total Signups
                    </div>
                    <div className="text-2xl font-bold text-green-500 font-sofia-sans">
                      {signupData.reduce((sum, day) => sum + day.count, 0)}
                    </div>
                  </div>
                  <div className="bg-dark-200 p-4 rounded-lg border border-green-500">
                    <div className="text-sm text-light-100 font-sofia-sans">
                      Daily Average
                    </div>
                    <div className="text-2xl font-bold text-green-500 font-sofia-sans">
                      {(
                        signupData.reduce((sum, day) => sum + day.count, 0) / 30
                      ).toFixed(1)}
                    </div>
                  </div>
                  <div className="bg-dark-200 p-4 rounded-lg border border-green-500">
                    <div className="text-sm text-light-100 font-sofia-sans">
                      Peak Day
                    </div>
                    <div className="text-2xl font-bold text-green-500 font-sofia-sans">
                      {Math.max(...signupData.map((d) => d.count))}
                    </div>
                  </div>
                  <div className="bg-dark-200 p-4 rounded-lg border border-green-500">
                    <div className="text-sm text-light-100 font-sofia-sans">
                      Active Days
                    </div>

                    <div className="text-2xl font-bold text-green-500 font-sofia-sans">
                      {signupData.filter((d) => d.count > 0).length}
                    </div>
                  </div>
                </div>

                <div className="bg-dark-200 px-4 pt-4 rounded-lg w-full">
                  <div className="flex items-end justify-between h-64 gap-1 w-full">
                    {signupData.map((day, index) => {
                      const maxCount = Math.max(
                        ...signupData.map((d) => d.count)
                      );
                      const height =
                        maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                      const dayNumber = new Date(day.date).getDate();

                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center group relative"
                          style={{ minWidth: "22px" }} // prevents overflow and keeps bars inside
                        >
                          {/* Bar */}
                          <div className="relative w-full">
                            <div
                              className="rounded-t transition-all duration-300 group-hover:opacity-90 relative z-8"
                              style={{
                                height:
                                  day.count === 0
                                    ? `${Math.max(height, 2)}%`
                                    : `${day.count * 22}px`, // 20px green + 2px gap visual pattern
                                minHeight: day.count === 0 ? "2px" : "20px",

                                background: `
      repeating-linear-gradient(
        to top,
        #22c55e 0px,
        #22c55e 20px,
        transparent 20px,
        transparent 22px
      )
    `,
                              }}
                            />

                            {/* Tooltip */}
                            <div
                              className="absolute z-10 -top-8 left-1/2 -translate-x-1/2 bg-dark-100 
                            text-xs text-light-100 px-2 py-1 rounded opacity-0 
                            group-hover:opacity-100 transition-opacity whitespace-nowrap"
                            >
                              {day.count <= 1
                                ? `${day.count} signup`
                                : `${day.count} signups`}
                            </div>
                          </div>

                          {/* Date bubble */}
                          <div
                            className={`text-xs mt-2 px-2 py-1 rounded-full transition-all
              ${
                day.count > 0
                  ? "bg-white text-black font-semibold shadow"
                  : "text-light-100"
              }
            `}
                          >
                            {dayNumber}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-light-100 font-semibold flex justify-center items-center gap-2">
                    Date - Day <ArrowBigRight />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
