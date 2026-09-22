/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import { useNotifications } from './useNotifications';

interface Notification {
  id: number;
  type: string;
  title?: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  actionUrl?: string;
  actionLabel?: string;
  fromUser?: {
    id: number;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  };
  metadata?: unknown;
  createdAt: string;
}

interface NotificationSocketEvents {
  onNewNotification?: (notification: Notification) => void;
  onNotificationRead?: (notificationId: number) => void;
  onNotificationDeleted?: (notificationId: number) => void;
  onBulkNotificationsRead?: (notificationIds: number[]) => void;
  onNotificationCountUpdate?: (count: number) => void;
}

export function useNotificationSocket(events: NotificationSocketEvents = {}) {
  const { socket, isConnected } = useSocket();
  const { addNotification, markAsRead, removeNotification, updateUnreadCount } = useNotifications();
  const toastRef = useRef<{ [key: string]: string }>({});

  // Handle incoming notifications
  const handleNewNotification = useCallback((notification: Notification) => {
    console.log('📬 New notification received:', notification);

    // Add to local state
    // addNotification(notification);

    // Show toast notification based on priority and category
    const shouldShowToast = notification.priority === 'high' || notification.priority === 'urgent';
    const isSystemNotification = notification.category === 'system';
    // const isMarketplaceNotification = notification.category === 'marketplace';

    if (shouldShowToast || isSystemNotification) {
      const toastId = `notification-${notification.id}`;
      
      // Prevent duplicate toasts
      if (toastRef.current[toastId]) {
        return;
      }

      const toastOptions = {
        id: toastId,
        duration: notification.priority === 'urgent' ? 10000 : 5000,
        style: {
          background: 'var(--color-dark-100)',
          color: 'var(--color-light-100)',
          border: '1px solid var(--color-gray-5)',
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: 'var(--font-sofia-sans)',
        } as React.CSSProperties,
        icon: getNotificationIcon(notification.type, notification.priority),
      };

      // Different toast types based on priority
    //   if (notification.priority === 'urgent') {
    //     toastRef.current[toastId] = toast.error(
    //       <NotificationToastContent notification={notification} />,
    //       toastOptions
    //     );
    //   } else if (notification.priority === 'high' || isMarketplaceNotification) {
    //     toastRef.current[toastId] = toast.success(
    //       <NotificationToastContent notification={notification} />,
    //       toastOptions
    //     );
    //   } else {
    //     toastRef.current[toastId] = toast(
    //       <NotificationToastContent notification={notification} />,
    //       toastOptions
    //     );
    //   }

      // Clean up toast reference after it's dismissed
      setTimeout(() => {
        delete toastRef.current[toastId];
      }, toastOptions.duration + 1000);
    }

    // Call custom handler
    events.onNewNotification?.(notification);
  }, [addNotification, events.onNewNotification]);

  // Handle notification read status updates
  const handleNotificationRead = useCallback((data: { notificationId: number }) => {
    console.log('📖 Notification marked as read:', data.notificationId);
    markAsRead(data.notificationId);
    events.onNotificationRead?.(data.notificationId);
  }, [markAsRead, events.onNotificationRead]);

  // Handle notification deletion
  const handleNotificationDeleted = useCallback((data: { notificationId: number }) => {
    console.log('🗑️ Notification deleted:', data.notificationId);
    removeNotification(data.notificationId);
    events.onNotificationDeleted?.(data.notificationId);
  }, [removeNotification, events.onNotificationDeleted]);

  // Handle bulk read operations
  const handleBulkNotificationsRead = useCallback((data: { notificationIds: number[] }) => {
    console.log('📚 Bulk notifications marked as read:', data.notificationIds);
    data.notificationIds.forEach(id => markAsRead(id));
    events.onBulkNotificationsRead?.(data.notificationIds);
  }, [markAsRead, events.onBulkNotificationsRead]);

  // Handle unread count updates
  const handleNotificationCountUpdate = useCallback((data: { count: number }) => {
    console.log('🔢 Notification count updated:', data.count);
    updateUnreadCount(data.count);
    events.onNotificationCountUpdate?.(data.count);
  }, [updateUnreadCount, events.onNotificationCountUpdate]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for notification events
    socket.on('notification:new', handleNewNotification);
    socket.on('notification:read', handleNotificationRead);
    socket.on('notification:deleted', handleNotificationDeleted);
    socket.on('notification:bulk_read', handleBulkNotificationsRead);
    socket.on('notification:count_update', handleNotificationCountUpdate);

    // Join user's notification room
    socket.emit('join:notifications');

    // Request initial unread count
    socket.emit('notification:get_unread_count');

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:read', handleNotificationRead);
      socket.off('notification:deleted', handleNotificationDeleted);
      socket.off('notification:bulk_read', handleBulkNotificationsRead);
      socket.off('notification:count_update', handleNotificationCountUpdate);
    };
  }, [
    socket,
    isConnected,
    handleNewNotification,
    handleNotificationRead,
    handleNotificationDeleted,
    handleBulkNotificationsRead,
    handleNotificationCountUpdate,
  ]);

  // Socket actions
  const socketActions = {
    // Mark notification as read via socket
    markNotificationAsRead: useCallback((notificationId: number) => {
      if (socket && isConnected) {
        socket.emit('notification:mark_read', { notificationId });
      }
    }, [socket, isConnected]),

    // Mark multiple notifications as read
    markNotificationsAsRead: useCallback((notificationIds: number[]) => {
      if (socket && isConnected) {
        socket.emit('notification:bulk_mark_read', { notificationIds });
      }
    }, [socket, isConnected]),

    // Delete notification via socket
    deleteNotification: useCallback((notificationId: number) => {
      if (socket && isConnected) {
        socket.emit('notification:delete', { notificationId });
      }
    }, [socket, isConnected]),

    // Request notification history
    requestNotificationHistory: useCallback((params?: { page?: number; limit?: number; type?: string }) => {
      if (socket && isConnected) {
        socket.emit('notification:get_history', params || {});
      }
    }, [socket, isConnected]),

    // Subscribe to specific notification types
    subscribeToType: useCallback((notificationType: string) => {
      if (socket && isConnected) {
        socket.emit('notification:subscribe_type', { type: notificationType });
      }
    }, [socket, isConnected]),

    // Unsubscribe from notification types
    unsubscribeFromType: useCallback((notificationType: string) => {
      if (socket && isConnected) {
        socket.emit('notification:unsubscribe_type', { type: notificationType });
      }
    }, [socket, isConnected]),
  };

  return {
    isConnected,
    socket,
    ...socketActions,
  };
}

// Toast content component
// function NotificationToastContent({ notification }: { notification: Notification }) {
//   return (
//     <div className="flex items-start gap-3">
//       {notification.fromUser?.profileImage ? (
//         <img
//           src={notification.fromUser.profileImage}
//           alt={`${notification.fromUser.firstName || 'User'}`}
//           className="w-8 h-8 rounded-full flex-shrink-0"
//         />
//       ) : (
//         <div className="w-8 h-8 bg-accent-100/20 rounded-full flex items-center justify-center flex-shrink-0">
//           <span className="text-accent-100 text-xs font-bold">
//             {notification.fromUser?.firstName?.[0] || '!'}
//           </span>
//         </div>
//       )}
//       <div className="flex-1 min-w-0">
//         {notification.title && (
//           <p className="font-semibold text-light-100 mb-1 text-sm">
//             {notification.title}
//           </p>
//         )}
//         <p className="text-light-200 text-sm leading-relaxed">
//           {notification.message}
//         </p>
//         {notification.actionLabel && (
//           <p className="text-accent-100 text-xs mt-2 font-medium">
//             {notification.actionLabel}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

// Get notification icon based on type and priority
function getNotificationIcon(type: string, priority: string): string {
  if (priority === 'urgent') return '🚨';
  if (priority === 'high') return '⚡';
  
  switch (type) {
    case 'offer_received':
    case 'offer_accepted':
      return '💰';
    case 'new_follower':
      return '👤';
    case 'build_liked':
    case 'build_commented':
      return '❤️';
    case 'new_part_added':
    case 'new_listing_added':
      return '📦';
    case 'price_drop':
    case 'back_in_stock':
      return '🔔';
    case 'system_alert':
    case 'maintenance_scheduled':
      return '⚙️';
    case 'account_verified':
    case 'payment_received':
      return '✅';
    case 'report_submitted':
      return '⚠️';
    default:
      return '🔔';
  }
}