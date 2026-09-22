import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { 
  notifications, 
  notificationSettings,
  notificationTemplates,
  notificationQueue
} from "@/db/schema/notifications";

// Inferred types from schema
export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;
export type NotificationSettings = InferSelectModel<typeof notificationSettings>;
export type NewNotificationSettings = InferInsertModel<typeof notificationSettings>;
export type NotificationTemplate = InferSelectModel<typeof notificationTemplates>;
export type NewNotificationTemplate = InferInsertModel<typeof notificationTemplates>;
export type NotificationQueueItem = InferSelectModel<typeof notificationQueue>;
export type NewNotificationQueueItem = InferInsertModel<typeof notificationQueue>;

// Extended types
export interface NotificationWithRelations extends Notification {
  fromUser?: number; // Replace with your User type
  part?: number; // Replace with your Part type
  listing?: number; // Replace with your Listing type
  build?: number; // Replace with your Build type
  offer?: number; // Replace with your Offer type
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
}

export interface NotificationApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedNotificationResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: NotificationStats;
}