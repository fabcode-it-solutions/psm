import { db } from "@/db/db";
import {
  and,
  eq,
  sql,
  or,
  inArray,
  isNull,
  gte,
  lte,
} from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type {
  NewNotification,
  NotificationApiResponse,
  NotificationWithRelations,
  NotificationStats,
} from "@/types/notifications.types";
import { notificationQueue, notifications, notificationSettings } from "@/db/schema/notifications";
import { users } from "@/db/schema/auth";
import { builds } from "@/db/schema/builds";
import { listingOffers, listings } from "@/db/schema/listings";
import { parts } from "@/db/schema/parts";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";

// Validation schemas
const createNotificationSchema = z.object({
  userId: z.number().int().positive(),
  type: z.string().max(50),
  message: z.string(),
  title: z.string().max(255).optional(),
  entityType: z.string().max(50).optional().nullable(),
  entityId: z.number().int().positive().optional().nullable(),
  fromUserId: z.number().int().positive().optional().nullable(),
  partId: z.number().int().positive().optional().nullable(),
  listingId: z.number().int().positive().optional().nullable(),
  buildId: z.number().int().positive().optional().nullable(),
  offerId: z.number().int().positive().optional().nullable(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  category: z.string().max(50).optional(),
  actionUrl: z.string().max(500).optional(),
  actionLabel: z.string().max(100).optional(),
  metadata: z.any().optional().nullable(),
  groupKey: z.string().max(100).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

const bulkCreateNotificationSchema = z.object({
  notifications: z.array(createNotificationSchema),
});

// GET /api/notifications - List notifications
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const isRead = searchParams.get("isRead");
    const fromUserId = searchParams.get("fromUserId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const includeRelations = searchParams.get("includeRelations") === "true";
    const groupByKey = searchParams.get("groupByKey") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    // const sortBy = searchParams.get("sortBy") || "createdAt";
    // const sortOrder = searchParams.get("sortOrder") || "desc";

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [eq(notifications.userId, parseInt(userId))];

    if (type) whereConditions.push(eq(notifications.type, type));
    if (category) whereConditions.push(eq(notifications.category, category));
    if (priority) whereConditions.push(eq(notifications.priority, priority));
    if (isRead !== null)
      whereConditions.push(eq(notifications.isRead, isRead === "true"));
    if (fromUserId)
      whereConditions.push(eq(notifications.fromUserId, parseInt(fromUserId)));

    if (startDate) {
      whereConditions.push(gte(notifications.createdAt, new Date(startDate)));
    }
    if (endDate) {
      whereConditions.push(lte(notifications.createdAt, new Date(endDate)));
    }

    // Get notifications
    const  query = db
      .select({
        notification: notifications,
        fromUser: fromUserId ? users : sql`NULL`,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.fromUserId, users.id))
      .where(
        and(
          ...whereConditions,
          or(
            isNull(notifications.expiresAt),
            gte(notifications.expiresAt, new Date())
          )
        )
      )
      .limit(limit)
      .offset(offset);

    // Apply sorting
    // const sortColumn =
    //   notifications[sortBy as keyof typeof notifications] ||
    //   notifications.createdAt;
    // if (sortOrder === "desc") {
    //   query = query.orderBy(desc(sortColumn));
    // } else {
    //   query = query.orderBy(asc(sortColumn));
    // }

    const results = await query;

    // Format results
    let notificationsData: NotificationWithRelations[] = results.map((r) => ({
      ...r.notification,
      fromUser: r.fromUser as number,
    }));

    // Group by groupKey if requested
    if (groupByKey) {
      const grouped = new Map<string, NotificationWithRelations>();

      for (const notif of notificationsData) {
        if (notif.groupKey) {
          const existing = grouped.get(notif.groupKey);
          if (!existing || notif.createdAt &&  existing.createdAt && notif.createdAt > existing.createdAt) {
            grouped.set(notif.groupKey, notif);
          }
        } else {
          grouped.set(`single_${notif.id}`, notif);
        }
      }

      notificationsData = Array.from(grouped.values());
    }

    // Include relations if requested
    if (includeRelations) {
      notificationsData = await Promise.all(
        notificationsData.map(async (notif) => {
          const details: NotificationWithRelations = { ...notif };

          if (notif.partId) {
            const [part] = await db
              .select()
              .from(parts)
              .where(eq(parts.id, notif.partId))
              .limit(1);
            details.part = part.id as number;
          }

          if (notif.listingId) {
            const [listing] = await db
              .select()
              .from(listings)
              .where(eq(listings.id, notif.listingId))
              .limit(1);
            details.listing = listing.id as number;
          }

          if (notif.buildId) {
            const [build] = await db
              .select()
              .from(builds)
              .where(eq(builds.id, notif.buildId))
              .limit(1);
            details.build = build.id as number;
          }

          if (notif.offerId) {
            const [offer] = await db
              .select()
              .from(listingOffers)
              .where(eq(listingOffers.id, notif.offerId))
              .limit(1);
            details.offer = offer.id as number;
          }

          return details;
        })
      );
    }

    // Get counts and stats
    const [{ total }] = await db
      .select({ total: sql`count(*)` })
      .from(notifications)
      .where(and(...whereConditions));

    const [{ unread }] = await db
      .select({ unread: sql`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, parseInt(userId)),
          eq(notifications.isRead, false)
        )
      );

    // Get stats by category and type
    const categoryStats = await db
      .select({
        category: notifications.category,
        count: sql<number>`count(*)`,
      })
      .from(notifications)
      .where(eq(notifications.userId, parseInt(userId)))
      .groupBy(notifications.category);

    const typeStats = await db
      .select({
        type: notifications.type,
        count: sql<number>`count(*)`,
      })
      .from(notifications)
      .where(eq(notifications.userId, parseInt(userId)))
      .groupBy(notifications.type);

    const stats: NotificationStats = {
      total: parseInt(total as string),
      unread: parseInt(unread as string),
      byCategory: Object.fromEntries(
        categoryStats.map((s) => [s.category || "uncategorized", s.count])
      ),
      byType: Object.fromEntries(typeStats.map((s) => [s.type, s.count])),
    };

    return NextResponse.json({
      success: true,
      data: notificationsData,
      pagination: {
        page,
        limit,
        total: parseInt(total as string),
        totalPages: Math.ceil(parseInt(total as string) / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create notification(s)
export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  try {
    const body = await req.json();

    // Check if bulk create
    if (Array.isArray(body.notifications)) {
      const validated = bulkCreateNotificationSchema.parse(body);

      // Check user settings for each notification
      const notificationsToCreate: NewNotification[] = [];

      for (const notifData of validated.notifications) {
        // Check user notification settings
        const [settings] = await db
          .select()
          .from(notificationSettings)
          .where(
            and(
              eq(notificationSettings.userId, notifData.userId),
              eq(notificationSettings.notificationType, notifData.type)
            )
          )
          .limit(1);

        // Skip if user has disabled this notification type
        if (settings?.frequency === "never") {
          continue;
        }

        // Check if should be queued based on frequency
        if (settings?.frequency && settings.frequency !== "instant") {
          // Add to queue instead
          await db.insert(notificationQueue).values({
            userId: notifData.userId,
            type: notifData.type,
            data: notifData,
            scheduledFor: getNextScheduledTime(
              settings.frequency,
              settings.preferredTime
            ),
            status: "pending",
            priority:
              notifData.priority === "urgent"
                ? 10
                : notifData.priority === "high"
                ? 5
                : 0,
          });
          continue;
        }

        notificationsToCreate.push({
          ...notifData,
          expiresAt: notifData.expiresAt ? new Date(notifData.expiresAt) : null,
        });
      }

      if (notificationsToCreate.length === 0) {
        return NextResponse.json({
          success: true,
          message: "No notifications created (user preferences)",
        });
      }

      const createdNotifications = await db
        .insert(notifications)
        .values(notificationsToCreate)
        .returning();

      return NextResponse.json(
        {
          success: true,
          data: createdNotifications,
          message: `${createdNotifications.length} notifications created`,
        },
        { status: 201 }
      );
    } else {
      // Single notification
      const validated = createNotificationSchema.parse(body);

      // Check user notification settings
      const [settings] = await db
        .select()
        .from(notificationSettings)
        .where(
          and(
            eq(notificationSettings.userId, validated.userId),
            eq(notificationSettings.notificationType, validated.type)
          )
        )
        .limit(1);

      // Skip if user has disabled this notification type
      if (settings?.frequency === "never") {
        return NextResponse.json({
          success: true,
          message: "Notification not created (user preference)",
        });
      }

      // Check if should be queued based on frequency
      if (settings?.frequency && settings.frequency !== "instant") {
        // Add to queue instead
        await db.insert(notificationQueue).values({
          userId: validated.userId,
          type: validated.type,
          data: validated,
          scheduledFor: getNextScheduledTime(
            settings.frequency,
            settings.preferredTime
          ),
          status: "pending",
          priority:
            validated.priority === "urgent"
              ? 10
              : validated.priority === "high"
              ? 5
              : 0,
        });

        return NextResponse.json({
          success: true,
          message: "Notification queued for later delivery",
        });
      }

      const notificationData: NewNotification = {
        ...validated,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
      };

      const [newNotification] = await db
        .insert(notifications)
        .values(notificationData)
        .returning();

      // TODO: Send push/email/SMS based on settings
      if (settings?.email) {
        // await sendEmailNotification(newNotification);
      }
      if (settings?.push) {
        // await sendPushNotification(newNotification);
      }

      return NextResponse.json(
        {
          success: true,
          data: newNotification,
          message: "Notification created successfully",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Error creating notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
)
// PUT /api/notifications - Bulk operations
// export const PUT = withFullCsrfProtection(
//   async (req: NextRequest): Promise<NextResponse> => {


export const PUT = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse<NotificationApiResponse>> =>{
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "mark-read": {
        const { notificationIds, userId } = body;

        await db
          .update(notifications)
          .set({
            isRead: true,
            readAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            and(
              inArray(notifications.id, notificationIds),
              eq(notifications.userId, userId)
            )
          );

        return NextResponse.json({
          success: true,
          message: `${notificationIds.length} notifications marked as read`,
        });
      }

      case "mark-all-read": {
        const { userId, category, type } = body;

        const whereConditions = [
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
        ];

        if (category)
          whereConditions.push(eq(notifications.category, category));
        if (type) whereConditions.push(eq(notifications.type, type));

        await db
          .update(notifications)
          .set({
            isRead: true,
            readAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(...whereConditions));

        return NextResponse.json({
          success: true,
          message: "All notifications marked as read",
        });
      }

      case "mark-unread": {
        const { notificationIds, userId } = body;

        await db
          .update(notifications)
          .set({
            isRead: false,
            readAt: null,
            updatedAt: new Date(),
          })
          .where(
            and(
              inArray(notifications.id, notificationIds),
              eq(notifications.userId, userId)
            )
          );

        return NextResponse.json({
          success: true,
          message: `${notificationIds.length} notifications marked as unread`,
        });
      }

      case "bulk-delete": {
        const { notificationIds, userId } = body;

        await db
          .delete(notifications)
          .where(
            and(
              inArray(notifications.id, notificationIds),
              eq(notifications.userId, userId)
            )
          );

        return NextResponse.json({
          success: true,
          message: `${notificationIds.length} notifications deleted`,
        });
      }

      case "clear-old": {
        const { userId, olderThan } = body;

        const cutoffDate = new Date(
          Date.now() - (olderThan || 30) * 24 * 60 * 60 * 1000
        );

        await db
          .delete(notifications)
          .where(
            and(
              eq(notifications.userId, userId),
              lte(notifications.createdAt, cutoffDate),
              eq(notifications.isRead, true)
            )
          );

        return NextResponse.json({
          success: true,
          message: "Old notifications cleared",
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in bulk operation:", error);
    return NextResponse.json(
      { success: false, error: "Bulk operation failed" },
      { status: 500 }
    );
  }
}
)
// Helper function to calculate next scheduled time
function getNextScheduledTime(
  frequency: string,
  preferredTime?: string | null
): Date {
  const scheduledDate = new Date();

  switch (frequency) {
    case "hourly":
      scheduledDate.setHours(scheduledDate.getHours() + 1, 0, 0, 0);
      break;
    case "daily":
      scheduledDate.setDate(scheduledDate.getDate() + 1);
      if (preferredTime) {
        const [hours, minutes] = preferredTime.split(":").map(Number);
        scheduledDate.setHours(hours, minutes, 0, 0);
      }
      break;
    case "weekly":
      scheduledDate.setDate(scheduledDate.getDate() + 7);
      if (preferredTime) {
        const [hours, minutes] = preferredTime.split(":").map(Number);
        scheduledDate.setHours(hours, minutes, 0, 0);
      }
      break;
    default:
      break;
  }

  return scheduledDate;
}
