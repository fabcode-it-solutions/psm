import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
  serial,
  uniqueIndex,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel, relations } from "drizzle-orm";
import { users } from "./auth";

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }), // for groups
    isGroup: boolean("is_group").default(false).notNull(),
    createdBy: integer("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("conversations_is_group_idx").on(table.isGroup),
    index("conversations_created_by_idx").on(table.createdBy),
  ]
);

export const conversationMembers = pgTable(
  "conversation_members",
  {
    id: serial("id").primaryKey(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("conversation_user_unique").on(
      table.conversationId,
      table.userId
    ),
    index("conversation_members_conversation_idx").on(table.conversationId),
    index("conversation_members_user_idx").on(table.userId),
  ]
);

export const messages = pgTable(
  "conversations_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    senderId: integer("sender_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    messageText: text("message_text"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("messages_conversation_idx").on(table.conversationId),
    index("messages_sender_idx").on(table.senderId),
    index("messages_created_at_idx").on(table.createdAt),
  ]
);

export const messageAttachments = pgTable(
  "conversations_message_attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    messageId: uuid("message_id")
      .references(() => messages.id, { onDelete: "cascade" })
      .notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: varchar("file_type", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("attachments_message_idx").on(table.messageId),
    index("attachments_file_type_idx").on(table.fileType),
  ]
);

export const messageAttachmentsRelations = relations(
  messageAttachments,
  ({ one }) => ({
    message: one(messages, {
      fields: [messageAttachments.messageId],
      references: [messages.id],
    }),
  })
);

export type Conversation = InferSelectModel<typeof conversations>;
export type NewConversation = InferInsertModel<typeof conversations>;
export type ConversationMember = InferSelectModel<typeof conversationMembers>;
export type NewConversationMember = InferInsertModel<
  typeof conversationMembers
>;
export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;
export type MessageAttachment = InferSelectModel<typeof messageAttachments>;
export type NewMessageAttachment = InferInsertModel<typeof messageAttachments>;
