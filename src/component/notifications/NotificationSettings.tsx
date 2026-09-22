"use client";

import React, { useState, useEffect } from 'react';
import * as Switch from '@radix-ui/react-switch';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check, Bell, Mail, Smartphone, MessageSquare, Save } from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import toast from 'react-hot-toast';

interface NotificationSetting {
  id: number;
  userId: number;
  notificationType: string;
  inApp: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly' | 'never';
  preferredTime?: string;
  timezone: string;
}

interface NotificationSettingsResponse {
  success: boolean;
  data: NotificationSetting[];
}

const NOTIFICATION_TYPES = [
  {
    category: 'Marketplace',
    types: [
      { key: 'new_listing_added', label: 'New listings matching your interests', description: 'Get notified when new listings match your saved searches' },
      { key: 'offer_received', label: 'Offers received', description: 'Someone made an offer on your listing' },
      { key: 'offer_accepted', label: 'Offers accepted', description: 'Your offer was accepted by the seller' },
      { key: 'offer_rejected', label: 'Offers rejected', description: 'Your offer was rejected by the seller' },
      { key: 'price_drop', label: 'Price drops', description: 'Items in your wishlist have dropped in price' },
      { key: 'back_in_stock', label: 'Back in stock', description: 'Out of stock items are available again' },
    ],
  },
  {
    category: 'Social',
    types: [
      { key: 'new_follower', label: 'New followers', description: 'Someone started following you' },
      { key: 'build_liked', label: 'Build likes', description: 'Someone liked your build' },
      { key: 'build_commented', label: 'Build comments', description: 'Someone commented on your build' },
      { key: 'mentioned', label: 'Mentions', description: 'You were mentioned in a comment or post' },
    ],
  },
  {
    category: 'Account',
    types: [
      { key: 'account_verified', label: 'Account verification', description: 'Account verification status updates' },
      { key: 'password_changed', label: 'Password changes', description: 'Your password was changed' },
      { key: 'login_from_new_device', label: 'New device login', description: 'Login detected from a new device' },
      { key: 'payment_received', label: 'Payments received', description: 'You received a payment' },
      { key: 'payment_failed', label: 'Payment failures', description: 'A payment attempt failed' },
    ],
  },
  {
    category: 'System',
    types: [
      { key: 'system_alert', label: 'System alerts', description: 'Important system notifications' },
      { key: 'maintenance_scheduled', label: 'Maintenance notices', description: 'Scheduled maintenance notifications' },
      { key: 'feature_announcement', label: 'New features', description: 'Announcements about new features' },
      { key: 'policy_update', label: 'Policy updates', description: 'Terms of service and policy changes' },
    ],
  },
];

const FREQUENCY_OPTIONS = [
  { value: 'instant', label: 'Instantly' },
  { value: 'hourly', label: 'Hourly digest' },
  { value: 'daily', label: 'Daily digest' },
  { value: 'weekly', label: 'Weekly digest' },
  { value: 'never', label: 'Never' },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour}:00` };
});

export function NotificationSettings() {
  const [settings, setSettings] = useState<{ [key: string]: NotificationSetting }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { request } = useApiRequest<NotificationSettingsResponse>();

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const response = await request({
          url: '/api/notifications/settings',
          options: { method: 'GET' },
        });

        if (response?.success && response.data) {
          const settingsMap: { [key: string]: NotificationSetting } = {};
          response.data.forEach(setting => {
            settingsMap[setting.notificationType] = setting;
          });
          setSettings(settingsMap);
        }
      } catch (error) {
        console.error('Failed to load notification settings:', error);
        toast.error('Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [request]);

  const getSettingForType = (type: string): NotificationSetting => {
    return settings[type] || {
      id: 0,
      userId: 0,
      notificationType: type,
      inApp: true,
      email: true,
      push: true,
      sms: false,
      frequency: 'instant',
      timezone: 'UTC',
    };
  };

  const updateSetting = (type: string, updates: Partial<NotificationSetting>) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...getSettingForType(type),
        ...updates,
      },
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const settingsToSave = Object.values(settings);
      
      const response = await request({
        url: '/api/notifications/settings',
        options: {
          method: 'PUT',
          body: { settings: settingsToSave },
        },
      });

      if (response?.success) {
        toast.success('Notification settings saved');
        setHasChanges(false);
      } else {
        // throw new Error(response || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-5/10 rounded animate-pulse"></div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-5/10 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-100/10 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-accent-100" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-light-100 font-supreme">Notification Settings</h1>
            <p className="text-gray-4 font-sofia-sans">
              Manage how and when you receive notifications
            </p>
          </div>
        </div>

        {hasChanges && (
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 transition-colors font-sofia-sans font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Settings */}
      <div className="space-y-8">
        {NOTIFICATION_TYPES.map((category) => (
          <div key={category.category} className="space-y-4">
            {/* Category Header */}
            <h2 className="text-lg font-bold text-light-100 font-supreme border-b border-gray-5/20 pb-2">
              {category.category}
            </h2>

            {/* Category Settings */}
            <div className="space-y-4">
              {category.types.map((notificationType) => {
                const setting = getSettingForType(notificationType.key);
                
                return (
                  <div
                    key={notificationType.key}
                    className="bg-dark-100 border border-gray-5/20 rounded-lg p-6"
                  >
                    <div className="space-y-4">
                      {/* Notification Type Info */}
                      <div>
                        <h3 className="text-light-100 font-semibold font-sofia-sans mb-1">
                          {notificationType.label}
                        </h3>
                        <p className="text-gray-4 text-sm font-sofia-sans">
                          {notificationType.description}
                        </p>
                      </div>

                      {/* Channel Toggles */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {/* In-App */}
                        <div className="flex items-center justify-between p-3 border border-gray-5/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-gray-4" />
                            <span className="text-sm font-sofia-sans text-light-100">In-App</span>
                          </div>
                          <Switch.Root
                            checked={setting.inApp}
                            onCheckedChange={(checked) => updateSetting(notificationType.key, { inApp: checked })}
                            className="w-11 h-6 bg-gray-5/20 rounded-full data-[state=checked]:bg-accent-100 transition-colors"
                          >
                            <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
                          </Switch.Root>
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between p-3 border border-gray-5/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-4" />
                            <span className="text-sm font-sofia-sans text-light-100">Email</span>
                          </div>
                          <Switch.Root
                            checked={setting.email}
                            onCheckedChange={(checked) => updateSetting(notificationType.key, { email: checked })}
                            className="w-11 h-6 bg-gray-5/20 rounded-full data-[state=checked]:bg-accent-100 transition-colors"
                          >
                            <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
                          </Switch.Root>
                        </div>

                        {/* Push */}
                        <div className="flex items-center justify-between p-3 border border-gray-5/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-gray-4" />
                            <span className="text-sm font-sofia-sans text-light-100">Push</span>
                          </div>
                          <Switch.Root
                            checked={setting.push}
                            onCheckedChange={(checked) => updateSetting(notificationType.key, { push: checked })}
                            className="w-11 h-6 bg-gray-5/20 rounded-full data-[state=checked]:bg-accent-100 transition-colors"
                          >
                            <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
                          </Switch.Root>
                        </div>

                        {/* SMS */}
                        <div className="flex items-center justify-between p-3 border border-gray-5/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-4" />
                            <span className="text-sm font-sofia-sans text-light-100">SMS</span>
                          </div>
                          <Switch.Root
                            checked={setting.sms}
                            onCheckedChange={(checked) => updateSetting(notificationType.key, { sms: checked })}
                            className="w-11 h-6 bg-gray-5/20 rounded-full data-[state=checked]:bg-accent-100 transition-colors"
                          >
                            <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
                          </Switch.Root>
                        </div>
                      </div>

                      {/* Frequency Settings */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-4 mb-2 font-sofia-sans">
                            Frequency
                          </label>
                          <Select.Root
                            value={setting.frequency}
                            onValueChange={(value) => updateSetting(notificationType.key, { frequency: value as 'instant' | 'hourly' | 'daily' | 'weekly' | 'never' })}
                          >
                            <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-dark-blue-cm border border-gray-5/20 rounded text-light-100 text-sm">
                              <Select.Value />
                              <Select.Icon>
                                <ChevronDown className="w-4 h-4" />
                              </Select.Icon>
                            </Select.Trigger>
                            <Select.Portal>
                              <Select.Content className="bg-dark-100 border border-gray-5/20 rounded-lg shadow-xl z-50">
                                <Select.Viewport className="p-1">
                                  {FREQUENCY_OPTIONS.map((option) => (
                                    <Select.Item
                                      key={option.value}
                                      value={option.value}
                                      className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none"
                                    >
                                      <Select.ItemText>{option.label}</Select.ItemText>
                                      <Select.ItemIndicator className="ml-auto">
                                        <Check className="w-4 h-4" />
                                      </Select.ItemIndicator>
                                    </Select.Item>
                                  ))}
                                </Select.Viewport>
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>
                        </div>

                        {(setting.frequency === 'daily' || setting.frequency === 'weekly') && (
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-4 mb-2 font-sofia-sans">
                              Preferred Time
                            </label>
                            <Select.Root
                              value={setting.preferredTime || '09:00'}
                              onValueChange={(value) => updateSetting(notificationType.key, { preferredTime: value })}
                            >
                              <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-dark-blue-cm border border-gray-5/20 rounded text-light-100 text-sm">
                                <Select.Value />
                                <Select.Icon>
                                  <ChevronDown className="w-4 h-4" />
                                </Select.Icon>
                              </Select.Trigger>
                              <Select.Portal>
                                <Select.Content className="bg-dark-100 border border-gray-5/20 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                                  <Select.Viewport className="p-1">
                                    {TIME_OPTIONS.map((option) => (
                                      <Select.Item
                                        key={option.value}
                                        value={option.value}
                                        className="flex items-center px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none"
                                      >
                                        <Select.ItemText>{option.label}</Select.ItemText>
                                        <Select.ItemIndicator className="ml-auto">
                                          <Check className="w-4 h-4" />
                                        </Select.ItemIndicator>
                                      </Select.Item>
                                    ))}
                                  </Select.Viewport>
                                </Select.Content>
                              </Select.Portal>
                            </Select.Root>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {hasChanges && (
        <div className="sticky bottom-0 bg-dark-blue-cm/95 backdrop-blur border-t border-gray-5/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-4 font-sofia-sans">
              You have unsaved changes
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSettings({});
                  setHasChanges(false);
                  window.location.reload(); // Simple way to reset
                }}
                className="px-4 py-2 text-gray-4 hover:text-light-100 transition-colors font-sofia-sans"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 transition-colors font-sofia-sans font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}