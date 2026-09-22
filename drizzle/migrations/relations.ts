import { relations } from "drizzle-orm/relations";
import { users, usernameHistory, userActivities, media, adminBlockUser, userOnlineHistory, addresses, builds, conversations, conversationMembers, conversationsMessages, conversationsMessageAttachments, shippingProfiles, shippingRates, listings, listingWatchlist, follows, carBrands, carModels, carModelTypes, wishlistItems, wishlistCategories, parts, adminSuspendedUser, categories, listingOffers, listingPriceHistory, userSocialMedia, listingQuestions, listingReviews, listingTransactions, seoMeta, notificationQueue, notificationSettings, notifications, metafieldDefinitions, wishlistPriceAlerts, manufacturers, userReports, userBlocks, variants, moderationQueue, listingPriceStats, options, partShipping, partMedia, optionValues, metafieldOptions, metafields, additionalDetails, demandNotifications, partInteractions, partCategories, metafieldDefinitionCategories } from "./schema";

export const usernameHistoryRelations = relations(usernameHistory, ({one}) => ({
	user: one(users, {
		fields: [usernameHistory.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	usernameHistories: many(usernameHistory),
	userActivities: many(userActivities),
	media: many(media),
	adminBlockUsers_adminId: many(adminBlockUser, {
		relationName: "adminBlockUser_adminId_users_id"
	}),
	adminBlockUsers_userId: many(adminBlockUser, {
		relationName: "adminBlockUser_userId_users_id"
	}),
	userOnlineHistories: many(userOnlineHistory),
	addresses: many(addresses),
	conversations: many(conversations),
	conversationMembers: many(conversationMembers),
	conversationsMessages: many(conversationsMessages),
	listingWatchlists: many(listingWatchlist),
	follows_followerId: many(follows, {
		relationName: "follows_followerId_users_id"
	}),
	follows_followingId: many(follows, {
		relationName: "follows_followingId_users_id"
	}),
	builds: many(builds),
	wishlistItems_bookmarkedUserId: many(wishlistItems, {
		relationName: "wishlistItems_bookmarkedUserId_users_id"
	}),
	wishlistItems_userId: many(wishlistItems, {
		relationName: "wishlistItems_userId_users_id"
	}),
	adminSuspendedUsers_adminId: many(adminSuspendedUser, {
		relationName: "adminSuspendedUser_adminId_users_id"
	}),
	adminSuspendedUsers_userId: many(adminSuspendedUser, {
		relationName: "adminSuspendedUser_userId_users_id"
	}),
	categories: many(categories),
	listingOffers: many(listingOffers),
	listingPriceHistories: many(listingPriceHistory),
	userSocialMedias: many(userSocialMedia),
	listingQuestions_answeredBy: many(listingQuestions, {
		relationName: "listingQuestions_answeredBy_users_id"
	}),
	listingQuestions_askedBy: many(listingQuestions, {
		relationName: "listingQuestions_askedBy_users_id"
	}),
	listingReviews: many(listingReviews),
	listingTransactions: many(listingTransactions),
	wishlistCategories: many(wishlistCategories),
	notificationQueues: many(notificationQueue),
	notificationSettings: many(notificationSettings),
	notifications_fromUserId: many(notifications, {
		relationName: "notifications_fromUserId_users_id"
	}),
	notifications_userId: many(notifications, {
		relationName: "notifications_userId_users_id"
	}),
	metafieldDefinitions: many(metafieldDefinitions),
	wishlistPriceAlerts: many(wishlistPriceAlerts),
	parts: many(parts),
	userReports_reportedUserId: many(userReports, {
		relationName: "userReports_reportedUserId_users_id"
	}),
	userReports_reporterUserId: many(userReports, {
		relationName: "userReports_reporterUserId_users_id"
	}),
	userReports_reviewedBy: many(userReports, {
		relationName: "userReports_reviewedBy_users_id"
	}),
	userBlocks_blockedUserId: many(userBlocks, {
		relationName: "userBlocks_blockedUserId_users_id"
	}),
	userBlocks_blockerUserId: many(userBlocks, {
		relationName: "userBlocks_blockerUserId_users_id"
	}),
	listings_reviewedBy: many(listings, {
		relationName: "listings_reviewedBy_users_id"
	}),
	listings_userId: many(listings, {
		relationName: "listings_userId_users_id"
	}),
	moderationQueues_flaggedByUserId: many(moderationQueue, {
		relationName: "moderationQueue_flaggedByUserId_users_id"
	}),
	moderationQueues_reviewedByUserId: many(moderationQueue, {
		relationName: "moderationQueue_reviewedByUserId_users_id"
	}),
	demandNotifications: many(demandNotifications),
	partInteractions: many(partInteractions),
}));

export const userActivitiesRelations = relations(userActivities, ({one}) => ({
	user: one(users, {
		fields: [userActivities.userId],
		references: [users.id]
	}),
}));

export const mediaRelations = relations(media, ({one, many}) => ({
	user: one(users, {
		fields: [media.userId],
		references: [users.id]
	}),
	categories: many(categories),
	wishlistCategories: many(wishlistCategories),
	userReports: many(userReports),
	carBrands_imageMediaId: many(carBrands, {
		relationName: "carBrands_imageMediaId_media_id"
	}),
	carBrands_logoMediaId: many(carBrands, {
		relationName: "carBrands_logoMediaId_media_id"
	}),
	carModelTypes: many(carModelTypes),
	carModels: many(carModels),
	manufacturers_imageMediaId: many(manufacturers, {
		relationName: "manufacturers_imageMediaId_media_id"
	}),
	manufacturers_logoMediaId: many(manufacturers, {
		relationName: "manufacturers_logoMediaId_media_id"
	}),
	partMedias: many(partMedia),
}));

export const adminBlockUserRelations = relations(adminBlockUser, ({one}) => ({
	user_adminId: one(users, {
		fields: [adminBlockUser.adminId],
		references: [users.id],
		relationName: "adminBlockUser_adminId_users_id"
	}),
	user_userId: one(users, {
		fields: [adminBlockUser.userId],
		references: [users.id],
		relationName: "adminBlockUser_userId_users_id"
	}),
}));

export const userOnlineHistoryRelations = relations(userOnlineHistory, ({one}) => ({
	user: one(users, {
		fields: [userOnlineHistory.userId],
		references: [users.id]
	}),
}));

export const addressesRelations = relations(addresses, ({one}) => ({
	user: one(users, {
		fields: [addresses.userId],
		references: [users.id]
	}),
	build: one(builds, {
		fields: [addresses.vehicleId],
		references: [builds.id]
	}),
}));

export const buildsRelations = relations(builds, ({one, many}) => ({
	addresses: many(addresses),
	carBrand: one(carBrands, {
		fields: [builds.brandId],
		references: [carBrands.id]
	}),
	carModel: one(carModels, {
		fields: [builds.modelId],
		references: [carModels.id]
	}),
	carModelType: one(carModelTypes, {
		fields: [builds.typeId],
		references: [carModelTypes.id]
	}),
	user: one(users, {
		fields: [builds.userId],
		references: [users.id]
	}),
	wishlistItems: many(wishlistItems),
	notifications: many(notifications),
	listings: many(listings),
}));

export const conversationsRelations = relations(conversations, ({one, many}) => ({
	user: one(users, {
		fields: [conversations.createdBy],
		references: [users.id]
	}),
	conversationMembers: many(conversationMembers),
	conversationsMessages: many(conversationsMessages),
}));

export const conversationMembersRelations = relations(conversationMembers, ({one}) => ({
	conversation: one(conversations, {
		fields: [conversationMembers.conversationId],
		references: [conversations.id]
	}),
	user: one(users, {
		fields: [conversationMembers.userId],
		references: [users.id]
	}),
}));

export const conversationsMessagesRelations = relations(conversationsMessages, ({one, many}) => ({
	conversation: one(conversations, {
		fields: [conversationsMessages.conversationId],
		references: [conversations.id]
	}),
	user: one(users, {
		fields: [conversationsMessages.senderId],
		references: [users.id]
	}),
	conversationsMessageAttachments: many(conversationsMessageAttachments),
}));

export const conversationsMessageAttachmentsRelations = relations(conversationsMessageAttachments, ({one}) => ({
	conversationsMessage: one(conversationsMessages, {
		fields: [conversationsMessageAttachments.messageId],
		references: [conversationsMessages.id]
	}),
}));

export const shippingRatesRelations = relations(shippingRates, ({one}) => ({
	shippingProfile: one(shippingProfiles, {
		fields: [shippingRates.shippingProfileId],
		references: [shippingProfiles.id]
	}),
}));

export const shippingProfilesRelations = relations(shippingProfiles, ({many}) => ({
	shippingRates: many(shippingRates),
	partShippings: many(partShipping),
}));

export const listingWatchlistRelations = relations(listingWatchlist, ({one}) => ({
	listing: one(listings, {
		fields: [listingWatchlist.listingId],
		references: [listings.id]
	}),
	user: one(users, {
		fields: [listingWatchlist.userId],
		references: [users.id]
	}),
}));

export const listingsRelations = relations(listings, ({one, many}) => ({
	listingWatchlists: many(listingWatchlist),
	wishlistItems: many(wishlistItems),
	listingOffers: many(listingOffers),
	listingPriceHistories: many(listingPriceHistory),
	listingQuestions: many(listingQuestions),
	listingReviews: many(listingReviews),
	listingTransactions: many(listingTransactions),
	notifications: many(notifications),
	build: one(builds, {
		fields: [listings.buildId],
		references: [builds.id]
	}),
	part: one(parts, {
		fields: [listings.partId],
		references: [parts.id]
	}),
	user_reviewedBy: one(users, {
		fields: [listings.reviewedBy],
		references: [users.id],
		relationName: "listings_reviewedBy_users_id"
	}),
	user_userId: one(users, {
		fields: [listings.userId],
		references: [users.id],
		relationName: "listings_userId_users_id"
	}),
	variant: one(variants, {
		fields: [listings.variantId],
		references: [variants.id]
	}),
	listingPriceStats: many(listingPriceStats),
}));

export const followsRelations = relations(follows, ({one}) => ({
	user_followerId: one(users, {
		fields: [follows.followerId],
		references: [users.id],
		relationName: "follows_followerId_users_id"
	}),
	user_followingId: one(users, {
		fields: [follows.followingId],
		references: [users.id],
		relationName: "follows_followingId_users_id"
	}),
}));

export const carBrandsRelations = relations(carBrands, ({one, many}) => ({
	builds: many(builds),
	parts: many(parts),
	media_imageMediaId: one(media, {
		fields: [carBrands.imageMediaId],
		references: [media.id],
		relationName: "carBrands_imageMediaId_media_id"
	}),
	media_logoMediaId: one(media, {
		fields: [carBrands.logoMediaId],
		references: [media.id],
		relationName: "carBrands_logoMediaId_media_id"
	}),
	carModels: many(carModels),
}));

export const carModelsRelations = relations(carModels, ({one, many}) => ({
	builds: many(builds),
	parts: many(parts),
	carModelTypes: many(carModelTypes),
	carBrand: one(carBrands, {
		fields: [carModels.brandId],
		references: [carBrands.id]
	}),
	media: one(media, {
		fields: [carModels.imageMediaId],
		references: [media.id]
	}),
}));

export const carModelTypesRelations = relations(carModelTypes, ({one, many}) => ({
	builds: many(builds),
	parts: many(parts),
	media: one(media, {
		fields: [carModelTypes.imageMediaId],
		references: [media.id]
	}),
	carModel: one(carModels, {
		fields: [carModelTypes.modelId],
		references: [carModels.id]
	}),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({one, many}) => ({
	user_bookmarkedUserId: one(users, {
		fields: [wishlistItems.bookmarkedUserId],
		references: [users.id],
		relationName: "wishlistItems_bookmarkedUserId_users_id"
	}),
	build: one(builds, {
		fields: [wishlistItems.buildId],
		references: [builds.id]
	}),
	wishlistCategory: one(wishlistCategories, {
		fields: [wishlistItems.categoryId],
		references: [wishlistCategories.id]
	}),
	listing: one(listings, {
		fields: [wishlistItems.listingId],
		references: [listings.id]
	}),
	part: one(parts, {
		fields: [wishlistItems.partId],
		references: [parts.id]
	}),
	user_userId: one(users, {
		fields: [wishlistItems.userId],
		references: [users.id],
		relationName: "wishlistItems_userId_users_id"
	}),
	wishlistPriceAlerts: many(wishlistPriceAlerts),
}));

export const wishlistCategoriesRelations = relations(wishlistCategories, ({one, many}) => ({
	wishlistItems: many(wishlistItems),
	media: one(media, {
		fields: [wishlistCategories.imageMediaId],
		references: [media.id]
	}),
	seoMeta: one(seoMeta, {
		fields: [wishlistCategories.seoId],
		references: [seoMeta.id]
	}),
	user: one(users, {
		fields: [wishlistCategories.userId],
		references: [users.id]
	}),
}));

export const partsRelations = relations(parts, ({one, many}) => ({
	wishlistItems: many(wishlistItems),
	notifications: many(notifications),
	carBrand: one(carBrands, {
		fields: [parts.brandId],
		references: [carBrands.id]
	}),
	manufacturer: one(manufacturers, {
		fields: [parts.manufacturerId],
		references: [manufacturers.id]
	}),
	carModel: one(carModels, {
		fields: [parts.modelId],
		references: [carModels.id]
	}),
	carModelType: one(carModelTypes, {
		fields: [parts.typeId],
		references: [carModelTypes.id]
	}),
	user: one(users, {
		fields: [parts.userId],
		references: [users.id]
	}),
	listings: many(listings),
	moderationQueues: many(moderationQueue),
	options: many(options),
	variants: many(variants),
	partShippings: many(partShipping),
	partMedias: many(partMedia),
	additionalDetails: many(additionalDetails),
	demandNotifications: many(demandNotifications),
	partInteractions: many(partInteractions),
	partCategories: many(partCategories),
}));

export const adminSuspendedUserRelations = relations(adminSuspendedUser, ({one}) => ({
	user_adminId: one(users, {
		fields: [adminSuspendedUser.adminId],
		references: [users.id],
		relationName: "adminSuspendedUser_adminId_users_id"
	}),
	user_userId: one(users, {
		fields: [adminSuspendedUser.userId],
		references: [users.id],
		relationName: "adminSuspendedUser_userId_users_id"
	}),
}));

export const categoriesRelations = relations(categories, ({one, many}) => ({
	media: one(media, {
		fields: [categories.coverImageId],
		references: [media.id]
	}),
	user: one(users, {
		fields: [categories.userId],
		references: [users.id]
	}),
	partCategories: many(partCategories),
	metafieldDefinitionCategories: many(metafieldDefinitionCategories),
}));

export const listingOffersRelations = relations(listingOffers, ({one, many}) => ({
	user: one(users, {
		fields: [listingOffers.buyerId],
		references: [users.id]
	}),
	listing: one(listings, {
		fields: [listingOffers.listingId],
		references: [listings.id]
	}),
	notifications: many(notifications),
}));

export const listingPriceHistoryRelations = relations(listingPriceHistory, ({one}) => ({
	user: one(users, {
		fields: [listingPriceHistory.changedBy],
		references: [users.id]
	}),
	listing: one(listings, {
		fields: [listingPriceHistory.listingId],
		references: [listings.id]
	}),
}));

export const userSocialMediaRelations = relations(userSocialMedia, ({one}) => ({
	user: one(users, {
		fields: [userSocialMedia.userId],
		references: [users.id]
	}),
}));

export const listingQuestionsRelations = relations(listingQuestions, ({one}) => ({
	user_answeredBy: one(users, {
		fields: [listingQuestions.answeredBy],
		references: [users.id],
		relationName: "listingQuestions_answeredBy_users_id"
	}),
	user_askedBy: one(users, {
		fields: [listingQuestions.askedBy],
		references: [users.id],
		relationName: "listingQuestions_askedBy_users_id"
	}),
	listing: one(listings, {
		fields: [listingQuestions.listingId],
		references: [listings.id]
	}),
}));

export const listingReviewsRelations = relations(listingReviews, ({one}) => ({
	listing: one(listings, {
		fields: [listingReviews.listingId],
		references: [listings.id]
	}),
	user: one(users, {
		fields: [listingReviews.reviewerId],
		references: [users.id]
	}),
}));

export const listingTransactionsRelations = relations(listingTransactions, ({one}) => ({
	listing: one(listings, {
		fields: [listingTransactions.listingId],
		references: [listings.id]
	}),
	user: one(users, {
		fields: [listingTransactions.userId],
		references: [users.id]
	}),
}));

export const seoMetaRelations = relations(seoMeta, ({many}) => ({
	wishlistCategories: many(wishlistCategories),
}));

export const notificationQueueRelations = relations(notificationQueue, ({one}) => ({
	user: one(users, {
		fields: [notificationQueue.userId],
		references: [users.id]
	}),
}));

export const notificationSettingsRelations = relations(notificationSettings, ({one}) => ({
	user: one(users, {
		fields: [notificationSettings.userId],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	build: one(builds, {
		fields: [notifications.buildId],
		references: [builds.id]
	}),
	user_fromUserId: one(users, {
		fields: [notifications.fromUserId],
		references: [users.id],
		relationName: "notifications_fromUserId_users_id"
	}),
	listing: one(listings, {
		fields: [notifications.listingId],
		references: [listings.id]
	}),
	listingOffer: one(listingOffers, {
		fields: [notifications.offerId],
		references: [listingOffers.id]
	}),
	part: one(parts, {
		fields: [notifications.partId],
		references: [parts.id]
	}),
	user_userId: one(users, {
		fields: [notifications.userId],
		references: [users.id],
		relationName: "notifications_userId_users_id"
	}),
}));

export const metafieldDefinitionsRelations = relations(metafieldDefinitions, ({one, many}) => ({
	user: one(users, {
		fields: [metafieldDefinitions.userId],
		references: [users.id]
	}),
	metafieldOptions: many(metafieldOptions),
	metafields: many(metafields),
	metafieldDefinitionCategories: many(metafieldDefinitionCategories),
}));

export const wishlistPriceAlertsRelations = relations(wishlistPriceAlerts, ({one}) => ({
	wishlistItem: one(wishlistItems, {
		fields: [wishlistPriceAlerts.itemId],
		references: [wishlistItems.id]
	}),
	user: one(users, {
		fields: [wishlistPriceAlerts.userId],
		references: [users.id]
	}),
}));

export const manufacturersRelations = relations(manufacturers, ({one, many}) => ({
	parts: many(parts),
	media_imageMediaId: one(media, {
		fields: [manufacturers.imageMediaId],
		references: [media.id],
		relationName: "manufacturers_imageMediaId_media_id"
	}),
	media_logoMediaId: one(media, {
		fields: [manufacturers.logoMediaId],
		references: [media.id],
		relationName: "manufacturers_logoMediaId_media_id"
	}),
}));

export const userReportsRelations = relations(userReports, ({one}) => ({
	media: one(media, {
		fields: [userReports.imageMediaId],
		references: [media.id]
	}),
	user_reportedUserId: one(users, {
		fields: [userReports.reportedUserId],
		references: [users.id],
		relationName: "userReports_reportedUserId_users_id"
	}),
	user_reporterUserId: one(users, {
		fields: [userReports.reporterUserId],
		references: [users.id],
		relationName: "userReports_reporterUserId_users_id"
	}),
	user_reviewedBy: one(users, {
		fields: [userReports.reviewedBy],
		references: [users.id],
		relationName: "userReports_reviewedBy_users_id"
	}),
}));

export const userBlocksRelations = relations(userBlocks, ({one}) => ({
	user_blockedUserId: one(users, {
		fields: [userBlocks.blockedUserId],
		references: [users.id],
		relationName: "userBlocks_blockedUserId_users_id"
	}),
	user_blockerUserId: one(users, {
		fields: [userBlocks.blockerUserId],
		references: [users.id],
		relationName: "userBlocks_blockerUserId_users_id"
	}),
}));

export const variantsRelations = relations(variants, ({one, many}) => ({
	listings: many(listings),
	part: one(parts, {
		fields: [variants.partId],
		references: [parts.id]
	}),
}));

export const moderationQueueRelations = relations(moderationQueue, ({one}) => ({
	user_flaggedByUserId: one(users, {
		fields: [moderationQueue.flaggedByUserId],
		references: [users.id],
		relationName: "moderationQueue_flaggedByUserId_users_id"
	}),
	part: one(parts, {
		fields: [moderationQueue.partId],
		references: [parts.id]
	}),
	user_reviewedByUserId: one(users, {
		fields: [moderationQueue.reviewedByUserId],
		references: [users.id],
		relationName: "moderationQueue_reviewedByUserId_users_id"
	}),
}));

export const listingPriceStatsRelations = relations(listingPriceStats, ({one}) => ({
	listing: one(listings, {
		fields: [listingPriceStats.listingId],
		references: [listings.id]
	}),
}));

export const optionsRelations = relations(options, ({one, many}) => ({
	part: one(parts, {
		fields: [options.partId],
		references: [parts.id]
	}),
	optionValues: many(optionValues),
}));

export const partShippingRelations = relations(partShipping, ({one}) => ({
	part: one(parts, {
		fields: [partShipping.partId],
		references: [parts.id]
	}),
	shippingProfile: one(shippingProfiles, {
		fields: [partShipping.shippingProfileId],
		references: [shippingProfiles.id]
	}),
}));

export const partMediaRelations = relations(partMedia, ({one}) => ({
	media: one(media, {
		fields: [partMedia.mediaId],
		references: [media.id]
	}),
	part: one(parts, {
		fields: [partMedia.partId],
		references: [parts.id]
	}),
}));

export const optionValuesRelations = relations(optionValues, ({one}) => ({
	option: one(options, {
		fields: [optionValues.optionId],
		references: [options.id]
	}),
}));

export const metafieldOptionsRelations = relations(metafieldOptions, ({one}) => ({
	metafieldDefinition: one(metafieldDefinitions, {
		fields: [metafieldOptions.metafieldDefinitionId],
		references: [metafieldDefinitions.id]
	}),
}));

export const metafieldsRelations = relations(metafields, ({one}) => ({
	metafieldDefinition: one(metafieldDefinitions, {
		fields: [metafields.metafieldDefinitionId],
		references: [metafieldDefinitions.id]
	}),
}));

export const additionalDetailsRelations = relations(additionalDetails, ({one}) => ({
	part: one(parts, {
		fields: [additionalDetails.partId],
		references: [parts.id]
	}),
}));

export const demandNotificationsRelations = relations(demandNotifications, ({one}) => ({
	part: one(parts, {
		fields: [demandNotifications.partId],
		references: [parts.id]
	}),
	user: one(users, {
		fields: [demandNotifications.userId],
		references: [users.id]
	}),
}));

export const partInteractionsRelations = relations(partInteractions, ({one}) => ({
	part: one(parts, {
		fields: [partInteractions.partId],
		references: [parts.id]
	}),
	user: one(users, {
		fields: [partInteractions.userId],
		references: [users.id]
	}),
}));

export const partCategoriesRelations = relations(partCategories, ({one}) => ({
	category: one(categories, {
		fields: [partCategories.categoryId],
		references: [categories.id]
	}),
	part: one(parts, {
		fields: [partCategories.partId],
		references: [parts.id]
	}),
}));

export const metafieldDefinitionCategoriesRelations = relations(metafieldDefinitionCategories, ({one}) => ({
	category: one(categories, {
		fields: [metafieldDefinitionCategories.categoryId],
		references: [categories.id]
	}),
	metafieldDefinition: one(metafieldDefinitions, {
		fields: [metafieldDefinitionCategories.metafieldDefinitionId],
		references: [metafieldDefinitions.id]
	}),
}));