/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";

export interface Notification {
  id: number;
  type: string;
  title?: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  category?: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  readAt?: string;
  entityType?: string;
  entityId?: number;
  fromUserId?: number;
  fromUser?: {
    id: number;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  };
  metadata?: unknown;
  createdAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: {
    marketplace: number;
    social: number;
    admin: number;
    system: number;
    promotional: number;
    account: number;
  };
  byPriority: {
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
}

interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: NotificationStats;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byCategory: {
      marketplace: 0,
      social: 0,
      admin: 0,
      system: 0,
      promotional: 0,
      account: 0,
    },
    byPriority: {
      urgent: 0,
      high: 0,
      normal: 0,
      low: 0,
    },
  });
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
  }>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const { request, loading, error } = useApiRequest<NotificationsResponse>();
  const user = useSelector((state: RootState) => state.user.user)?.user;
  // Fetch notifications
  const fetchNotifications = useCallback(
    async (
      params: {
        page?: number;
        limit?: number;
        type?: string;
        category?: string;
        priority?: string;
        isRead?: boolean;
        includeRelations?: boolean;
      } = {}
    ) => {
      try {
        if (!user?.id) {
          return null;
        }
        const queryParams = new URLSearchParams();
        if (user?.id) {
          queryParams.set("userId", user?.id.toString());
        }
        if (params.page) queryParams.set("page", params.page.toString());
        if (params.limit) queryParams.set("limit", params.limit.toString());
        if (params.type) queryParams.set("type", params.type);
        if (params.category) queryParams.set("category", params.category);
        if (params.priority) queryParams.set("priority", params.priority);
        if (params.isRead !== undefined)
          queryParams.set("isRead", params.isRead.toString());
        if (params.includeRelations)
          queryParams.set("includeRelations", "true");

        const response = await request({
          url: `/api/notifications?${queryParams.toString()}`,
          options: { method: "GET" },
        });

        if (response?.success) {
          setNotifications(response.data);
          setPagination(response.pagination);
          setStats(response.stats);
        }

        return response;
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        throw error;
      }
    },
    [request, user]
  );

  // Add new notification (typically from socket)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      // Check if notification already exists
      const exists = prev.some((n) => n.id === notification.id);
      if (exists) return prev;

      // Add to beginning of array
      return [notification, ...prev];
    });

    // Update stats
    setStats((prev) => ({
      ...prev,
      total: prev.total + 1,
      unread: notification.isRead ? prev.unread : prev.unread + 1,
      byCategory: {
        ...prev.byCategory,
        [notification.category || "system"]:
          prev.byCategory[
            notification.category as keyof typeof prev.byCategory
          ] + 1,
      },
      byPriority: {
        ...prev.byPriority,
        [notification.priority]: prev.byPriority[notification.priority] + 1,
      },
    }));
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: number) => {
      try {
        const response = await request({
          url: "/api/notifications",
          options: {
            method: "PUT",
            body: {
              action: "mark-read",
              notificationIds: [notificationId],
            },
          },
        });

        if (response?.success) {
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === notificationId
                ? {
                    ...notification,
                    isRead: true,
                    readAt: new Date().toISOString(),
                  }
                : notification
            )
          );

          // Update unread count
          setStats((prev) => ({
            ...prev,
            unread: Math.max(0, prev.unread - 1),
          }));
        }

        return response;
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        throw error;
      }
    },
    [request]
  );

  // Mark multiple notifications as read
  const markMultipleAsRead = useCallback(
    async (notificationIds: number[]) => {
      try {
        const response = await request({
          url: "/api/notifications",
          options: {
            method: "PUT",
            body: {
              action: "mark-read",
              notificationIds,
            },
          },
        });

        if (response?.success) {
          setNotifications((prev) =>
            prev.map((notification) =>
              notificationIds.includes(notification.id)
                ? {
                    ...notification,
                    isRead: true,
                    readAt: new Date().toISOString(),
                  }
                : notification
            )
          );

          // Update unread count
          const unreadToUpdate = notifications.filter(
            (n) => notificationIds.includes(n.id) && !n.isRead
          ).length;

          setStats((prev) => ({
            ...prev,
            unread: Math.max(0, prev.unread - unreadToUpdate),
          }));
        }

        return response;
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
        throw error;
      }
    },
    [request, notifications]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
      if (unreadIds.length === 0) return;

      return await markMultipleAsRead(unreadIds);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      throw error;
    }
  }, [notifications, markMultipleAsRead]);

  // Delete notification
  const removeNotification = useCallback(
    async (notificationId: number) => {
      try {
        const response = await request({
          url: "/api/notifications",
          options: {
            method: "PUT",
            body: {
              action: "delete",
              notificationIds: [notificationId],
            },
          },
        });

        if (response?.success) {
          const notification = notifications.find(
            (n) => n.id === notificationId
          );

          setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId)
          );

          // Update stats
          if (notification) {
            setStats((prev) => ({
              ...prev,
              total: Math.max(0, prev.total - 1),
              unread: notification.isRead
                ? prev.unread
                : Math.max(0, prev.unread - 1),
              byCategory: {
                ...prev.byCategory,
                [notification.category || "system"]: Math.max(
                  0,
                  prev.byCategory[
                    notification.category as keyof typeof prev.byCategory
                  ] - 1
                ),
              },
              byPriority: {
                ...prev.byPriority,
                [notification.priority]: Math.max(
                  0,
                  prev.byPriority[notification.priority] - 1
                ),
              },
            }));
          }
        }

        return response;
      } catch (error) {
        console.error("Failed to delete notification:", error);
        throw error;
      }
    },
    [request, notifications]
  );

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      const response = await request({
        url: "/api/notifications",
        options: {
          method: "PUT",
          body: {
            action: "clear-all",
          },
        },
      });

      if (response?.success) {
        setNotifications([]);
        setStats({
          total: 0,
          unread: 0,
          byCategory: {
            marketplace: 0,
            social: 0,
            admin: 0,
            system: 0,
            promotional: 0,
            account: 0,
          },
          byPriority: {
            urgent: 0,
            high: 0,
            normal: 0,
            low: 0,
          },
        });
      }

      return response;
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
      throw error;
    }
  }, [request]);

  // Update unread count (typically called from socket)
  const updateUnreadCount = useCallback((count: number) => {
    setStats((prev) => ({
      ...prev,
      unread: count,
    }));
  }, []);

  // Get filtered notifications
  const getNotificationsByType = useCallback(
    (type: string) => {
      return notifications.filter((n) => n.type === type);
    },
    [notifications]
  );

  const getNotificationsByCategory = useCallback(
    (category: string) => {
      return notifications.filter((n) => n.category === category);
    },
    [notifications]
  );

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((n) => !n.isRead);
  }, [notifications]);

  const getNotificationsByPriority = useCallback(
    (priority: string) => {
      return notifications.filter((n) => n.priority === priority);
    },
    [notifications]
  );

  // Auto-fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Polling for real-time updates (fallback if socket is not available)
  //   useEffect(() => {
  //     if (!pollInterval) return;

  //     const interval = setInterval(() => {
  //       fetchNotifications({ page: 1, limit: pagination.limit });
  //     }, pollInterval);

  //     return () => clearInterval(interval);
  //   }, [pollInterval, fetchNotifications, pagination.limit]);

  return {
    // Data
    notifications,
    stats,
    pagination,

    // Loading state
    loading,
    error,

    // Actions
    fetchNotifications,
    addNotification,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    updateUnreadCount,

    // Helpers
    getNotificationsByType,
    getNotificationsByCategory,
    getUnreadNotifications,
    getNotificationsByPriority,
  };
}
