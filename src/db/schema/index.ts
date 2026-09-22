import {
  addresses,
  AdminBlockedUser,
  addressesRelations,
  adminBlockUser,
  follows,
  userOnlineHistory,
  usernameHistory,
  users,
  usersRelations,
} from "./auth";
import { builds } from "./builds";
import { categories, categoriesRelations } from "./categories";
import {
  carBrands,
  carModelTypes,
  carModelTypesRelations,
  carModels,
  carModelsRelations,
  manufacturers,
} from "./default";
import {
  conversationMembers,
  messageAttachments,
  conversations,
  messageAttachmentsRelations,
  messages,
} from "./conversations";
import {
  listingOffers,
  listingPriceHistory,
  listingPriceStats,
  listingQuestions,
  listingReviews,
  listingTransactions,
  listingWatchlist,
  listings,
} from "./listings";
import { media } from "./media";
import {
  metafieldDefinitions,
  metafieldOptions,
  metafields,
  metafieldDefinitionCategories,
} from "./metafields";
import {
  notificationQueue,
  notificationSettings,
  notificationTemplates,
  notifications,
} from "./notifications";
import {
  optionValues,
  partCategories,
  partMedia,
  parts,
  proAdditionalDetails,
  productOptions,
  productVariants,
} from "./parts";
import { rateLimits } from "./rateLimits";
import { seoMeta } from "./seoMeta";
import { listSequence, partSequence, reportSequence } from "./sequence";
import { partShipping, shippingProfiles } from "./shipping";
import { shippingRates } from "./shippingRates";
import { userSocialMedia } from "./socialMedia";
import { userBlocks, userReports } from "./userBlocks";
import {
  wishlistCategories,
  wishlistItems,
  wishlistPriceAlerts,
} from "./wishlist";
export const schema = {
  addresses,
  AdminBlockedUser,
  addressesRelations,
  adminBlockUser,
  follows,
  userOnlineHistory,
  usernameHistory,
  users,
  usersRelations,
  builds,
  categories,
  categoriesRelations,
  conversationMembers,
  messageAttachments,
  conversations,
  messageAttachmentsRelations,
  messages,
  carBrands,
  carModelTypes,
  carModelTypesRelations,
  carModels,
  carModelsRelations,
  manufacturers,
  listingOffers,
  listingPriceHistory,
  listingPriceStats,
  listingQuestions,
  listingReviews,
  listingTransactions,
  listingWatchlist,
  listings,
  media,
  metafieldDefinitions,
  metafieldDefinitionCategories,
  metafieldOptions,
  metafields,
  notificationQueue,
  notificationSettings,
  notificationTemplates,
  notifications,
  optionValues,
  partCategories,
  partMedia,
  parts,
  proAdditionalDetails,
  productOptions,
  productVariants,
  rateLimits,
  seoMeta,
  listSequence,
  partSequence,
  reportSequence,
  partShipping,
  shippingProfiles,
  shippingRates,
  userSocialMedia,
  userBlocks,
  userReports,
  wishlistCategories,
  wishlistItems,
  wishlistPriceAlerts,
};
export type Database = typeof schema;
