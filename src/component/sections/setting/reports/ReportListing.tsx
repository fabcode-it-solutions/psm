/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { RootState } from "@/libs/redux/store";
import { setLoading } from "@/libs/redux/slices/partsSlice";
import LoaderDots from "@/component/ui/loader/LoaderDots";
import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import IconArrowDropdown from "@/assets/icons/IconArrowDropdown";
import Link from "next/link";

type Report = {
  id: number;
  reportId: string;
  reporterUserId: number;
  reportedUserId: number;
  reason: string;
  status: string;
  description: string;
  createdAt: string;
  reportedUserName: string;
  reporterUserName: string;
  reviewedAt: string;
  reviewedBy: string;
  category: string;
};
function formatDateWithOrdinal(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.toLocaleString("en-US", { month: "long" });

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return `${day}${getOrdinalSuffix(day)}, ${month} ${year}`;
}

export default function ReportList() {
  const dispatch = useDispatch();
  const reporterId = useSelector(
    (state: RootState) => state.user.user?.user.id
  );
  const loading = useSelector((state: RootState) => state.dashboard.loading);
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setSearchTerm(inputValue.trim());
      setPage(1);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!reporterId) return;
      dispatch(setLoading(true));
      setError(null);
      try {
        const params = new URLSearchParams({
          reporter: reporterId.toString(),
          page: page.toString(),
          limit: limit.toString(),
          search: searchTerm,
        });

        if (statusFilter && statusFilter !== "all") {
          params.append("status", statusFilter);
        }

        const res = await fetch(`/api/user/report?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch reports");
        setReports(data.data || []);
        setHasMore(data.pagination?.hasNext || false);
      } catch (err: any) {
        setError(err.message);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchReports();
  }, [reporterId, page, limit, searchTerm, statusFilter, dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const options = [
    { label: "All", value: "all" },
    { label: "Reviewed", value: "reviewed" },
    { label: "Pending", value: "pending" },
  ];

  if (!reporterId) return <p>You must be logged in to see your reports.</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-[1009px] w-full px-[30px] py-[38px] max-tab-sm:px-[15px] max-tab-sm:py-[10px] flex flex-col gap-[24px]">
      <div className="py-[43px] pl-[24px] bg-[#F4F4F4] w-full rounded-[10px] flex gap-4 flex-col">
        <h2 className="font-supreme text-[26px] leading-[18px] tracking-[-0.17px] font-bold capitalize w-fit">
          Reported Tickets
        </h2>
        <p className="font-abel  text-sm leading-[1.43] tracking-[0.14px] text-dark-blue-cm font-normal">
          Check your report status here
        </p>
      </div>

      <div className="flex max-mb-md:flex-col flex-row gap-6 flex-wrap items-center max-mb-md:items-start">
        <div className="flex-1 flex bg-[#FFFFFF] rounded-[6px] w-full items-center p-[17px] gap-[22.05px]">
          <svg
            width="22"
            height="24"
            viewBox="0 0 22 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.70508 2.5C13.8472 2.5 17.2051 5.85786 17.2051 10C17.2051 11.7101 16.6327 13.2866 15.6691 14.5483L20.4122 19.2929C20.8027 19.6834 20.8027 20.3166 20.4122 20.7071C20.0517 21.0676 19.4845 21.0953 19.0922 20.7903L18.998 20.7071L14.2533 15.964C12.9917 16.9276 11.4152 17.5 9.70508 17.5C5.56294 17.5 2.20508 14.1421 2.20508 10C2.20508 5.85786 5.56294 2.5 9.70508 2.5ZM9.70508 4.5C6.66751 4.5 4.20508 6.96243 4.20508 10C4.20508 13.0376 6.66751 15.5 9.70508 15.5C12.7426 15.5 15.2051 13.0376 15.2051 10C15.2051 6.96243 12.7426 4.5 9.70508 4.5Z"
              fill="#002029"
            />
          </svg>

          <input
            type="text"
            placeholder="Search report"
            className="text-sm leading-[1.501] w-full"
            value={inputValue}
            onChange={handleSearch}
          />
        </div>

        <div className="flex items-center gap-[15px] max-w-[235px]">
          <p className="text-base leading-[1.190] text-[#CDD2C8] tracking-[0.64] whitespace-nowrap ">
            Sort By
          </p>

          <Select.Root value={statusFilter} onValueChange={handleStatusChange}>
            <Select.Trigger
              className="inline-flex items-center max-h-[54px] focus:outline-none gap-[30px] w-full justify-between bg-[#FFFFFF] border-[1.5px] border-[#E8E8E866] rounded-[6px] font-medium font-supreme text-sm text-[#002029] py-[15px] px-[20px]"
              aria-label="Sort by status"
            >
              <Select.Value placeholder="Select status" />
              <Select.Icon>
                <IconArrowDropdown />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content className="border border-gray-5/20 rounded-lg shadow-lg overflow-hidden z-[9999] bg-white min-w-[200px]">
                <Select.Viewport className="p-1 max-h-60 overflow-y-auto">
                  <Select.Group>
                    {options.map(({ label, value }) => (
                      <Select.Item
                        key={value}
                        value={value}
                        className="text-dark-blue-cm hover:bg-light-100 px-3 py-2 capitalize cursor-pointer rounded font-sofia-sans"
                      >
                        <Select.ItemText>{label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>

      {loading ? (
        <div className="z-[99999] fixed top-0 text-accent-100 font-supreme flex-col gap-3 text-2xl font-bold flex items-center justify-center left-0 bg-dark-blue-cm/20 backdrop-blur-sm w-full h-full">
          <LoaderDots className="!bg-accent-100 !w-4 !h-4" />
          <span>Loading...</span>
        </div>
      ) : reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <>
          <div className="w-full flex flex-row gap-[12px] flex-wrap ">
            {reports.map((report) => (
              <Link
                href={`/settings/reports/${report.id}`}
                key={report.id}
                className="bg-white rounded-[6px] p-3 border-[1.5] border-[#E8E8E866] text-[#002029] flex max-tab-lg:max-w-full flex-col gap-[9px] w-full max-w-[468px] max-des-sm:max-w-[340px]"
              >
                <div className="flex justify-between">
                  <h4 className="text-[18px] font-bold leading-[1.24] tracking-[0.18px] text-[#002029]">
                    {report.reportId}
                  </h4>
                  <span className="font-normal text-sm leading-[1.215] h-fit tracking-[0.56px] capitalize">
                    Status : <b>{report.status}</b>
                  </span>
                </div>
                <span className="font-normal leading-[1.313] text-[#002029]  tracking-[0.16px] capitalize">
                  Report user : <b>{report.reportedUserName}</b>
                </span>
                <p className="text-sm leading-[1.2382] font-normal text-[#002029] ">
                  {report.description
                    ? report.description.split(" ").slice(0, 30).join(" ") +
                      (report.description.split(" ").length > 30 ? "..." : "")
                    : ""}
                </p>

                <div className="flex justify-between items-center">
                  <div className="pt-[3px] flex gap-[7px]">
                    <span className="py-[6px] px-[12px] bg-[#002029] rounded-[6px]">
                      <p className="text-[#54DC00] text-xs leading-[1.25] capitalize">
                        {report.reason}
                      </p>
                    </span>
                    <span className="py-[6px] px-[12px] bg-[#002029] rounded-[6px]">
                      <p className="text-[#54DC00] text-xs leading-[1.25] capitalize">
                        {report.category}
                      </p>
                    </span>
                  </div>
                  <span className="text-xs text-[#002029] opacity-40  leading-[1.25] tracking-[] capitalize">
                    {formatDateWithOrdinal(report.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {(hasMore || page > 1) && (
            <div className="flex justify-end gap-[15px] items-center mt-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <span className="text-sm">Page {page}</span>
              <button
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!hasMore}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
