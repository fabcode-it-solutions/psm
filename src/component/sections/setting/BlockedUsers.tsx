"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { RootState } from "@/libs/redux/store";
import { useSelector } from "react-redux";
import { userService } from "@/services/user.service";

type BlockedUser = {
  id: number;
  username: string | null;
  email: string;
  profileImage?: string | null;
};

const BlockedUsers = () => {
  const user = useSelector((state: RootState) => state.user.user?.user);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlockedUsers = useCallback(async () => {
    if (!user?.id) {
      console.warn("No user.id found in Redux:", user);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/user/block?userId=${user.id}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch blocked users");
      }

      setBlockedUsers(data.data || []);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleUnblock = async (blockedUserId: number) => {
    if (!user?.id) return;

    const result = await userService.unBlockUser({
      userId: blockedUserId,
      currentUserId: user.id,
    });

    if (result?.success) {
      setBlockedUsers((prev) => prev.filter((u) => u.id !== blockedUserId));
    }
  };
  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  // const debouncedSearch = useDebounce(search, 500);

  const filteredUsers = blockedUsers.filter((u) => {
    const nameOrEmail = u.username || u.email;
    return nameOrEmail.toLowerCase().includes(search);
  });
  if (loading)
    return (
      <p className="text-center py-6 text-[#54DC00]">
        Loading blocked users...
      </p>
    );

  if (error) return <p className="text-center text-red-500 py-6">{error}</p>;

  return (
    <section className="overflow-x-hidden max-w-[949px]">
      <div className=" bg-[#F4F4F4] rounded-[10px] py-[43px] flex flex-col mt-[38px] px-6 gap-4">
        <h2 className="font-supreme font-bold text-[26px] leading-[18px] tracking-[-0.17px] capitalize text-dark-blue-cm">
          Blocked User
        </h2>
        <p className="font-abel font-normal text-sm leading-[140%] tracking-[1%]  text-dark-blue-cm">
          Check your report status here
        </p>
      </div>

      <div className="w-[949px] bg-[#FFFFFF] rounded-[6px] py-[17px] mt-6 pl-[17.71px] flex gap-[22.05px] items-center">
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
          placeholder="Search blocked user"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="font-poppins font-normal text-sm leading-[100%] tracking-[0em] align-middle outline-none"
        />
      </div>

      <div className="flex-col flex gap-1 mt-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-4 bg-white rounded-[8px]"
            >
              <span className="flex items-center gap-4 py-4">
                <Image
                  src={user.profileImage || "/assets/images/Withoutprofil.png"}
                  alt={`${user.username} Profile Image`}
                  width={56}
                  height={56}
                  className="w-[56px] h-[56px] object-cover rounded-full"
                />
                <h3 className="font-supreme font-medium text-xl leading-[100%] tracking-[0.01em]">
                  {user.username || user.email}
                </h3>
              </span>
              <button
                onClick={() => handleUnblock(user.id)}
                className="py-2.5 px-2.5 bg-[#002029] text-[#54DC00] rounded-[20px] font-supreme font-medium text-xl leading-[100%] tracking-[-0.17px] capitalize"
              >
                Unblock
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-6">
            No blocked users found..
          </p>
        )}
      </div>
    </section>
  );
};

export default BlockedUsers;
