"use client";
import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  ExternalLink,
  User,
  Package,
  Heart,
  DollarSign,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { Notification } from '@/hooks/useNotifications';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import Image from 'next/image';

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onDelete: () => void;
  compact?: boolean;
}

export function NotificationItem({ 
  notification, 
  onRead, 
  onDelete, 
  compact = false 
}: NotificationItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { markNotificationAsRead, deleteNotification } = useNotificationSocket();

  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
      onRead();
    }
  };

  const handleDelete = () => {
    deleteNotification(notification.id);
    onDelete();
    setIsMenuOpen(false);
  };

  const handleClick = () => {
    handleMarkAsRead();
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'new_follower':
        return <User className="w-4 h-4 text-blue-400" />;
      case 'offer_received':
      case 'offer_accepted':
        return <DollarSign className="w-4 h-4 text-green-400" />;
      case 'build_liked':
      case 'build_commented':
        return <Heart className="w-4 h-4 text-red-400" />;
      case 'new_part_added':
      case 'new_listing_added':
        return <Package className="w-4 h-4 text-blue-400" />;
      case 'system_alert':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default:
        return <Settings className="w-4 h-4 text-gray-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'border-red-500';
      case 'high':
        return 'border-orange-500';
      case 'normal':
        return 'border-transparent';
      case 'low':
        return 'border-transparent';
      default:
        return 'border-transparent';
    }
  };

  return (
    <div
      className={`
        relative p-4 hover:bg-gray-5/5 transition-colors cursor-pointer border-l-2
        ${notification.isRead ? 'opacity-60' : 'opacity-100'}
        ${getPriorityColor()}
        ${compact ? 'py-3' : 'py-4'}
      `}
      onClick={handleClick}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute top-4 left-2 w-2 h-2 bg-accent-100 rounded-full"></div>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar or Icon */}
        {notification.fromUser?.profileImage ? (
          <Image
            src={notification.fromUser.profileImage}
            alt={notification.fromUser.firstName || 'User'}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-5/10 rounded-full flex items-center justify-center flex-shrink-0">
            {getNotificationIcon()}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {notification.title && !compact && (
            <h4 className="font-semibold text-light-100 mb-1 text-sm font-sofia-sans">
              {notification.title}
            </h4>
          )}
          
          <p className={`text-light-200 leading-relaxed ${compact ? 'text-sm' : 'text-sm'} font-sofia-sans`}>
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-4 font-sofia-sans">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            
            {notification.actionLabel && (
              <span className="text-xs text-accent-100 font-medium font-sofia-sans">
                {notification.actionLabel}
              </span>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              className="p-1 text-gray-4 hover:text-light-100 hover:bg-gray-5/10 rounded transition-colors opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="bg-dark-100 border border-gray-5/20 rounded-lg shadow-xl p-1 min-w-[140px] z-50"
              sideOffset={5}
              onClick={(e) => e.stopPropagation()}
            >
              {!notification.isRead && (
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none"
                  onClick={handleMarkAsRead}
                >
                  <Eye className="w-4 h-4" />
                  <span className="font-sofia-sans text-sm">Mark as read</span>
                </DropdownMenu.Item>
              )}
              
              {notification.actionUrl && (
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none"
                  onClick={() => window.open(notification.actionUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="font-sofia-sans text-sm">Open</span>
                </DropdownMenu.Item>
              )}
              
              <DropdownMenu.Separator className="h-px bg-gray-5/20 my-1" />
              
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded cursor-pointer outline-none"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-sofia-sans text-sm">Delete</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}