"use client";

import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell, Check, Settings, MoreHorizontal } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';

import { motion, AnimatePresence } from 'framer-motion';
import { NotificationItem } from './NotificationItem';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    stats, 
    loading, 
    markAllAsRead, 
    fetchNotifications 
  } = useNotifications();
  
  const { isConnected } = useNotificationSocket({
    onNewNotification: (notification) => {
 
    },
  });

  // const unreadNotifications = notifications.filter(n => !n.isRead);
  const hasUnread = stats.unread > 0;

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className={`
            relative p-2 text-light-100 hover:bg-gray-5/10 rounded-lg transition-colors
            ${className}
          `}
        >
          <Bell className="w-5 h-5" />
          
          {/* Unread count badge */}
          <AnimatePresence>
            {hasUnread && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
              >
                {stats.unread > 99 ? '99+' : stats.unread}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Connection status indicator */}
          <div className={`
            absolute bottom-0 right-0 w-2 h-2 rounded-full transition-colors
            ${isConnected ? 'bg-green-500' : 'bg-gray-500'}
          `} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="w-80 bg-dark-100 border border-gray-5/20 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden"
          sideOffset={5}
          align="end"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-5/20">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-light-100 font-supreme">Notifications</h3>
              {!isConnected && (
                <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                  Offline
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {hasUnread && (
                <button
                  onClick={handleMarkAllRead}
                  className="p-1 text-gray-4 hover:text-accent-100 hover:bg-accent-100/10 rounded transition-colors"
                  title="Mark all as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger asChild>
                  <button className="p-1 text-gray-4 hover:text-light-100 hover:bg-gray-5/10 rounded transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent
                    className="bg-dark-100 border border-gray-5/20 rounded-lg shadow-xl p-1 min-w-[140px]"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none"
                      onClick={handleRefresh}
                    >
                      <Settings className="w-4 h-4" />
                      <span className="font-sofia-sans text-sm">Refresh</span>
                    </DropdownMenu.Item>
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-accent-100 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-4 text-sm font-sofia-sans">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-4 mx-auto mb-4" />
                <h4 className="text-light-100 font-bold mb-2 font-supreme">No notifications</h4>
                <p className="text-gray-4 text-sm font-sofia-sans">
                  You&apos;re all caught up! New notifications will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-5/10">
                {notifications.slice(0, 10).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={() => {}} // Handled by socket
                    onDelete={() => {}} // Handled by socket
                    compact
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-5/20 bg-gray-5/5">
              <button
                className="w-full text-center text-accent-100 hover:text-accent-100/80 text-sm font-sofia-sans transition-colors"
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to full notifications page
                  window.location.href = '/notifications';
                }}
              >
                View all notifications ({stats.total})
              </button>
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
