import { pgTable, foreignKey, uuid, integer, varchar, timestamp, index, serial, text, boolean, jsonb, unique, uniqueIndex, numeric, primaryKey, pgSequence, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const moderationStatus = pgEnum("moderation_status", ['clean', 'flagged', 'reviewed', 'rejected', 'hidden'])
export const userActivityType = pgEnum("user_activity_type", ['login', 'logout', 'block', 'unblock', 'password_change', 'profile_update', 'email_verify', 'suspend'])

export const partHashIdSeq = pgSequence("part_hash_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "10", cycle: true })
export const reportHashIdSeq = pgSequence("report_hash_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "10", cycle: true })
export const listHashIdSeq = pgSequence("list_hash_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "10", cycle: true })

export const usernameHistory = pgTable("username_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	oldUsername: varchar("old_username", { length: 255 }),
	newUsername: varchar("new_username", { length: 255 }).notNull(),
	changedAt: timestamp("changed_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "username_history_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const userActivities = pgTable("user_activities", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	entityType: userActivityType("entity_type").notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("user_activity_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("user_activity_entity_type_idx").using("btree", table.entityType.asc().nullsLast().op("enum_ops")),
	index("user_activity_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_activities_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const media = pgTable("media", {
	id: serial().primaryKey().notNull(),
	type: varchar({ length: 50 }).notNull(),
	url: varchar({ length: 500 }).notNull(),
	altText: varchar("alt_text", { length: 500 }),
	isPublic: boolean("is_public").default(true),
	isArchived: boolean("is_archived").default(false),
	displayOrder: integer("display_order").default(0),
	userId: integer("user_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	size: varchar({ length: 500 }),
	width: integer(),
	height: integer(),
	format: varchar({ length: 500 }),
	name: varchar({ length: 50 }),
}, (table) => [
	index("media_archived_idx").using("btree", table.isArchived.asc().nullsLast().op("bool_ops")),
	index("media_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("media_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
	index("media_public_idx").using("btree", table.isPublic.asc().nullsLast().op("bool_ops")),
	index("media_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "media_user_id_users_id_fk"
		}).onDelete("set null"),
]);

export const seoMeta = pgTable("seo_meta", {
	id: serial().primaryKey().notNull(),
	entityType: varchar("entity_type", { length: 50 }).notNull(),
	entityId: integer("entity_id"),
	metaTitle: varchar("meta_title", { length: 255 }),
	metaDescription: text("meta_description"),
	metaKeywords: text("meta_keywords"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	ogTitle: varchar("og_title", { length: 255 }),
	ogDescription: text("og_description"),
	ogImage: varchar("og_image", { length: 500 }),
	canonicalUrl: varchar("canonical_url", { length: 500 }),
	robots: varchar({ length: 100 }),
	structuredData: jsonb("structured_data"),
}, (table) => [
	index("seo_meta_entity_idx").using("btree", table.entityType.asc().nullsLast().op("int4_ops"), table.entityId.asc().nullsLast().op("int4_ops")),
]);

export const adminBlockUser = pgTable("admin_block_user", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	adminId: integer("admin_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	reason: text(),
	blockTime: timestamp("block_time", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.adminId],
			foreignColumns: [users.id],
			name: "admin_block_user_admin_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "admin_block_user_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const userOnlineHistory = pgTable("user_online_History", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_online_History_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const rateLimits = pgTable("rate_limits", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	ipAddress: text("ip_address").notNull(),
	route: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("rate_limits_ip_route_created_at_idx").using("btree", table.ipAddress.asc().nullsLast().op("timestamp_ops"), table.route.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("timestamp_ops")),
]);

export const addresses = pgTable("addresses", {
	userId: integer("user_id").notNull(),
	vehicleId: integer("vehicle_id").notNull(),
	addressLine1: varchar("address_line1", { length: 256 }).notNull(),
	addressLine2: varchar("address_line2", { length: 256 }),
	state: varchar({ length: 128 }),
	postalCode: varchar("postal_code", { length: 20 }),
	type: text(),
	id: serial().primaryKey().notNull(),
	isDefault: boolean("is_default").default(false),
}, (table) => [
	index("idx_addresses_postal_code").using("btree", table.postalCode.asc().nullsLast().op("text_ops")),
	index("idx_addresses_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("idx_addresses_vehicle_id").using("btree", table.vehicleId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "addresses_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.vehicleId],
			foreignColumns: [builds.id],
			name: "addresses_vehicle_id_builds_id_fk"
		}),
]);

export const notificationTemplates = pgTable("notification_templates", {
	id: serial().primaryKey().notNull(),
	type: varchar({ length: 50 }).notNull(),
	titleTemplate: varchar("title_template", { length: 255 }),
	messageTemplate: text("message_template").notNull(),
	emailSubjectTemplate: varchar("email_subject_template", { length: 255 }),
	emailBodyTemplate: text("email_body_template"),
	pushTemplate: text("push_template"),
	smsTemplate: varchar("sms_template", { length: 500 }),
	defaultPriority: varchar("default_priority", { length: 20 }).default('normal'),
	defaultCategory: varchar("default_category", { length: 50 }),
	variables: jsonb(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("notification_templates_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("notification_templates_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	unique("notification_templates_type_unique").on(table.type),
]);

export const conversations = pgTable("conversations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }),
	isGroup: boolean("is_group").default(false).notNull(),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("conversations_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("int4_ops")),
	index("conversations_is_group_idx").using("btree", table.isGroup.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "conversations_created_by_users_id_fk"
		}).onDelete("set null"),
]);

export const conversationMembers = pgTable("conversation_members", {
	id: serial().primaryKey().notNull(),
	conversationId: uuid("conversation_id").notNull(),
	userId: integer("user_id").notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("conversation_members_conversation_idx").using("btree", table.conversationId.asc().nullsLast().op("uuid_ops")),
	index("conversation_members_user_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("conversation_user_unique").using("btree", table.conversationId.asc().nullsLast().op("uuid_ops"), table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.id],
			name: "conversation_members_conversation_id_conversations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "conversation_members_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const conversationsMessages = pgTable("conversations_messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	conversationId: uuid("conversation_id").notNull(),
	senderId: integer("sender_id").notNull(),
	messageText: text("message_text"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	isRead: boolean("is_read").default(false).notNull(),
}, (table) => [
	index("messages_conversation_idx").using("btree", table.conversationId.asc().nullsLast().op("uuid_ops")),
	index("messages_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("messages_sender_idx").using("btree", table.senderId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.id],
			name: "conversations_messages_conversation_id_conversations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "conversations_messages_sender_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const conversationsMessageAttachments = pgTable("conversations_message_attachments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	messageId: uuid("message_id").notNull(),
	fileUrl: text("file_url").notNull(),
	fileType: varchar("file_type", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("attachments_file_type_idx").using("btree", table.fileType.asc().nullsLast().op("text_ops")),
	index("attachments_message_idx").using("btree", table.messageId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [conversationsMessages.id],
			name: "conversations_message_attachments_message_id_conversations_mess"
		}).onDelete("cascade"),
]);

export const shippingRates = pgTable("shipping_rates", {
	id: serial().primaryKey().notNull(),
	shippingProfileId: integer("shipping_profile_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	carrier: varchar({ length: 100 }),
	service: varchar({ length: 100 }),
	basePrice: numeric("base_price", { precision: 10, scale:  2 }).notNull(),
	priceModifiers: jsonb("price_modifiers"),
	estimatedDaysMin: integer("estimated_days_min"),
	estimatedDaysMax: integer("estimated_days_max"),
	zones: jsonb(),
	conditions: jsonb(),
	displayOrder: integer("display_order").default(0),
}, (table) => [
	index("shipping_rate_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
	index("shipping_rate_profile_idx").using("btree", table.shippingProfileId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.shippingProfileId],
			foreignColumns: [shippingProfiles.id],
			name: "shipping_rates_shipping_profile_id_shipping_profiles_id_fk"
		}).onDelete("cascade"),
]);

export const listingWatchlist = pgTable("listing_watchlist", {
	id: serial().primaryKey().notNull(),
	listingId: integer("listing_id").notNull(),
	userId: integer("user_id").notNull(),
	notifyPriceDrops: boolean("notify_price_drops").default(true),
	notifyBackInStock: boolean("notify_back_in_stock").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("watchlist_listing_idx").using("btree", table.listingId.asc().nullsLast().op("int4_ops")),
	index("watchlist_user_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.listingId],
			foreignColumns: [listings.id],
			name: "listing_watchlist_listing_id_listings_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "listing_watchlist_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("watchlist_unique").on(table.listingId, table.userId),
]);

export const shippingProfiles = pgTable("shipping_profiles", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	isDefault: boolean("is_default").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("shipping_profile_default_idx").using("btree", table.isDefault.asc().nullsLast().op("bool_ops")),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	username: varchar({ length: 255 }),
	bio: text(),
	profileImage: text("profile_image"),
	phoneNumber: varchar("phone_number", { length: 20 }),
	countryCode: varchar("country_code", { length: 10 }),
	passwordToken: varchar("password_token", { length: 255 }),
	passwordTokenExpire: timestamp("password_token_expire", { mode: 'string' }),
	role: varchar({ length: 100 }).default('user'),
	isVerified: boolean("is_verified").default(false).notNull(),
	isSocialLogin: boolean("is_social_login").default(false).notNull(),
	loginType: varchar("login_type").default('Email').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	anonymous: boolean().default(false),
	anonymousName: varchar(),
	coverImage: text("cover_image"),
	trustedSeller: boolean("trusted_seller").default(false),
	isPrivate: boolean("is_private").default(false).notNull(),
	notificationId: uuid("notification_id").defaultRandom(),
	flagged: boolean().default(false).notNull(),
}, (table) => [
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_users_phone").using("btree", table.phoneNumber.asc().nullsLast().op("text_ops")),
	index("idx_users_username").using("btree", table.username.asc().nullsLast().op("text_ops")),
	unique("users_email_unique").on(table.email),
	unique("users_username_unique").on(table.username),
	unique("users_phone_number_unique").on(table.phoneNumber),
]);

export const follows = pgTable("follows", {
	followerId: integer("follower_id"),
	followingId: integer("following_id"),
	id: serial().primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_follows_follower").using("btree", table.followerId.asc().nullsLast().op("int4_ops")),
	index("idx_follows_following").using("btree", table.followingId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.followerId],
			foreignColumns: [users.id],
			name: "follows_follower_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.followingId],
			foreignColumns: [users.id],
			name: "follows_following_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const builds = pgTable("builds", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	brandId: integer("brand_id").notNull(),
	modelId: integer("model_id").notNull(),
	typeId: integer("type_id").notNull(),
	licensePlate: varchar("license_plate", { length: 32 }),
	vinNumber: varchar("vin_number", { length: 64 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_builds_brand_id").using("btree", table.brandId.asc().nullsLast().op("int4_ops")),
	index("idx_builds_license_plate").using("btree", table.licensePlate.asc().nullsLast().op("text_ops")),
	index("idx_builds_model_id").using("btree", table.modelId.asc().nullsLast().op("int4_ops")),
	index("idx_builds_type_id").using("btree", table.typeId.asc().nullsLast().op("int4_ops")),
	index("idx_builds_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [carBrands.id],
			name: "builds_brand_id_car_brands_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.modelId],
			foreignColumns: [carModels.id],
			name: "builds_model_id_car_models_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.typeId],
			foreignColumns: [carModelTypes.id],
			name: "builds_type_id_car_model_types_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "builds_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const wishlistItems = pgTable("wishlist_items", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	categoryId: integer("category_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	entityType: varchar("entity_type", { length: 50 }),
	entityId: integer("entity_id"),
	partId: integer("part_id"),
	listingId: integer("listing_id"),
	buildId: integer("build_id"),
	isAlertOn: boolean("is_alert_on").default(false),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	bookmarkedUserId: integer("bookmarked_user_id"),
}, (table) => [
	index("wishlist_items_build_id_idx").using("btree", table.buildId.asc().nullsLast().op("int4_ops")),
	index("wishlist_items_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("wishlist_items_entity_idx").using("btree", table.entityType.asc().nullsLast().op("text_ops"), table.entityId.asc().nullsLast().op("int4_ops")),
	index("wishlist_items_is_alert_on_idx").using("btree", table.isAlertOn.asc().nullsLast().op("bool_ops")),
	index("wishlist_items_listing_id_idx").using("btree", table.listingId.asc().nullsLast().op("int4_ops")),
	index("wishlist_items_part_id_idx").using("btree", table.partId.asc().nullsLast().op("int4_ops")),
	index("wishlist_items_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.bookmarkedUserId],
			foreignColumns: [users.id],
			name: "wishlist_items_bookmarked_user_id_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.buildId],
			foreignColumns: [builds.id],
			name: "wishlist_items_build_id_builds_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [wishlistCategories.id],
			name: "wishlist_items_category_id_wishlist_categories_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.listingId],
			foreignColumns: [listings.id],
			name: "wishlist_items_listing_id_listings_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.partId],
			foreignColumns: [parts.id],
			name: "wishlist_items_part_id_parts_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "wishlist_items_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("wishlist_items_unique_entity").on(table.categoryId, table.entityType, table.entityId),
]);

export const adminSuspendedUser = pgTable("admin_suspended_user", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: integer("user_id"),
	adminId: integer("admin_id"),
	reason: text(),
	suspendTime: timestamp("suspend_time", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_admin_suspended_user_admin").using("btree", table.adminId.asc().nullsLast().op("int4_ops")),
	index("idx_admin_suspended_user_user").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.adminId],
			foreignColumns: [users.id],
			name: "admin_suspended_user_admin_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "admin_suspended_user_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const categories = pgTable("categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	bio: text(),
	coverImageId: integer("cover_image_id"),
	parentId: integer("parent_id"),
	isCustom: boolean("is_custom").default(false),
	userId: integer("user_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true),
}, (table) => [
	index("category_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("category_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.coverImageId],
			foreignColumns: [media.id],
			name: "categories_cover_image_id_media_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "categories_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("categories_slug_unique").on(table.slug),
]);

export const listingOffers = pgTable("listing_offers", {
	id: serial().primaryKey().notNull(),
	listingId: integer("listing_id").notNull(),
	buyerId: integer("buyer_id").notNull(),
	offerAmount: numeric("offer_amount", { precision: 12, scale:  2 }).notNull(),
	quantity: integer().default(1),
	message: text(),
	status: varchar({ length: 50 }).default('pending'),
	counterAmount: numeric("counter_amount", { precision: 12, scale:  2 }),
	counterMessage: text("counter_message"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	respondedAt: timestamp("responded_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("offer_buyer_idx").using("btree", table.buyerId.asc().nullsLast().op("int4_ops")),
	index("offer_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("offer_listing_idx").using("btree", table.listingId.asc().nullsLast().op("int4_ops")),
	index("offer_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.buyerId],
			foreignColumns: [users.id],
			name: "listing_offers_buyer_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.listingId],
			foreignColumns: [listings.id],
			name: "listing_offers_listing_id_listings_id_fk"
		}).onDelete("cascade"),
]);

export const listingPriceHistory = pgTable("listing_price_history", {
	id: serial().primaryKey().notNull(),
	listingId: integer("listing_id").notNull(),
	previousPrice: numeric("previous_price", { precision: 12, scale:  2 }),
	newPrice: numeric("new_price", { precision: 12, scale:  2 }).notNull(),
	changedBy: integer("changed_by"),
	changeReason: varchar("change_reason", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("price_history_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("price_history_listing_idx").using("btree", table.listingId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.changedBy],
			foreignColumns: [users.id],
			name: "listing_price_history_changed_by_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.listingId],
			foreignColumns: [listings.id],
			name: "listing_price_history_listing_id_listings_id_fk"
		}).onDelete("cascade"),
]);

export const userSocialMedia = pgTable("user_social_media", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	facebook: text(),
	instagram: text(),
	youtube: text(),
	twitter: text(),
	linkedIn: text(),
}, (table) => [
	index("idx_user_social_media_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_social_media_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const listingQuestions = pgTable("listing_questions", {
	id: serial().primaryKey().notNull(),
	listingId: integer("listing_id").notNull(),
	askedBy: integer("asked_by").notNull(),
	question: text().notNull(),
	answer: text(),
	answeredBy: integer("answered_by"),
	answeredAt: timestamp("answered_at", { mode: 'string' }),
	isPublic: boolean("is_public").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("question_asked_by_idx").using("btree", table.askedBy.asc().nullsLast().op("int4_ops")),
	index("question_listing_idx").using("btree", table.listingId.asc().nullsLast().op("int4_ops")),
	index("question_public_idx").using("btree", table.isPublic.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.answeredBy],
			foreignColumns: [users.id],
			name: "listing_questions_answered_by_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.askedBy],
			foreignColumns: [users.id],
			name: "listing_questions_asked_by_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.listingId],
			foreignColumns: [listings.id],
			name: "listing_questions_listing_id_listings_id_fk"
		}).onDelete("cascade"),
]);

export const listingReviews = pgTable("listing_reviews", {
	id: serial().primaryKey().notNull(),
	listingId: integer("listing_id").notNull(),
	reviewerId: integer("reviewer_id").notNull(),
	action: varchar({ length: 50 }).notNull(),
	previousStatus: varchar("previous_status", { length: 50 }),
	newStatus: varchar("new_status", { length: 50 }),
	notes: text(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("listing_review_action_idx").using("btree", table.action.asc().nullsLast().op("text_ops")),
	index("listing_review_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("listing_review_listing_idx").using("btree", table.listingId.asc().nullsLast().op("int4_ops")),
	index("listing_review_reviewer_idx").using("btree", table.reviewerId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.listingId],
			foreignColumns: [listings.id],
			name: "listing_reviews_listing_id_listings_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reviewerId],
			foreignColumns: [users.id],
			name: "listing_reviews_reviewer_id_users_id_fk"
		}).onDelete("set null"),
]);

export const listingTransactions = pgTable("listing_transactions", {
	id: serial().primaryKey().notNull(),
	listingId: integer("listing_id").notNull(),
	userId: integer("user_id"),
	action: varchar({ length: 50 }).notNull(),
	amount: numeric({ precision: 12, scale:  2 }),
	quantity: integer().default(1),
	previousValue: jsonb("previous_value"),
	newValue: jsonb("new_value"),
	notes: text(),
	metadata: jsonb(),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("transaction_action_idx").using("btree", table.action.asc().nullsLast().op("text_ops")),
	index("transaction_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("transaction_listing_idx").using("btree", table.listingId.asc().nullsLast().op("int4_ops")),
	index("transaction_user_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.listingId],
			foreignColumns: [listings.id],
			name: "listing_transactions_listing_id_listings_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "listing_transactions_user_id_users_id_fk"
		}).onDelete("set null"),
]);

export const wishlistCategories = pgTable("wishlist_categories", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	imageMediaId: integer("image_media_id"),
	isDefault: boolean("is_default").default(false),
	isPublic: boolean("is_public").default(true),
	sortOrder: integer("sort_order").default(0),
	itemCount: integer("item_count").default(0),
	seoId: integer("seo_id"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	note: varchar({ length: 255 }),
}, (table) => [
	index("wishlist_categories_is_public_idx").using("btree", table.isPublic.asc().nullsLast().op("bool_ops")),
	index("wishlist_categories_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("wishlist_categories_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.imageMediaId],
			foreignColumns: [media.id],
			name: "wishlist_categories_image_media_id_media_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.seoId],
			foreignColumns: [seoMeta.id],
			name: "wishlist_categories_seo_id_seo_meta_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "wishlist_categories_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("wishlist_categories_unique_user_slug").on(table.userId, table.slug),
]);

export const notificationQueue = pgTable("notification_queue", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	type: varchar({ length: 50 }).notNull(),
	data: jsonb().notNull(),
	scheduledFor: timestamp("scheduled_for", { mode: 'string' }).notNull(),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	status: varchar({ length: 20 }).default('pending'),
	attempts: integer().default(0),
	lastError: text("last_error"),
	priority: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("notification_queue_priority_idx").using("btree", table.priority.asc().nullsLast().op("int4_ops")),
	index("notification_queue_scheduled_for_idx").using("btree", table.scheduledFor.asc().nullsLast().op("timestamp_ops")),
	index("notification_queue_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notification_queue_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const notificationSettings = pgTable("notification_settings", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	notificationType: varchar("notification_type", { length: 50 }).notNull(),
	inApp: boolean("in_app").default(true),
	email: boolean().default(true),
	push: boolean().default(true),
	sms: boolean().default(false),
	frequency: varchar({ length: 20 }).default('instant'),
	preferredTime: varchar("preferred_time", { length: 5 }),
	timezone: varchar({ length: 50 }).default('UTC'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("notification_settings_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notification_settings_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("notification_settings_unique").on(table.userId, table.notificationType),
]);

export const notifications = pgTable("notifications", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	type: varchar({ length: 50 }).notNull(),
	message: text().notNull(),
	title: varchar({ length: 255 }),
	entityType: varchar("entity_type", { length: 50 }),
	entityId: integer("entity_id"),
	fromUserId: integer("from_user_id"),
	partId: integer("part_id"),
	listingId: integer("listing_id"),
	buildId: integer("build_id"),
	offerId: integer("offer_id"),
	priority: varchar({ length: 20 }).default('normal'),
	category: varchar({ length: 50 }),
	actionUrl: varchar("action_url", { length: 500 }),
	actionLabel: varchar("action_label", { length: 100 }),
	metadata: jsonb(),
	isRead: boolean("is_read").default(false),
	readAt: timestamp("read_at", { mode: 'string' }),
	emailSent: boolean("email_sent").default(false),
	emailSentAt: timestamp("email_sent_at", { mode: 'string' }),
	pushSent: boolean("push_sent").default(false),
	pushSentAt: timestamp("push_sent_at", { mode: 'string' }),
	smsSent: boolean("sms_sent").default(false),
	smsSentAt: timestamp("sms_sent_at", { mode: 'string' }),
	groupKey: varchar("group_key", { length: 100 }),
	groupCount: integer("group_count").default(1),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("notifications_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("notifications_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("notifications_entity_idx").using("btree", table.entityType.asc().nullsLast().op("text_ops"), table.entityId.asc().nullsLast().op("int4_ops")),
	index("notifications_from_user_idx").using("btree", table.fromUserId.asc().nullsLast().op("int4_ops")),
	index("notifications_group_key_idx").using("btree", table.groupKey.asc().nullsLast().op("text_ops")),
	index("notifications_is_read_idx").using("btree", table.isRead.asc().nullsLast().op("bool_ops")),
	index("notifications_priority_idx").using("btree", table.priority.asc().nullsLast().op("text_ops")),
	index("notifications_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("notifications_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("notifications_user_unread_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.isRead.asc().nullsLast().op("int4_ops"), table.createdAt.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.buildId],
			foreignColumns: [builds.id],
			name: "notifications_build_id_builds_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.fromUserId],
			foreignColumns: [users.id],
			name: "notifications_from_user_id_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.listingId],
			foreignColumns: [listings.id],
			name: "notifications_listing_id_listings_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.offerId],
			foreignColumns: [listingOffers.id],
			name: "notifications_offer_id_listing_offers_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.partId],
			foreignColumns: [parts.id],
			name: "notifications_part_id_parts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const metafieldDefinitions = pgTable("metafield_definitions", {
	id: serial().primaryKey().notNull(),
	entityType: varchar("entity_type", { length: 50 }).notNull(),
	namespace: varchar({ length: 100 }).default('custom'),
	key: varchar({ length: 100 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	type: varchar({ length: 50 }).notNull(),
	validationRules: jsonb("validation_rules"),
	defaultValue: text("default_value"),
	placeholder: varchar({ length: 255 }),
	helpText: text("help_text"),
	isRequired: boolean("is_required").default(false),
	isSearchable: boolean("is_searchable").default(false),
	isPublic: boolean("is_public").default(true),
	displayOrder: integer("display_order").default(0),
	settings: jsonb(),
	userId: integer("user_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	appliesGlobally: boolean("applies_globally").default(true).notNull(),
}, (table) => [
	index("metafield_def_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("metafield_def_entity_type_idx").using("btree", table.entityType.asc().nullsLast().op("text_ops")),
	index("metafield_def_global_idx").using("btree", table.appliesGlobally.asc().nullsLast().op("bool_ops")),
	index("metafield_def_key_idx").using("btree", table.key.asc().nullsLast().op("text_ops")),
	index("metafield_def_namespace_idx").using("btree", table.namespace.asc().nullsLast().op("text_ops")),
	index("metafield_def_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
	index("metafield_def_searchable_idx").using("btree", table.isSearchable.asc().nullsLast().op("bool_ops")),
	index("metafield_def_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "metafield_definitions_user_id_users_id_fk"
		}).onDelete("set null"),
	unique("metafield_def_unique").on(table.entityType, table.namespace, table.key),
]);

export const wishlistPriceAlerts = pgTable("wishlist_price_alerts", {
	id: serial().primaryKey().notNull(),
	itemId: integer("item_id").notNull(),
	userId: integer("user_id").notNull(),
	alertType: varchar("alert_type", { length: 50 }).notNull(),
	previousPrice: numeric("previous_price", { precision: 12, scale:  2 }),
	currentPrice: numeric("current_price", { precision: 12, scale:  2 }),
	targetPrice: numeric("target_price", { precision: 12, scale:  2 }),
	isRead: boolean("is_read").default(false),
	notificationSent: boolean("notification_sent").default(false),
	notificationMethod: varchar("notification_method", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	readAt: timestamp("read_at", { mode: 'string' }),
}, (table) => [
	index("wishlist_price_alerts_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("wishlist_price_alerts_is_read_idx").using("btree", table.isRead.asc().nullsLast().op("bool_ops")),
	index("wishlist_price_alerts_item_id_idx").using("btree", table.itemId.asc().nullsLast().op("int4_ops")),
	index("wishlist_price_alerts_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.itemId],
			foreignColumns: [wishlistItems.id],
			name: "wishlist_price_alerts_item_id_wishlist_items_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "wishlist_price_alerts_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const parts = pgTable("parts", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 500 }).notNull(),
	slug: varchar({ length: 500 }).notNull(),
	description: text(),
	status: varchar({ length: 50 }).default('draft'),
	userId: integer("user_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	listed: varchar({ length: 50 }).default('For Sale'),
	brandId: integer("brand_id").notNull(),
	modelId: integer("model_id").notNull(),
	typeId: integer("type_id").notNull(),
	manufacturerId: integer("manufacturer_id").notNull(),
	tags: jsonb(),
	partid: text().default(sql`(\'#PRT\'::text || lpad((nextval(\'part_hash_id_seq\'::regclass))::text, 4, \'0\'::text))`).notNull(),
	demandScore: integer("demand_score").default(0),
	wishlistCount: integer("wishlist_count").default(0),
	inquiryCount: integer("inquiry_count").default(0),
	viewCount: integer("view_count").default(0),
	lastRestockRequest: timestamp("last_restock_request", { mode: 'string' }),
	moderationStatus: moderationStatus("moderation_status").default('clean'),
}, (table) => [
	index("part_demand_score_idx").using("btree", table.demandScore.asc().nullsLast().op("int4_ops")),
	index("part_id_idx").using("btree", table.partid.asc().nullsLast().op("text_ops")),
	index("part_moderation_status_idx").using("btree", table.moderationStatus.asc().nullsLast().op("enum_ops")),
	index("part_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("part_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("part_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [carBrands.id],
			name: "parts_brand_id_car_brands_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.manufacturerId],
			foreignColumns: [manufacturers.id],
			name: "parts_manufacturer_id_manufacturers_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.modelId],
			foreignColumns: [carModels.id],
			name: "parts_model_id_car_models_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.typeId],
			foreignColumns: [carModelTypes.id],
			name: "parts_type_id_car_model_types_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "parts_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("parts_slug_unique").on(table.slug),
]);

export const userReports = pgTable("user_reports", {
	id: serial().primaryKey().notNull(),
	reporterUserId: integer("reporter_user_id").notNull(),
	reportedUserId: integer("reported_user_id").notNull(),
	reason: text().notNull(),
	description: text(),
	category: text(),
	status: text().default('pending'),
	adminNotes: text("admin_notes"),
	reviewedBy: integer("reviewed_by"),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	imageMediaId: integer("image_media_id"),
	statusRecord: jsonb("status_record"),
	reportId: text("report_id").default(sql`(\'#RPT\'::text || lpad((nextval(\'report_hash_id_seq\'::regclass))::text, 4, \'0\'::text))`).notNull(),
}, (table) => [
	index("user_reports_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("user_reports_reported_user_id_idx").using("btree", table.reportedUserId.asc().nullsLast().op("int4_ops")),
	index("user_reports_reporter_user_id_idx").using("btree", table.reporterUserId.asc().nullsLast().op("int4_ops")),
	index("user_reports_reviewed_by_idx").using("btree", table.reviewedBy.asc().nullsLast().op("int4_ops")),
	index("user_reports_status_created_at_idx").using("btree", table.status.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("user_reports_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.imageMediaId],
			foreignColumns: [media.id],
			name: "user_reports_image_media_id_media_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.reportedUserId],
			foreignColumns: [users.id],
			name: "user_reports_reported_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reporterUserId],
			foreignColumns: [users.id],
			name: "user_reports_reporter_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reviewedBy],
			foreignColumns: [users.id],
			name: "user_reports_reviewed_by_users_id_fk"
		}).onDelete("set null"),
]);

export const userBlocks = pgTable("user_blocks", {
	id: serial().primaryKey().notNull(),
	blockerUserId: integer("blocker_user_id").notNull(),
	blockedUserId: integer("blocked_user_id").notNull(),
	reason: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("user_blocks_blocked_user_id_idx").using("btree", table.blockedUserId.asc().nullsLast().op("int4_ops")),
	index("user_blocks_blocker_user_id_idx").using("btree", table.blockerUserId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.blockedUserId],
			foreignColumns: [users.id],
			name: "user_blocks_blocked_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.blockerUserId],
			foreignColumns: [users.id],
			name: "user_blocks_blocker_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("user_blocks_unique_block").on(table.blockerUserId, table.blockedUserId),
]);

export const carBrands = pgTable("car_brands", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	status: varchar({ length: 255 }).default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	description: varchar({ length: 255 }),
	logoMediaId: integer("logo_media_id"),
	imageMediaId: integer("image_media_id"),
}, (table) => [
	index("idx_car_brands_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_car_brands_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.imageMediaId],
			foreignColumns: [media.id],
			name: "car_brands_image_media_id_media_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.logoMediaId],
			foreignColumns: [media.id],
			name: "car_brands_logo_media_id_media_id_fk"
		}).onDelete("set null"),
]);

export const listings = pgTable("listings", {
	id: serial().primaryKey().notNull(),
	partId: integer("part_id"),
	variantId: integer("variant_id"),
	userId: integer("user_id").notNull(),
	title: varchar({ length: 500 }),
	slug: varchar({ length: 500 }).notNull(),
	description: text(),
	price: numeric({ precision: 12, scale:  2 }).notNull(),
	currency: varchar({ length: 3 }).default('USD'),
	minimumBid: numeric("minimum_bid", { precision: 12, scale:  2 }),
	buyNowPrice: numeric("buy_now_price", { precision: 12, scale:  2 }),
	offerNotificationThreshold: numeric("offer_notification_threshold", { precision: 12, scale:  2 }),
	quantity: integer().default(1),
	quantityAvailable: integer("quantity_available").default(1),
	sku: varchar({ length: 255 }),
	addressLine1: varchar("address_line1", { length: 255 }),
	addressLine2: varchar("address_line2", { length: 255 }),
	city: varchar({ length: 100 }),
	state: varchar({ length: 100 }),
	postalCode: varchar("postal_code", { length: 20 }),
	country: varchar({ length: 2 }),
	latitude: numeric({ precision: 10, scale:  7 }),
	longitude: numeric({ precision: 10, scale:  7 }),
	hideExactLocation: boolean("hide_exact_location").default(false),
	shippingAvailable: boolean("shipping_available").default(true),
	localPickupAvailable: boolean("local_pickup_available").default(false),
	shippingCost: numeric("shipping_cost", { precision: 10, scale:  2 }),
	freeShipping: boolean("free_shipping").default(false),
	shippingNotes: text("shipping_notes"),
	status: varchar({ length: 50 }).default('draft'),
	isAvailableForSale: boolean("is_available_for_sale").default(true),
	soldAt: timestamp("sold_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	submittedForReviewAt: timestamp("submitted_for_review_at", { mode: 'string' }),
	reviewStatus: varchar("review_status", { length: 50 }),
	reviewedBy: integer("reviewed_by"),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
	reviewNotes: text("review_notes"),
	rejectionReason: text("rejection_reason"),
	listingType: varchar("listing_type", { length: 50 }).default('fixed_price'),
	auctionStartsAt: timestamp("auction_starts_at", { mode: 'string' }),
	auctionEndsAt: timestamp("auction_ends_at", { mode: 'string' }),
	views: integer().default(0),
	watchCount: integer("watch_count").default(0),
	offerCount: integer("offer_count").default(0),
	autoRenew: boolean("auto_renew").default(false),
	featured: boolean().default(false),
	featuredUntil: timestamp("featured_until", { mode: 'string' }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	lastBumpedAt: timestamp("last_bumped_at", { mode: 'string' }),
	buildId: integer("build_id"),
	listId: text("list_id").default(sql`(\'#LST\'::text || lpad((nextval(\'part_hash_id_seq\'::regclass))::text, 4, \'0\'::text))`).notNull(),
}, (table) => [
	index("listing_available_idx").using("btree", table.isAvailableForSale.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("bool_ops")),
	index("listing_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("listing_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index("listing_location_idx").using("btree", table.latitude.asc().nullsLast().op("numeric_ops"), table.longitude.asc().nullsLast().op("numeric_ops")),
	index("listing_part_idx").using("btree", table.partId.asc().nullsLast().op("int4_ops")),
	index("listing_price_idx").using("btree", table.price.asc().nullsLast().op("numeric_ops")),
	index("listing_review_status_idx").using("btree", table.reviewStatus.asc().nullsLast().op("text_ops")),
	index("listing_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("listing_user_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("listing_variant_idx").using("btree", table.variantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.buildId],
			foreignColumns: [builds.id],
			name: "listings_build_id_builds_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.partId],
			foreignColumns: [parts.id],
			name: "listings_part_id_parts_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.reviewedBy],
			foreignColumns: [users.id],
			name: "listings_reviewed_by_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "listings_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.variantId],
			foreignColumns: [variants.id],
			name: "listings_variant_id_variants_id_fk"
		}).onDelete("set null"),
	unique("listings_slug_unique").on(table.slug),
]);

export const moderationQueue = pgTable("moderation_queue", {
	id: serial().primaryKey().notNull(),
	partId: integer("part_id").notNull(),
	reason: varchar({ length: 100 }).notNull(),
	reasonLabel: varchar("reason_label", { length: 255 }).notNull(),
	severity: varchar({ length: 20 }).notNull(),
	notes: text(),
	status: varchar({ length: 20 }).default('review').notNull(),
	flaggedBy: varchar("flagged_by", { length: 255 }).notNull(),
	flaggedByUserId: integer("flagged_by_user_id"),
	flaggedAt: timestamp("flagged_at", { mode: 'string' }).defaultNow().notNull(),
	reviewedBy: varchar("reviewed_by", { length: 255 }),
	reviewedByUserId: integer("reviewed_by_user_id"),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
	reviewNotes: text("review_notes"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("moderation_flagged_at_idx").using("btree", table.flaggedAt.asc().nullsLast().op("timestamp_ops")),
	index("moderation_part_idx").using("btree", table.partId.asc().nullsLast().op("int4_ops")),
	index("moderation_severity_idx").using("btree", table.severity.asc().nullsLast().op("text_ops")),
	index("moderation_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.flaggedByUserId],
			foreignColumns: [users.id],
			name: "moderation_queue_flagged_by_user_id_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.partId],
			foreignColumns: [parts.id],
			name: "moderation_queue_part_id_parts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reviewedByUserId],
			foreignColumns: [users.id],
			name: "moderation_queue_reviewed_by_user_id_users_id_fk"
		}).onDelete("set null"),
]);

export const carModelTypes = pgTable("car_model_types", {
	id: serial().primaryKey().notNull(),
	modelId: integer("model_id").notNull(),
	name: text().notNull(),
	status: varchar({ length: 255 }).default('active').notNull(),
	imageMediaId: integer("image_media_id"),
	description: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_car_model_types_model_id").using("btree", table.modelId.asc().nullsLast().op("int4_ops")),
	index("idx_car_model_types_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_car_model_types_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.imageMediaId],
			foreignColumns: [media.id],
			name: "car_model_types_image_media_id_media_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.modelId],
			foreignColumns: [carModels.id],
			name: "car_model_types_model_id_car_models_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const carModels = pgTable("car_models", {
	id: serial().primaryKey().notNull(),
	brandId: integer("brand_id").notNull(),
	name: varchar({ length: 128 }).notNull(),
	status: varchar({ length: 255 }).default('active').notNull(),
	imageMediaId: integer("image_media_id"),
	description: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_car_models_brand_id").using("btree", table.brandId.asc().nullsLast().op("int4_ops")),
	index("idx_car_models_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_car_models_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [carBrands.id],
			name: "car_models_brand_id_car_brands_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.imageMediaId],
			foreignColumns: [media.id],
			name: "car_models_image_media_id_media_id_fk"
		}).onDelete("set null"),
]);

export const listingPriceStats = pgTable("listing_price_stats", {
	id: serial().primaryKey().notNull(),
	listingId: integer("listing_id").notNull(),
	year: integer().notNull(),
	month: integer().notNull(),
	averagePrice: numeric("average_price", { precision: 12, scale:  2 }),
	minPrice: numeric("min_price", { precision: 12, scale:  2 }),
	maxPrice: numeric("max_price", { precision: 12, scale:  2 }),
	priceChangeCount: integer("price_change_count").default(0),
	offerCount: integer("offer_count").default(0),
	averageOffer: numeric("average_offer", { precision: 12, scale:  2 }),
	viewCount: integer("view_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("price_stats_listing_idx").using("btree", table.listingId.asc().nullsLast().op("int4_ops")),
	index("price_stats_period_idx").using("btree", table.year.asc().nullsLast().op("int4_ops"), table.month.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.listingId],
			foreignColumns: [listings.id],
			name: "listing_price_stats_listing_id_listings_id_fk"
		}).onDelete("cascade"),
	unique("price_stats_unique").on(table.listingId, table.year, table.month),
]);

export const options = pgTable("options", {
	id: serial().primaryKey().notNull(),
	partId: integer("part_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	displayOrder: integer("display_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("option_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
	index("option_part_idx").using("btree", table.partId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.partId],
			foreignColumns: [parts.id],
			name: "options_part_id_parts_id_fk"
		}).onDelete("cascade"),
]);

export const variants = pgTable("variants", {
	id: serial().primaryKey().notNull(),
	partId: integer("part_id").notNull(),
	title: varchar({ length: 500 }).notNull(),
	sku: varchar({ length: 255 }),
	barcode: varchar({ length: 255 }),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	compareAtPrice: numeric("compare_at_price", { precision: 10, scale:  2 }),
	quantity: integer().default(0),
	weight: numeric({ precision: 10, scale:  3 }),
	weightUnit: varchar("weight_unit", { length: 10 }).default('kg'),
	requiresShipping: boolean("requires_shipping").default(true),
	taxable: boolean().default(true),
	inventoryTracking: boolean("inventory_tracking").default(true),
	displayOrder: integer("display_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	option1: varchar({ length: 255 }),
	option2: varchar({ length: 255 }),
	option3: varchar({ length: 255 }),
	option1Label: varchar({ length: 255 }),
	option2Label: varchar({ length: 255 }),
	option3Label: varchar({ length: 255 }),
}, (table) => [
	index("variant_barcode_idx").using("btree", table.barcode.asc().nullsLast().op("text_ops")),
	index("variant_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
	index("variant_part_idx").using("btree", table.partId.asc().nullsLast().op("int4_ops")),
	index("variant_sku_idx").using("btree", table.sku.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.partId],
			foreignColumns: [parts.id],
			name: "variants_part_id_parts_id_fk"
		}).onDelete("cascade"),
	unique("variants_sku_unique").on(table.sku),
]);

export const manufacturers = pgTable("manufacturers", {
	id: serial().primaryKey().notNull(),
	imageMediaId: integer("image_media_id"),
	description: varchar({ length: 255 }),
	name: varchar({ length: 255 }).notNull(),
	subtitle: varchar({ length: 255 }),
	status: varchar({ length: 255 }).default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	logoMediaId: integer("logo_media_id"),
}, (table) => [
	index("idx_manufacturers_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_manufacturers_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.imageMediaId],
			foreignColumns: [media.id],
			name: "manufacturers_image_media_id_media_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.logoMediaId],
			foreignColumns: [media.id],
			name: "manufacturers_logo_media_id_media_id_fk"
		}).onDelete("set null"),
]);

export const partShipping = pgTable("part_shipping", {
	id: serial().primaryKey().notNull(),
	partId: integer("part_id").notNull(),
	shippingProfileId: integer("shipping_profile_id"),
	width: numeric({ precision: 10, scale:  2 }),
	height: numeric({ precision: 10, scale:  2 }),
	length: numeric({ precision: 10, scale:  2 }),
	dimensionUnit: varchar("dimension_unit", { length: 10 }).default('cm'),
	shippingClass: varchar("shipping_class", { length: 100 }),
	originZipCode: varchar("origin_zip_code", { length: 20 }),
	processingTime: integer("processing_time"),
	customsDescription: text("customs_description"),
	customsHsCode: varchar("customs_hs_code", { length: 20 }),
	customsValue: numeric("customs_value", { precision: 10, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("part_shipping_part_idx").using("btree", table.partId.asc().nullsLast().op("int4_ops")),
	index("part_shipping_profile_idx").using("btree", table.shippingProfileId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.partId],
			foreignColumns: [parts.id],
			name: "part_shipping_part_id_parts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.shippingProfileId],
			foreignColumns: [shippingProfiles.id],
			name: "part_shipping_shipping_profile_id_shipping_profiles_id_fk"
		}).onDelete("set null"),
	unique("part_shipping_part_id_unique").on(table.partId),
]);

export const partMedia = pgTable("part_media", {
	id: serial().primaryKey().notNull(),
	partId: integer("part_id").notNull(),
	mediaId: integer("media_id"),
	order: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("part_media_idx").using("btree", table.partId.asc().nullsLast().op("int4_ops"), table.mediaId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.mediaId],
			foreignColumns: [media.id],
			name: "part_media_media_id_media_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.partId],
			foreignColumns: [parts.id],
			name: "part_media_part_id_parts_id_fk"
		}).onDelete("cascade"),
]);

export const optionValues = pgTable("option_values", {
	id: serial().primaryKey().notNull(),
	optionId: integer("option_id").notNull(),
	value: varchar({ length: 255 }).notNull(),
	displayOrder: integer("display_order").default(0),
}, (table) => [
	index("option_value_option_idx").using("btree", table.optionId.asc().nullsLast().op("int4_ops")),
	index("option_value_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.optionId],
			foreignColumns: [options.id],
			name: "option_values_option_id_options_id_fk"
		}).onDelete("cascade"),
]);

export const metafieldOptions = pgTable("metafield_options", {
	id: serial().primaryKey().notNull(),
	metafieldDefinitionId: integer("metafield_definition_id").notNull(),
	value: varchar({ length: 255 }).notNull(),
	label: varchar({ length: 255 }).notNull(),
	color: varchar({ length: 7 }),
	icon: varchar({ length: 100 }),
	metadata: jsonb(),
	isDefault: boolean("is_default").default(false),
	isActive: boolean("is_active").default(true),
	displayOrder: integer("display_order").default(0),
}, (table) => [
	index("metafield_option_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("metafield_option_def_idx").using("btree", table.metafieldDefinitionId.asc().nullsLast().op("int4_ops")),
	index("metafield_option_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.metafieldDefinitionId],
			foreignColumns: [metafieldDefinitions.id],
			name: "metafield_options_metafield_definition_id_metafield_definitions"
		}).onDelete("cascade"),
]);

export const metafields = pgTable("metafields", {
	id: serial().primaryKey().notNull(),
	entityType: varchar("entity_type", { length: 50 }).notNull(),
	entityId: integer("entity_id").notNull(),
	metafieldDefinitionId: integer("metafield_definition_id").notNull(),
	valueText: text("value_text"),
	valueNumber: numeric("value_number", { precision: 20, scale:  6 }),
	valueInteger: integer("value_integer"),
	valueBoolean: boolean("value_boolean"),
	valueDate: timestamp("value_date", { mode: 'string' }),
	valueJson: jsonb("value_json"),
	selectedOptions: jsonb("selected_options"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("metafield_def_idx").using("btree", table.metafieldDefinitionId.asc().nullsLast().op("int4_ops")),
	index("metafield_entity_idx").using("btree", table.entityType.asc().nullsLast().op("int4_ops"), table.entityId.asc().nullsLast().op("int4_ops")),
	index("metafield_value_boolean_idx").using("btree", table.valueBoolean.asc().nullsLast().op("bool_ops")),
	index("metafield_value_date_idx").using("btree", table.valueDate.asc().nullsLast().op("timestamp_ops")),
	index("metafield_value_integer_idx").using("btree", table.valueInteger.asc().nullsLast().op("int4_ops")),
	index("metafield_value_number_idx").using("btree", table.valueNumber.asc().nullsLast().op("numeric_ops")),
	index("metafield_value_text_idx").using("btree", table.valueText.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.metafieldDefinitionId],
			foreignColumns: [metafieldDefinitions.id],
			name: "metafields_metafield_definition_id_metafield_definitions_id_fk"
		}).onDelete("cascade"),
	unique("metafield_unique").on(table.entityType, table.entityId, table.metafieldDefinitionId),
]);

export const additionalDetails = pgTable("additional_details", {
	id: serial().primaryKey().notNull(),
	partId: integer("part_id").notNull(),
	heading: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	displayOrder: integer("display_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("additional_details_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
	index("additional_details_part_idx").using("btree", table.partId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.partId],
			foreignColumns: [parts.id],
			name: "additional_details_part_id_parts_id_fk"
		}).onDelete("cascade"),
]);

export const demandNotifications = pgTable("demand_notifications", {
	id: serial().primaryKey().notNull(),
	partId: integer("part_id").notNull(),
	userId: integer("user_id").notNull(),
	email: varchar({ length: 255 }).notNull(),
	notified: boolean().default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	notifiedAt: timestamp("notified_at", { mode: 'string' }),
}, (table) => [
	index("demand_notification_notified_idx").using("btree", table.notified.asc().nullsLast().op("bool_ops")),
	index("demand_notification_part_idx").using("btree", table.partId.asc().nullsLast().op("int4_ops")),
	index("demand_notification_part_user_idx").using("btree", table.partId.asc().nullsLast().op("int4_ops"), table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.partId],
			foreignColumns: [parts.id],
			name: "demand_notifications_part_id_parts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "demand_notifications_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const partInteractions = pgTable("part_interactions", {
	id: serial().primaryKey().notNull(),
	partId: integer("part_id").notNull(),
	userId: integer("user_id"),
	sessionId: varchar("session_id", { length: 255 }),
	interactionType: varchar("interaction_type", { length: 50 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("part_interaction_date_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("part_interaction_part_idx").using("btree", table.partId.asc().nullsLast().op("int4_ops")),
	index("part_interaction_session_idx").using("btree", table.sessionId.asc().nullsLast().op("text_ops")),
	index("part_interaction_type_idx").using("btree", table.interactionType.asc().nullsLast().op("text_ops")),
	index("part_interaction_user_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.partId],
			foreignColumns: [parts.id],
			name: "part_interactions_part_id_parts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "part_interactions_user_id_users_id_fk"
		}).onDelete("set null"),
]);

export const partCategories = pgTable("part_categories", {
	partId: integer("part_id").notNull(),
	categoryId: integer("category_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "part_categories_category_id_categories_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.partId],
			foreignColumns: [parts.id],
			name: "part_categories_part_id_parts_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.partId, table.categoryId], name: "part_categories_part_id_category_id_pk"}),
]);

export const metafieldDefinitionCategories = pgTable("metafield_definition_categories", {
	metafieldDefinitionId: integer("metafield_definition_id").notNull(),
	categoryId: integer("category_id").notNull(),
	isRequired: boolean("is_required"),
	displayOrder: integer("display_order"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("metafield_def_cat_category_idx").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("metafield_def_cat_metafield_idx").using("btree", table.metafieldDefinitionId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "metafield_definition_categories_category_id_categories_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.metafieldDefinitionId],
			foreignColumns: [metafieldDefinitions.id],
			name: "metafield_definition_categories_metafield_definition_id_metafie"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.metafieldDefinitionId, table.categoryId], name: "metafield_definition_categories_metafield_definition_id_categor"}),
]);
