import { handleRevalidate } from "@/utils/handleRevalidate";
import toast from "react-hot-toast";

export const userService = {
  updateUser: async ({
    userId,
    updates,
  }: {
    userId: number;
    updates: {
      email?: string;
      firstName?: string | null;
      lastName?: string | null;
      username?: string | null;
      bio?: string | null;
      profileImage?: string | null;
      coverImage?: string | null;
      phoneNumber?: string | null;
      countryCode?: string | null;
      role?: string | null;
      isVerified?: boolean;
      isSocialLogin?: boolean;
      loginType?: string;
      anonymous?: boolean | null;
      isTrustedSeller?: boolean | null;
      anonymousName?: string | null;
      updatedAt?: Date;
      isPrivate?: boolean;
      flagged?: boolean;
    };
  }) => {
    try {
      const followingRelations = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/user`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: userId,
            updates,
          }),
          next: {
            tags: ["profile"],
          },
        }
      );
      const result = await followingRelations.json();
      return result;
    } catch (error) {
      console.log("Error fetching store:", error);
      return {
        message: "Error fetching store",
        statusCode: 500,
      };
    }
  },
  checkBlocked: async ({
    userId,
    currentUserId,
  }: {
    userId: number;
    currentUserId: number;
  }) => {
    try {
      const blockRelations = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/user/block/checkBlocked?userId=${userId}&currentUserId=${currentUserId}`,
        {
          cache: "no-cache",
          next: {
            tags: ["profile"],
          },
        }
      );
      const result = await blockRelations.json();
      return result;
    } catch (error) {
      console.log("Error fetching store:", error);
      return {
        message: "Error fetching store",
        statusCode: 500,
      };
    }
  },
  checkBlockedSelf: async ({
    userId,
    currentUserId,
  }: {
    userId: number;
    currentUserId: number;
  }) => {
    try {
      const blockRelations = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/user/block/checkBlocked?userId=${userId}&currentUserId=${currentUserId}&type=self`,
        {
          cache: "force-cache",
          next: {
            tags: ["profile"],
          },
        }
      );
      const result = await blockRelations.json();
      return result;
    } catch (error) {
      console.log("Error fetching store:", error);
      return {
        message: "Error fetching store",
        statusCode: 500,
      };
    }
  },
  blockUser: async ({
    userId,
    currentUserId,
  }: {
    userId: number;
    currentUserId: number;
  }) => {
    const toastId = toast.loading("Blocking User...");
    try {
      const blockRelations = await fetch(`/api/user/block/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockerId: currentUserId,
          blockedId: userId,
        }),
        next: {
          tags: ["profile"],
        },
      });
      const result = await blockRelations.json();
      console.log(result);
      if (result?.success) {
        toast.success(result?.message);
      }
      return result;
    } catch (error) {
      console.log("Error fetching store:", error);
      return {
        message: "Error fetching store",
        statusCode: 500,
      };
    } finally {
      toast.dismiss(toastId);
      handleRevalidate("profile");
    }
  },

  getBlockedUsers: async ({ userId }: { userId: number }) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/user/block?userId=${userId}`,
        {
          cache: "no-cache",
          next: { tags: ["profile"] },
        }
      );
      const result = await res.json();
      return result;
    } catch (error) {
      console.log("Error fetching blocked users:", error);
      return {
        message: "Error fetching blocked users",
        statusCode: 500,
      };
    }
  },

  unBlockUser: async ({
    userId,
    currentUserId,
  }: {
    userId: number;
    currentUserId: number;
  }) => {
    const toastId = toast.loading("Unblocking User...");
    try {
      const userData = await fetch(`/api/user/block`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockerId: currentUserId,
          blockedId: userId,
        }),
        next: {
          tags: ["profile"],
        },
      });
      const user = await userData.json();
      if (user?.success) {
        toast.success(user?.message);
      }
      return user;
    } catch (error) {
      console.error(error);
    } finally {
      toast.dismiss(toastId);
      handleRevalidate("profile");
    }
  },
  reportUser: async ({
    userId,
    currentUserId,
    reason,
    description,
    category,
    imageMediaId,
  }: {
    userId: number;
    currentUserId: number;
    reason?: string;
    description?: string;
    category?: string;
    imageMediaId?: number;
  }) => {
    const toastId = toast.loading("Reporting User...");
    try {
      const blockRelations = await fetch(`/api/user/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterUserId: currentUserId,
          reportedUserId: userId,
          reason,
          description,
          category,
          imageMediaId,
        }),
        next: {
          tags: ["profile"],
        },
      });
      const result = await blockRelations.json();
      console.log(result);
      if (result?.success) {
        toast.success(result?.message);
      }
      return result;
    } catch (error) {
      console.log("Error fetching store:", error);
      return {
        message: "Error fetching store",
        statusCode: 500,
      };
    } finally {
      toast.dismiss(toastId);
      handleRevalidate("profile");
    }
  },
  checkReport: async ({
    userId,
    currentUserId,
  }: {
    userId: number;
    currentUserId: number;
  }) => {
    try {
      const blockRelations = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/user/report/check?userId=${userId}&currentUserId=${currentUserId}`,
        {
          next: {
            tags: ["profile"],
          },
        }
      );
      const result = await blockRelations.json();
      return result;
    } catch (error) {
      console.log("Error fetching store:", error);
      return {
        message: "Error fetching store",
        statusCode: 500,
      };
    }
  },
  getAllReports: async ({ currentUserId }: { currentUserId: number }) => {
    try {
      const blockRelations = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/user/report?reporter=${currentUserId}`,
        {
          next: {
            tags: ["profile"],
          },
        }
      );
      const result = await blockRelations.json();
      return result;
    } catch (error) {
      console.log("Error fetching store:", error);
      return {
        message: "Error fetching store",
        statusCode: 500,
      };
    }
  },
 getAllUsers: async ({page, limit, search, sortBy,sortOrder,}: {page: number;limit: number;search?: string;sortBy?: string;sortOrder?: string;}) => {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search ? { search } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(sortOrder ? { sortOrder } : {}),
    }).toString();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/users?${query}`,

       {
          next: {
            tags: ["profile"],
          },
        }
    );
    const result = await res.json();
    return result;
  } catch (error) {
    console.log("Error fetching users:", error);
    return { message: "Error fetching users", statusCode: 500 };
  }
} , 

 createUser: async (data: { username: string; email: string;  role : string; phoneNumber : number }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    
  
  );
    return res.json();
  },

blockUserAsAdmin: async ({
  userId,
  adminId,
  reason,
  blockTime,
  blockDevice,
  blockIp,
}: {
  userId: number;
  adminId: number;
  reason: string;
  blockTime?: string;
  blockDevice?: boolean;
  blockIp?: boolean;
}) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/admin/users/userBlock`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          adminId, 
          reason, 
          blockTime,
          blockDevice: blockDevice || false,
          blockIp: blockIp || false,
        }),
      }
    );

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error blocking user:", error);
    return { success: false, message: "Error blocking user" };
  }
},


unBlockUserAsAdmin: async ({ 
  userId, 
  adminId,
  unblockDevice,
}: { 
  userId: number; 
  adminId: number;
  unblockDevice?: boolean;
}) => {
  return fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/users/userBlock`, {
    method: "PATCH", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      userId, 
      adminId,
      unblockDevice: unblockDevice || false,
    }),
  }).then(res => res.json());
},

checkBanStatus: async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/admin/users/userBlock`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error checking ban status:", error);
    return { success: false, message: "Error checking ban status" };
  }
},

getBannedDevices: async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/admin/banned-devices`,
      {
        cache: "no-cache",
        next: { tags: ["banned-devices"] },
      }
    );
    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error fetching banned devices:", error);
    return { success: false, message: "Error fetching banned devices" };
  }
},

removeBan: async (banId: number) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/admin/banned-devices/${banId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error removing ban:", error);
    return { success: false, message: "Error removing ban" };
  }
},
suspendUserAsAdmin: async ({
  userId,
  adminId,
  reason,
  suspendTime,
}: {
  userId: number;
  adminId: number;
  reason: string;
  suspendTime?: string;
}) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/admin/users/userSuspend`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, adminId, reason, suspendTime }),
      }
    );
    return res.json();
  } catch (error) {
    console.error("Error suspending user:", error);
    return { success: false, message: "Error suspending user" };
  }
},

unsuspendUserAsAdmin: async ({ userId, adminId }: { userId: number; adminId: number }) => {
  return fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/users/userSuspend`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, adminId }),
  }).then(res => res.json());
},

resetPasswordAsAdmin: async ({ userId, adminId }: { userId: number; adminId: number }) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/admin/users/resetPassword`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, adminId }),
      }
    );
    return res.json();
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, message: "Error resetting password" };
  }
},

changePasswordAsAdmin: async ({ userId, adminId, newPassword }: { userId: number; adminId: number; newPassword: string }) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/admin/users/changePassword`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, adminId, newPassword }),
      }
    );
    return res.json();
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, message: "Error changing password" };
  }
},


getReports: async ({
  page = 1,
  limit = 20,
  search = "",
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
      ...(search ? { search } : {}),
    });

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/admin/reports?${query.toString()}`,
      { next: { tags: ["reports"] } }
    );

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    return { success: false, data: [], pagination: null };
  }
},
getDetailReport: async (reportId: number) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/admin/reports/${reportId}`,
      { next: { tags: ["report-detail"] } }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch report detail");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching report detail:", error);
    return { success: false, data: null };
  }
},


};
