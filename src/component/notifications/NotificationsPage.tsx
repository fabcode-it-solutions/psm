
"use client";

import React, { useState, useMemo } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Select from '@radix-ui/react-select';
import * as Dialog from '@radix-ui/react-dialog';
import { 
  Bell, 

  CheckCheck, 
  Trash2, 
  Filter, 
  Search,
  ChevronDown,
  RefreshCw,
  Settings,
  X,
  ArrowLeft,
  TrendingUp,
  Clock,
  Archive
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NotificationItem } from './NotificationItem';

export default function NotificationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showMarkAllDialog, setShowMarkAllDialog] = useState(false);
  // const user = useSelector((state: RootState) => state.user.user)?.user;
  const {
    notifications,
    stats,
    loading,
    error,
    fetchNotifications,
    markAllAsRead,
    clearAllNotifications,
    pagination,
  } = useNotifications();

  const { isConnected } = useNotificationSocket();

  // Filter notifications based on search and filters
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Filter by tab
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (activeTab === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        n.message.toLowerCase().includes(query) ||
        (n.title && n.title.toLowerCase().includes(query)) ||
        n.type.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === selectedPriority);
    }

    return filtered;
  }, [notifications, activeTab, searchQuery, selectedCategory, selectedPriority]);

  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setShowMarkAllDialog(false);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setShowClearDialog(false);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  const handleLoadMore = () => {
    fetchNotifications({ 
      page: pagination.page + 1,
      limit: pagination.limit 
    });
  };

  // Quick stats calculations
  const quickStats = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayNotifications = notifications.filter(n => 
      new Date(n.createdAt).toDateString() === today.toDateString()
    );

    const urgentUnread = notifications.filter(n => 
      !n.isRead && n.priority === 'urgent'
    );

    return {
      today: todayNotifications.length,
      urgent: urgentUnread.length,
      categories: {
        marketplace: stats.byCategory?.marketplace || 0,
        social: stats.byCategory?.social || 0,
        system: stats.byCategory?.system || 0,
      }
    };
  }, [notifications, stats]);

  return (
    <div className="bg-dark-blue-cm/50">
      <div className="">
        {/* Back Navigation - Mobile */}
        <div className="flex items-center gap-4 sm:hidden">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-4 hover:text-light-100 hover:bg-gray-5/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-light-100 font-supreme">Notifications</h1>
        </div>

        {/* Header - Desktop */}
        <div className="hidden sm:flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-100/10 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-accent-100" />
            </div>
            <div>
              <h1 className="text-2xl font-audiowide text-light-100">Notifications</h1>
              <div className="flex items-center gap-6 text-sm text-gray-4 font-sofia-sans mt-1">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-accent-100 rounded-full"></div>
                  {stats.total} total
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  {stats.unread} unread
                </span>
                <span className={`flex items-center gap-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/notifications/settings"
              className="p-2 text-gray-4 hover:text-light-100 hover:bg-gray-5/10 rounded-lg transition-colors"
              title="Notification Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>

            <button
              onClick={()=>handleRefresh()}
              className="p-2 text-gray-4 hover:text-light-100 hover:bg-gray-5/10 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {stats.unread > 0 && (
              <button
                onClick={() => setShowMarkAllDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-accent-100/10 text-accent-100 rounded-lg hover:bg-accent-100/20 transition-colors font-sofia-sans text-sm"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}

            {stats.total > 0 && (
              <button
                onClick={() => setShowClearDialog(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors font-sofia-sans text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear all</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-5">
          <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-4 text-sm font-sofia-sans">Today</p>
                <p className="text-xl font-bold text-light-100 font-supreme">
                  {quickStats.today}
                </p>
              </div>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-4 text-sm font-sofia-sans">Urgent</p>
                <p className="text-xl font-bold text-light-100 font-supreme">
                  {quickStats.urgent}
                </p>
              </div>
              <div className="w-5 h-5 bg-red-500/20 rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-4 text-sm font-sofia-sans">Social</p>
                <p className="text-xl font-bold text-light-100 font-supreme">
                  {quickStats.categories.social}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
          </div>

          <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-4 text-sm font-sofia-sans">System</p>
                <p className="text-xl font-bold text-light-100 font-supreme">
                  {quickStats.categories.system}
                </p>
              </div>
              <Archive className="w-5 h-5 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-4" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-dark-100 border border-gray-5/20 rounded-lg text-light-100 placeholder-gray-4 focus:border-accent-100 focus:outline-none font-sofia-sans"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors
                ${showFilters ? 'text-accent-100 bg-accent-100/10' : 'text-gray-4 hover:text-light-100 hover:bg-gray-5/10'}
              `}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-4 mb-2 font-sofia-sans">
                        Category
                      </label>
                      <Select.Root value={selectedCategory} onValueChange={setSelectedCategory}>
                        <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-dark-blue-cm border border-gray-5/20 rounded text-light-100 text-sm">
                          <Select.Value />
                          <Select.Icon>
                            <ChevronDown className="w-4 h-4" />
                          </Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Content className="bg-dark-100 border border-gray-5/20 rounded-lg shadow-xl z-50">
                            <Select.Viewport className="p-1">
                              <Select.Item value="all" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                <Select.ItemText>All Categories</Select.ItemText>
                              </Select.Item>
                              <Select.Item value="marketplace" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                <Select.ItemText>Marketplace</Select.ItemText>
                              </Select.Item>
                              <Select.Item value="social" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                <Select.ItemText>Social</Select.ItemText>
                              </Select.Item>
                              <Select.Item value="system" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                <Select.ItemText>System</Select.ItemText>
                              </Select.Item>
                              <Select.Item value="account" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                <Select.ItemText>Account</Select.ItemText>
                              </Select.Item>
                            </Select.Viewport>
                          </Select.Content>
                        </Select.Portal>
                      </Select.Root>
                    </div>

                    {/* Priority Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-4 mb-2 font-sofia-sans">
                        Priority
                      </label>
                      <Select.Root value={selectedPriority} onValueChange={setSelectedPriority}>
                        <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-dark-blue-cm border border-gray-5/20 rounded text-light-100 text-sm">
                          <Select.Value />
                          <Select.Icon>
                            <ChevronDown className="w-4 h-4" />
                          </Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Content className="bg-dark-100 border border-gray-5/20 rounded-lg shadow-xl z-50">
                            <Select.Viewport className="p-1">
                              <Select.Item value="all" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                <Select.ItemText>All Priorities</Select.ItemText>
                              </Select.Item>
                              <Select.Item value="urgent" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                <Select.ItemText>🚨 Urgent</Select.ItemText>
                              </Select.Item>
                              <Select.Item value="high" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                <Select.ItemText>⚡ High</Select.ItemText>
                              </Select.Item>
                              <Select.Item value="normal" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                <Select.ItemText>📝 Normal</Select.ItemText>
                              </Select.Item>
                              <Select.Item value="low" className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none">
                                <Select.ItemText>💤 Low</Select.ItemText>
                              </Select.Item>
                            </Select.Viewport>
                          </Select.Content>
                        </Select.Portal>
                      </Select.Root>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                          setSelectedPriority('all');
                        }}
                        className="w-full px-4 py-2 text-gray-4 hover:text-accent-100 hover:bg-accent-100/10 rounded-lg transition-colors font-sofia-sans text-sm"
                      >
                        Clear filters
                      </button>
                    </div>
                  </div>

                  {/* Active Filters Summary */}
                  {(searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all') && (
                    <div className="mt-4 pt-4 border-t border-gray-5/20">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-gray-4 font-sofia-sans">Active filters:</span>
                        {searchQuery && (
                          <span className="px-2 py-1 bg-accent-100/20 text-accent-100 rounded font-sofia-sans">
                            Search: &quot;{searchQuery}&quot;
                          </span>
                        )}
                        {selectedCategory !== 'all' && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded font-sofia-sans">
                            Category: {selectedCategory}
                          </span>
                        )}
                        {selectedPriority !== 'all' && (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded font-sofia-sans">
                            Priority: {selectedPriority}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex items-center gap-8 border-b border-gray-5/20 overflow-x-auto scrollbar-hide">
            <Tabs.Trigger
              value="all"
              className="pb-3 px-1 text-gray-4 hover:text-light-100 data-[state=active]:text-accent-100 data-[state=active]:border-b-2 data-[state=active]:border-accent-100 font-sofia-sans transition-colors whitespace-nowrap"
            >
              All ({stats.total})
            </Tabs.Trigger>
            <Tabs.Trigger
              value="unread"
              className="pb-3 px-1 text-gray-4 hover:text-light-100 data-[state=active]:text-accent-100 data-[state=active]:border-b-2 data-[state=active]:border-accent-100 font-sofia-sans transition-colors whitespace-nowrap"
            >
              Unread ({stats.unread})
            </Tabs.Trigger>
            <Tabs.Trigger
              value="read"
              className="pb-3 px-1 text-gray-4 hover:text-light-100 data-[state=active]:text-accent-100 data-[state=active]:border-b-2 data-[state=active]:border-accent-100 font-sofia-sans transition-colors whitespace-nowrap"
            >
              Read ({stats.total - stats.unread})
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value={activeTab} className="mt-6">
            {/* Notifications List */}
            <div className="bg-dark-100 border border-gray-5/20 rounded-xl overflow-hidden">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-accent-100 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-4 font-sofia-sans">Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-light-100 font-bold mb-2 font-supreme">Error loading notifications</h3>
                  <p className="text-gray-4 font-sofia-sans mb-4">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 transition-colors font-sofia-sans"
                  >
                    Try again
                  </button>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-16 h-16 text-gray-4 mx-auto mb-6" />
                  <h3 className="text-xl text-light-100 font-bold mb-3 font-supreme">
                    {searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all'
                      ? 'No matching notifications'
                      : activeTab === 'unread'
                      ? 'You\'re all caught up!'
                      : 'No notifications yet'
                    }
                  </h3>
                  <p className="text-gray-4 font-sofia-sans max-w-md mx-auto">
                    {searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all'
                      ? 'Try adjusting your filters to see more results.'
                      : activeTab === 'unread'
                      ? "Great job staying on top of things. New notifications will appear here when you receive them."
                      : 'Notifications about your account, activities, and updates will appear here.'
                    }
                  </p>
                </div>
              ) : (
                <div>
                  <div className="divide-y divide-gray-5/10">
                    <AnimatePresence>
                      {filteredNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.15 }}
                          className="group"
                        >
                          <NotificationItem
                            notification={notification}
                            onRead={() => {}}
                            onDelete={() => {}}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Load More */}
                  {pagination?.hasNext && (
                    <div className="p-6 border-t border-gray-5/20 bg-gray-5/5">
                      <button
                        onClick={()=>handleLoadMore()}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-dark-blue-cm border border-gray-5/20 rounded-lg text-light-100 hover:bg-gray-5/10 transition-colors font-sofia-sans disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-accent-100 border-t-transparent rounded-full animate-spin"></div>
                            Loading more...
                          </div>
                        ) : (
                          `Load more notifications (${pagination.total - filteredNotifications.length} remaining)`
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Tabs.Content>
        </Tabs.Root>

        {/* Floating Settings Button for Mobile */}
        <div className="fixed bottom-6 right-6 sm:hidden">
          <Link
            href="/notifications/settings"
            className="flex items-center justify-center w-14 h-14 bg-accent-100 text-dark-100 rounded-full shadow-lg hover:bg-accent-100/90 transition-all duration-200 hover:scale-105"
          >
            <Settings className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      {/* Mark All Read Dialog */}
      <Dialog.Root open={showMarkAllDialog} onOpenChange={setShowMarkAllDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-100 border border-gray-5/20 rounded-lg p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-lg font-bold text-light-100 mb-2 font-supreme">
              Mark all as read?
            </Dialog.Title>
            <Dialog.Description className="text-gray-4 mb-6 font-sofia-sans">
              This will mark {stats.unread} unread notifications as read. This action cannot be undone.
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-gray-4 hover:text-light-100 transition-colors font-sofia-sans">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleMarkAllRead}
                className="px-4 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 transition-colors font-sofia-sans font-medium"
              >
                Mark all read
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Clear All Dialog */}
      <Dialog.Root open={showClearDialog} onOpenChange={setShowClearDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-100 border border-gray-5/20 rounded-lg p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-lg font-bold text-light-100 mb-2 font-supreme">
              Clear all notifications?
            </Dialog.Title>
            <Dialog.Description className="text-gray-4 mb-6 font-sofia-sans">
              This will permanently delete all {stats.total} notifications. This action cannot be undone.
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-gray-4 hover:text-light-100 transition-colors font-sofia-sans">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-sofia-sans font-medium"
              >
                Clear all
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}