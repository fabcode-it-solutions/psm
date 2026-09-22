/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Select from '@radix-ui/react-select';
import * as Switch from '@radix-ui/react-switch';
import * as Dialog from '@radix-ui/react-dialog';
import { 
  Send, 
  Users, 
  User, 
  Search, 
  ChevronDown, 
  Check, 
  X, 
  Bell,
  AlertTriangle,
  Filter,
  Eye,
  MessageSquare,
  Mail,
  Smartphone,
  UserCheck,
  Target,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApiRequest } from '@/hooks/useApiRequest';
// import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Image from 'next/image';

// Types
interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  username?: string;
  profileImage?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  userIds: number[];
  users?: User[];
}

// Form schema
const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  type: z.string().min(1, 'Type is required'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  actionUrl: z.string().url().optional().or(z.literal('')),
  actionLabel: z.string().max(100).optional(),
  
  // Delivery options
  channels: z.object({
    inApp: z.boolean(),
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
  
  // Scheduling
  scheduled: z.boolean(),
  scheduleDate: z.string().optional(),
  scheduleTime: z.string().optional(),
  
  // Targeting
  targetType: z.enum(['individual', 'group', 'all', 'filtered']),
  userIds: z.array(z.number()).optional(),
  groupIds: z.array(z.string()).optional(),
  filters: z.object({
    role: z.string().optional(),
    verified: z.boolean().optional(),
    registeredAfter: z.string().optional(),
    registeredBefore: z.string().optional(),
  }).optional(),
  
  // Expiry
  expires: z.boolean(),
  expiresAt: z.string().optional(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

const NOTIFICATION_TYPES = [
  { value: 'system_alert', label: 'System Alert', category: 'system' },
  { value: 'maintenance_scheduled', label: 'Maintenance Notice', category: 'system' },
  { value: 'feature_announcement', label: 'Feature Announcement', category: 'system' },
  { value: 'policy_update', label: 'Policy Update', category: 'system' },
  { value: 'promotional', label: 'Promotional', category: 'promotional' },
  { value: 'account_update', label: 'Account Update', category: 'account' },
  { value: 'security_alert', label: 'Security Alert', category: 'account' },
  { value: 'custom', label: 'Custom Notification', category: 'admin' },
];

const PREDEFINED_GROUPS = [
  { id: 'all_users', name: 'All Users', description: 'Every registered user' },
  { id: 'verified_users', name: 'Verified Users', description: 'Users with verified accounts' },
  { id: 'admin_users', name: 'Administrators', description: 'Admin and moderator users' },
  { id: 'new_users', name: 'New Users', description: 'Users registered in last 30 days' },
  { id: 'active_users', name: 'Active Users', description: 'Users active in last 7 days' },
];

export default function AdminSendNotificationsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [previewData, setPreviewData] = useState<NotificationFormData | null>(null);

  const { request, loading } = useApiRequest<{
    success:boolean;
data:User[];
  }>();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
      type: 'custom',
      category: 'admin',
      priority: 'normal',
      actionUrl: '',
      actionLabel: '',
      channels: {
        inApp: true,
        email: false,
        push: false,
        sms: false,
      },
      scheduled: false,
      targetType: 'individual',
      userIds: [],
      groupIds: [],
      expires: false,
    },
  });

  const watchedValues = watch();

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await request({
          url: '/api/admin/users',
          options: { method: 'GET' },
        });
        
        if (response?.success) {
          setUsers(response.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search
  useEffect(() => {
    if (!userSearch) {
      setFilteredUsers(users);
      return;
    }

    const query = userSearch.toLowerCase();
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(query) ||
      (user.firstName && user.firstName.toLowerCase().includes(query)) ||
      (user.lastName && user.lastName.toLowerCase().includes(query)) ||
      (user.username && user.username.toLowerCase().includes(query))
    );
    setFilteredUsers(filtered);
  }, [userSearch, users]);

  // Handle form submission
  const onSubmit = async (data: NotificationFormData) => {
    setPreviewData(data);
    setShowPreview(true);
  };

  const handleSendNotification = async () => {
    if (!previewData) return;

    try {
      let targetUserIds: number[] = [];

      // Determine target users based on type
      switch (previewData.targetType) {
        case 'individual':
          targetUserIds = selectedUsers;
          break;
        case 'group':
          // Handle predefined groups
          if (previewData.groupIds?.includes('all_users')) {
            targetUserIds = users.map(u => u.id);
          } else if (previewData.groupIds?.includes('verified_users')) {
            targetUserIds = users.filter(u => u.isVerified).map(u => u.id);
          } else if (previewData.groupIds?.includes('admin_users')) {
            targetUserIds = users.filter(u => u.role === 'admin' || u.role === 'moderator').map(u => u.id);
          }
          // Add more group logic as needed
          break;
        case 'all':
          targetUserIds = users.map(u => u.id);
          break;
        case 'filtered':
          let filtered = users;
          if (previewData.filters?.role) {
            filtered = filtered.filter(u => u.role === previewData.filters?.role);
          }
          if (previewData.filters?.verified !== undefined) {
            filtered = filtered.filter(u => u.isVerified === previewData.filters?.verified);
          }
          // Add more filter logic
          targetUserIds = filtered.map(u => u.id);
          break;
      }

      // Create notifications for each user
      const notifications = targetUserIds.map(userId => ({
        userId,
        type: previewData.type,
        title: previewData.title,
        message: previewData.message,
        category: previewData.category,
        priority: previewData.priority,
        actionUrl: previewData.actionUrl || undefined,
        actionLabel: previewData.actionLabel || undefined,
        expiresAt: previewData.expires && previewData.expiresAt 
          ? new Date(previewData.expiresAt).toISOString() 
          : undefined,
      }));

      const response = await request({
        url: '/api/notifications',
        options: {
          method: 'POST',
          body: { notifications },
        },
      });

      if (response?.success) {
        toast.success(`Notification sent to ${targetUserIds.length} users`);
        reset();
        setSelectedUsers([]);
        setShowPreview(false);
        setShowConfirmDialog(false);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const getTargetUserCount = () => {
    switch (watchedValues.targetType) {
      case 'individual':
        return selectedUsers.length;
      case 'all':
        return users.length;
      case 'group':
        if (watchedValues.groupIds?.includes('all_users')) return users.length;
        if (watchedValues.groupIds?.includes('verified_users')) return users.filter(u => u.isVerified).length;
        if (watchedValues.groupIds?.includes('admin_users')) return users.filter(u => u.role === 'admin' || u.role === 'moderator').length;
        return 0;
      default:
        return 0;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-100/10 rounded-lg flex items-center justify-center">
            <Send className="w-5 h-5 text-accent-100" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-light-100 font-supreme">Send Notifications</h1>
            <p className="text-gray-4 font-sofia-sans">
              Send notifications to users individually or in groups
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Notification Content */}
        <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-6">
          <h2 className="text-lg font-bold text-light-100 font-supreme mb-4">Notification Content</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-light-100 mb-2 font-sofia-sans">
                Title *
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter notification title"
                    className="w-full px-3 py-2 bg-dark-blue-cm border border-gray-5/20 rounded-lg text-light-100 placeholder-gray-4 focus:border-accent-100 focus:outline-none font-sofia-sans"
                  />
                )}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 font-sofia-sans">{errors.title.message}</p>
              )}
            </div>

            {/* Message */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-light-100 mb-2 font-sofia-sans">
                Message *
              </label>
              <Controller
                name="message"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    placeholder="Enter notification message"
                    className="w-full px-3 py-2 bg-dark-blue-cm border border-gray-5/20 rounded-lg text-light-100 placeholder-gray-4 focus:border-accent-100 focus:outline-none resize-none font-sofia-sans"
                  />
                )}
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1 font-sofia-sans">{errors.message.message}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-light-100 mb-2 font-sofia-sans">
                Type *
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select.Root value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-dark-blue-cm border border-gray-5/20 rounded-lg text-light-100">
                      <Select.Value />
                      <Select.Icon>
                        <ChevronDown className="w-4 h-4" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="bg-dark-100 border border-gray-5/20 rounded-lg shadow-xl z-50">
                        <Select.Viewport className="p-1">
                          {NOTIFICATION_TYPES.map((type) => (
                            <Select.Item
                              key={type.value}
                              value={type.value}
                              className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none"
                            >
                              <Select.ItemText>{type.label}</Select.ItemText>
                              <Select.ItemIndicator className="ml-auto">
                                <Check className="w-4 h-4" />
                              </Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                )}
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-light-100 mb-2 font-sofia-sans">
                Priority *
              </label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select.Root value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-dark-blue-cm border border-gray-5/20 rounded-lg text-light-100">
                      <Select.Value />
                      <Select.Icon>
                        <ChevronDown className="w-4 h-4" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="bg-dark-100 border border-gray-5/20 rounded-lg shadow-xl z-50">
                        <Select.Viewport className="p-1">
                          <Select.Item value="low" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                            <Select.ItemText>💤 Low</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="normal" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                            <Select.ItemText>📝 Normal</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="high" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                            <Select.ItemText>⚡ High</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="urgent" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                            <Select.ItemText>🚨 Urgent</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                )}
              />
            </div>

            {/* Action URL */}
            <div>
              <label className="block text-sm font-medium text-light-100 mb-2 font-sofia-sans">
                Action URL (Optional)
              </label>
              <Controller
                name="actionUrl"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="url"
                    placeholder="https://example.com/action"
                    className="w-full px-3 py-2 bg-dark-blue-cm border border-gray-5/20 rounded-lg text-light-100 placeholder-gray-4 focus:border-accent-100 focus:outline-none font-sofia-sans"
                  />
                )}
              />
              {errors.actionUrl && (
                <p className="text-red-500 text-sm mt-1 font-sofia-sans">{errors.actionUrl.message}</p>
              )}
            </div>

            {/* Action Label */}
            <div>
              <label className="block text-sm font-medium text-light-100 mb-2 font-sofia-sans">
                Action Label (Optional)
              </label>
              <Controller
                name="actionLabel"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="View Details"
                    className="w-full px-3 py-2 bg-dark-blue-cm border border-gray-5/20 rounded-lg text-light-100 placeholder-gray-4 focus:border-accent-100 focus:outline-none font-sofia-sans"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Target Users */}
        <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-6">
          <h2 className="text-lg font-bold text-light-100 font-supreme mb-4">Target Users</h2>
          
          {/* Target Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-light-100 mb-3 font-sofia-sans">
              Send to:
            </label>
            
            <Controller
              name="targetType"
              control={control}
              render={({ field }) => (
                <Tabs.Root value={field.value} onValueChange={field.onChange}>
                  <Tabs.List className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-dark-blue-cm p-1 rounded-lg">
                    <Tabs.Trigger
                      value="individual"
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-sofia-sans data-[state=active]:bg-accent-100 data-[state=active]:text-dark-100 text-gray-4 hover:text-light-100 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Individual
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="group"
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-sofia-sans data-[state=active]:bg-accent-100 data-[state=active]:text-dark-100 text-gray-4 hover:text-light-100 transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Group
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="all"
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-sofia-sans data-[state=active]:bg-accent-100 data-[state=active]:text-dark-100 text-gray-4 hover:text-light-100 transition-colors"
                    >
                      <Target className="w-4 h-4" />
                      All Users
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="filtered"
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-sofia-sans data-[state=active]:bg-accent-100 data-[state=active]:text-dark-100 text-gray-4 hover:text-light-100 transition-colors"
                    >
                      <Filter className="w-4 h-4" />
                      Filtered
                    </Tabs.Trigger>
                  </Tabs.List>

                  {/* Individual Users Tab */}
                  <Tabs.Content value="individual" className="mt-4">
                    <div className="space-y-4">
                      {/* User Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-4" />
                        <input
                          type="text"
                          placeholder="Search users by name, email, or username..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-dark-blue-cm border border-gray-5/20 rounded-lg text-light-100 placeholder-gray-4 focus:border-accent-100 focus:outline-none font-sofia-sans"
                        />
                      </div>

                      {/* Selected Users */}
                      {selectedUsers.length > 0 && (
                        <div className="border border-gray-5/20 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-light-100 font-sofia-sans">
                              Selected Users ({selectedUsers.length})
                            </h3>
                            <button
                              type="button"
                              onClick={() => setSelectedUsers([])}
                              className="text-red-500 hover:text-red-400 text-sm font-sofia-sans"
                            >
                              Clear all
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedUsers.map(userId => {
                              const user = users.find(u => u.id === userId);
                              if (!user) return null;
                              
                              return (
                                <div
                                  key={userId}
                                  className="flex items-center gap-2 px-3 py-1 bg-accent-100/20 text-accent-100 rounded-full text-sm font-sofia-sans"
                                >
                                  <span>{user.firstName || user.email}</span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedUsers(prev => prev.filter(id => id !== userId))}
                                    className="hover:text-red-400"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* User List */}
                      <div className="border border-gray-5/20 rounded-lg max-h-64 overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                          <div className="p-4 text-center text-gray-4 font-sofia-sans">
                            No users found
                          </div>
                        ) : (
                          filteredUsers.map(user => (
                            <div
                              key={user.id}
                              className={`
                                flex items-center justify-between p-3 border-b border-gray-5/10 last:border-b-0 hover:bg-gray-5/5 cursor-pointer
                                ${selectedUsers.includes(user.id) ? 'bg-accent-100/10' : ''}
                              `}
                              onClick={() => {
                                setSelectedUsers(prev => 
                                  prev.includes(user.id) 
                                    ? prev.filter(id => id !== user.id)
                                    : [...prev, user.id]
                                );
                              }}
                            >
                              <div className="flex items-center gap-3">
                                {user.profileImage ? (
                                  <Image
                                    src={user.profileImage}
                                    alt={user.firstName || user.email}
                                    className="w-8 h-8 rounded-full"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-gray-5/20 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-4" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-light-100 font-medium font-sofia-sans">
                                    {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-gray-4 font-sofia-sans">
                                    <span>{user.email}</span>
                                    {user.isVerified && (
                                      <span className="flex items-center gap-1 text-green-400">
                                        <UserCheck className="w-3 h-3" />
                                        Verified
                                      </span>
                                    )}
                                    <span className="text-blue-400">{user.role}</span>
                                  </div>
                                </div>
                              </div>
                              {selectedUsers.includes(user.id) && (
                                <Check className="w-5 h-5 text-accent-100" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </Tabs.Content>

                  {/* Group Selection Tab */}
                  <Tabs.Content value="group" className="mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {PREDEFINED_GROUPS.map(group => (
                        <div
                          key={group.id}
                          className={`
                            border border-gray-5/20 rounded-lg p-4 cursor-pointer transition-colors
                            ${watchedValues.groupIds?.includes(group.id) 
                              ? 'border-accent-100 bg-accent-100/10' 
                              : 'hover:border-gray-4'
                            }
                          `}
                          onClick={() => {
                            const currentGroups = watchedValues.groupIds || [];
                            const newGroups = currentGroups.includes(group.id)
                              ? currentGroups.filter(id => id !== group.id)
                              : [...currentGroups, group.id];
                            setValue('groupIds', newGroups);
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-light-100 font-sofia-sans">{group.name}</h3>
                            {watchedValues.groupIds?.includes(group.id) && (
                              <Check className="w-5 h-5 text-accent-100" />
                            )}
                          </div>
                          <p className="text-sm text-gray-4 font-sofia-sans">{group.description}</p>
                        </div>
                      ))}
                    </div>
                  </Tabs.Content>

                  {/* All Users Tab */}
                  <Tabs.Content value="all" className="mt-4">
                    <div className="border border-gray-5/20 rounded-lg p-6 text-center">
                      <Target className="w-12 h-12 text-accent-100 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-light-100 font-supreme mb-2">
                        Send to All Users
                      </h3>
                      <p className="text-gray-4 font-sofia-sans">
                        This notification will be sent to all {users.length} registered users.
                      </p>
                    </div>
                  </Tabs.Content>

                  {/* Filtered Users Tab */}
                  <Tabs.Content value="filtered" className="mt-4">
                    <div className="space-y-4">
                      <p className="text-gray-4 font-sofia-sans">
                        Apply filters to target specific user groups
                      </p>
                      {/* Add filter controls here */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-light-100 mb-2 font-sofia-sans">
                            Role
                          </label>
                          <Controller
                            name="filters.role"
                            control={control}
                            render={({ field }) => (
                              <Select.Root value={field.value || ''} onValueChange={field.onChange}>
                                <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-dark-blue-cm border border-gray-5/20 rounded-lg text-light-100">
                                  <Select.Value placeholder="Select role" />
                                  <Select.Icon>
                                    <ChevronDown className="w-4 h-4" />
                                  </Select.Icon>
                                </Select.Trigger>
                                <Select.Portal>
                                  <Select.Content className="bg-dark-100 border border-gray-5/20 rounded-lg shadow-xl z-50">
                                    <Select.Viewport className="p-1">
                                      <Select.Item value="" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                        <Select.ItemText>All Roles</Select.ItemText>
                                      </Select.Item>
                                      <Select.Item value="user" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                        <Select.ItemText>User</Select.ItemText>
                                      </Select.Item>
                                      <Select.Item value="admin" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                        <Select.ItemText>Admin</Select.ItemText>
                                      </Select.Item>
                                      <Select.Item value="moderator" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                        <Select.ItemText>Moderator</Select.ItemText>
                                      </Select.Item>
                                    </Select.Viewport>
                                  </Select.Content>
                                </Select.Portal>
                              </Select.Root>
                            )}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-light-100 mb-2 font-sofia-sans">
                            Verification Status
                          </label>
                          <Controller
                            name="filters.verified"
                            control={control}
                            render={({ field }) => (
                              <Select.Root 
                                value={field.value === undefined ? '' : field.value.toString()} 
                                onValueChange={(value) => field.onChange(value === '' ? undefined : value === 'true')}
                              >
                                <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-dark-blue-cm border border-gray-5/20 rounded-lg text-light-100">
                                  <Select.Value placeholder="Select status" />
                                  <Select.Icon>
                                    <ChevronDown className="w-4 h-4" />
                                  </Select.Icon>
                                </Select.Trigger>
                                <Select.Portal>
                                  <Select.Content className="bg-dark-100 border border-gray-5/20 rounded-lg shadow-xl z-50">
                                    <Select.Viewport className="p-1">
                                      <Select.Item value="" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                        <Select.ItemText>All Users</Select.ItemText>
                                      </Select.Item>
                                      <Select.Item value="true" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                        <Select.ItemText>Verified Only</Select.ItemText>
                                      </Select.Item>
                                      <Select.Item value="false" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                        <Select.ItemText>Unverified Only</Select.ItemText>
                                      </Select.Item>
                                    </Select.Viewport>
                                  </Select.Content>
                                </Select.Portal>
                              </Select.Root>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </Tabs.Content>
                </Tabs.Root>
              )}
            />
          </div>

          {/* Target Summary */}
          <div className="bg-dark-blue-cm border border-gray-5/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-accent-100">
              <Target className="w-5 h-5" />
              <span className="font-medium font-sofia-sans">
                Target: {getTargetUserCount()} users
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Options */}
        <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-6">
          <h2 className="text-lg font-bold text-light-100 font-supreme mb-4">Delivery Options</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* In-App */}
            <div className="flex items-center justify-between p-3 border border-gray-5/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-4" />
                <span className="text-sm font-sofia-sans text-light-100">In-App</span>
              </div>
              <Controller
                name="channels.inApp"
                control={control}
                render={({ field }) => (
                  <Switch.Root
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="w-11 h-6 bg-gray-5/20 rounded-full data-[state=checked]:bg-accent-100 transition-colors"
                  >
                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
                  </Switch.Root>
                )}
              />
            </div>

            {/* Email */}
            <div className="flex items-center justify-between p-3 border border-gray-5/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-4" />
                <span className="text-sm font-sofia-sans text-light-100">Email</span>
              </div>
              <Controller
                name="channels.email"
                control={control}
                render={({ field }) => (
                  <Switch.Root
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="w-11 h-6 bg-gray-5/20 rounded-full data-[state=checked]:bg-accent-100 transition-colors"
                  >
                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
                  </Switch.Root>
                )}
              />
            </div>

            {/* Push */}
            <div className="flex items-center justify-between p-3 border border-gray-5/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gray-4" />
                <span className="text-sm font-sofia-sans text-light-100">Push</span>
              </div>
              <Controller
                name="channels.push"
                control={control}
                render={({ field }) => (
                  <Switch.Root
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="w-11 h-6 bg-gray-5/20 rounded-full data-[state=checked]:bg-accent-100 transition-colors"
                  >
                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
                  </Switch.Root>
                )}
              />
            </div>

            {/* SMS */}
            <div className="flex items-center justify-between p-3 border border-gray-5/20 rounded-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-4" />
                <span className="text-sm font-sofia-sans text-light-100">SMS</span>
              </div>
              <Controller
                name="channels.sms"
                control={control}
                render={({ field }) => (
                  <Switch.Root
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="w-11 h-6 bg-gray-5/20 rounded-full data-[state=checked]:bg-accent-100 transition-colors"
                  >
                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
                  </Switch.Root>
                )}
              />
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-6">
          <h2 className="text-lg font-bold text-light-100 font-supreme mb-4">Advanced Options</h2>
          
          <div className="space-y-4">
            {/* Scheduling */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-light-100 font-sofia-sans">Schedule Notification</h3>
                <p className="text-sm text-gray-4 font-sofia-sans">Send at a specific date and time</p>
              </div>
              <Controller
                name="scheduled"
                control={control}
                render={({ field }) => (
                  <Switch.Root
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="w-11 h-6 bg-gray-5/20 rounded-full data-[state=checked]:bg-accent-100 transition-colors"
                  >
                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
                  </Switch.Root>
                )}
              />
            </div>

            {watchedValues.scheduled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-accent-100/20">
                <div>
                  <label className="block text-sm font-medium text-light-100 mb-2 font-sofia-sans">
                    Date
                  </label>
                  <Controller
                    name="scheduleDate"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="date"
                        className="w-full px-3 py-2 bg-dark-blue-cm border border-gray-5/20 rounded-lg text-light-100 focus:border-accent-100 focus:outline-none font-sofia-sans"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-100 mb-2 font-sofia-sans">
                    Time
                  </label>
                  <Controller
                    name="scheduleTime"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="time"
                        className="w-full px-3 py-2 bg-dark-blue-cm border border-gray-5/20 rounded-lg text-light-100 focus:border-accent-100 focus:outline-none font-sofia-sans"
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {/* Expiry */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-light-100 font-sofia-sans">Auto-Expire</h3>
                <p className="text-sm text-gray-4 font-sofia-sans">Automatically delete after a certain date</p>
              </div>
              <Controller
                name="expires"
                control={control}
                render={({ field }) => (
                  <Switch.Root
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="w-11 h-6 bg-gray-5/20 rounded-full data-[state=checked]:bg-accent-100 transition-colors"
                  >
                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
                  </Switch.Root>
                )}
              />
            </div>

            {watchedValues.expires && (
              <div className="pl-4 border-l-2 border-accent-100/20">
                <label className="block text-sm font-medium text-light-100 mb-2 font-sofia-sans">
                  Expires At
                </label>
                <Controller
                  name="expiresAt"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="datetime-local"
                      className="w-full px-3 py-2 bg-dark-blue-cm border border-gray-5/20 rounded-lg text-light-100 focus:border-accent-100 focus:outline-none font-sofia-sans"
                    />
                  )}
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-3 text-gray-4 hover:text-light-100 transition-colors font-sofia-sans"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={loading || getTargetUserCount() === 0}
            className="flex items-center gap-2 px-6 py-3 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 transition-colors font-sofia-sans font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            Preview & Send
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      <Dialog.Root open={showPreview} onOpenChange={setShowPreview}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-100 border border-gray-5/20 rounded-lg p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-bold text-light-100 font-supreme">
                Preview Notification
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-4 hover:text-light-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            {previewData && (
              <div className="space-y-6">
                {/* Notification Preview */}
                <div className="border border-gray-5/20 rounded-lg p-4 bg-dark-blue-cm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-accent-100/20 rounded-full flex items-center justify-center">
                      <Bell className="w-4 h-4 text-accent-100" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-light-100 mb-1 font-sofia-sans">
                        {previewData.title}
                      </h3>
                      <p className="text-light-200 text-sm mb-2 font-sofia-sans">
                        {previewData.message}
                      </p>
                      {previewData.actionLabel && (
                        <button className="text-accent-100 text-sm font-medium font-sofia-sans">
                          {previewData.actionLabel}
                        </button>
                      )}
                    </div>
                    <div className={`
                      px-2 py-1 rounded-full text-xs font-sofia-sans
                      ${previewData.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                        previewData.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        previewData.priority === 'normal' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-5/20 text-gray-4'
                      }
                    `}>
                      {previewData.priority}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-4 font-sofia-sans">Type:</span>
                    <span className="ml-2 text-light-100 font-sofia-sans">
                      {NOTIFICATION_TYPES.find(t => t.value === previewData.type)?.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-4 font-sofia-sans">Target:</span>
                    <span className="ml-2 text-light-100 font-sofia-sans">
                      {getTargetUserCount()} users
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-4 font-sofia-sans">Channels:</span>
                    <span className="ml-2 text-light-100 font-sofia-sans">
                      {Object.entries(previewData.channels)
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        .filter(([_, enabled]) => enabled)
                        .map(([channel]) => channel)
                        .join(', ')
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-4 font-sofia-sans">Delivery:</span>
                    <span className="ml-2 text-light-100 font-sofia-sans">
                      {previewData.scheduled ? 'Scheduled' : 'Immediate'}
                    </span>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-400 mb-1 font-sofia-sans">
                      Confirm before sending
                    </h4>
                    <p className="text-orange-300 text-sm font-sofia-sans">
                      This notification will be sent to {getTargetUserCount()} users and cannot be recalled once sent.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Dialog.Close asChild>
                    <button className="px-4 py-2 text-gray-4 hover:text-light-100 transition-colors font-sofia-sans">
                      Back to Edit
                    </button>
                  </Dialog.Close>
                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 transition-colors font-sofia-sans font-medium"
                  >
                    <Send className="w-4 h-4" />
                    Send Notification
                  </button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Confirmation Dialog */}
      <Dialog.Root open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-100 border border-gray-5/20 rounded-lg p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-lg font-bold text-light-100 mb-2 font-supreme">
              Send Notification?
            </Dialog.Title>
            <Dialog.Description className="text-gray-4 mb-6 font-sofia-sans">
              Are you sure you want to send this notification to {getTargetUserCount()} users? This action cannot be undone.
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-gray-4 hover:text-light-100 transition-colors font-sofia-sans">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleSendNotification}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 transition-colors font-sofia-sans font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-dark-100 border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Now
                  </>
                )}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}