CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"vehicle_id" integer NOT NULL,
	"address_line1" varchar(256) NOT NULL,
	"address_line2" varchar(256),
	"state" varchar(128),
	"postal_code" varchar(20),
	"type" text
);
--> statement-breakpoint
CREATE TABLE "blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"blocker_id" integer NOT NULL,
	"blocked_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "blocks_blocker_id_blocked_id_unique" UNIQUE("blocker_id","blocked_id")
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"profile_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "bookmarks_user_id_profile_id_unique" UNIQUE("user_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" integer,
	"following_id" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"username" varchar(255),
	"bio" text,
	"profile_image" text,
	"cover_image" text,
	"phone_number" varchar(20),
	"country_code" varchar(10),
	"password_token" varchar(255),
	"password_token_expire" timestamp,
	"role" varchar(100) DEFAULT 'user',
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_social_login" boolean DEFAULT false NOT NULL,
	"login_type" varchar DEFAULT 'Email' NOT NULL,
	"anonymous" boolean DEFAULT false,
	"trusted_seller" boolean DEFAULT false,
	"anonymousName" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "builds" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"brand_id" integer NOT NULL,
	"model_id" integer NOT NULL,
	"type_id" integer NOT NULL,
	"license_plate" varchar(32),
	"vin_number" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"bio" text,
	"cover_image" text,
	"parent_id" integer,
	"is_custom" boolean DEFAULT false,
	"user_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "car_brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"logo_media_id" integer,
	"image_media_id" integer,
	"description" varchar(255),
	"name" varchar(255) NOT NULL,
	"status" varchar(255) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "car_model_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_id" integer NOT NULL,
	"name" text NOT NULL,
	"image_media_id" integer,
	"description" varchar(255),
	"status" varchar(255) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "car_models" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_id" integer NOT NULL,
	"name" varchar(128) NOT NULL,
	"image_media_id" integer,
	"description" varchar(255),
	"status" varchar(255) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"buyer_id" integer NOT NULL,
	"offer_amount" numeric(12, 2) NOT NULL,
	"quantity" integer DEFAULT 1,
	"message" text,
	"status" varchar(50) DEFAULT 'pending',
	"counter_amount" numeric(12, 2),
	"counter_message" text,
	"expires_at" timestamp,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "listing_price_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"previous_price" numeric(12, 2),
	"new_price" numeric(12, 2) NOT NULL,
	"changed_by" integer,
	"change_reason" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "listing_price_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"average_price" numeric(12, 2),
	"min_price" numeric(12, 2),
	"max_price" numeric(12, 2),
	"price_change_count" integer DEFAULT 0,
	"offer_count" integer DEFAULT 0,
	"average_offer" numeric(12, 2),
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "price_stats_unique" UNIQUE("listing_id","year","month")
);
--> statement-breakpoint
CREATE TABLE "listing_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"asked_by" integer NOT NULL,
	"question" text NOT NULL,
	"answer" text,
	"answered_by" integer,
	"answered_at" timestamp,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "listing_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"reviewer_id" integer NOT NULL,
	"action" varchar(50) NOT NULL,
	"previous_status" varchar(50),
	"new_status" varchar(50),
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "listing_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"user_id" integer,
	"action" varchar(50) NOT NULL,
	"amount" numeric(12, 2),
	"quantity" integer DEFAULT 1,
	"previous_value" jsonb,
	"new_value" jsonb,
	"notes" text,
	"metadata" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "listing_watchlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"notify_price_drops" boolean DEFAULT true,
	"notify_back_in_stock" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "watchlist_unique" UNIQUE("listing_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer,
	"variant_id" integer,
	"user_id" integer NOT NULL,
	"title" varchar(500),
	"slug" varchar(500) NOT NULL,
	"description" text,
	"price" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"minimum_bid" numeric(12, 2),
	"buy_now_price" numeric(12, 2),
	"offer_notification_threshold" numeric(12, 2),
	"quantity" integer DEFAULT 1,
	"quantity_available" integer DEFAULT 1,
	"sku" varchar(255),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(2),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"hide_exact_location" boolean DEFAULT false,
	"shipping_available" boolean DEFAULT true,
	"local_pickup_available" boolean DEFAULT false,
	"shipping_cost" numeric(10, 2),
	"free_shipping" boolean DEFAULT false,
	"shipping_notes" text,
	"status" varchar(50) DEFAULT 'draft',
	"is_available_for_sale" boolean DEFAULT true,
	"sold_at" timestamp,
	"expires_at" timestamp,
	"submitted_for_review_at" timestamp,
	"review_status" varchar(50),
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"review_notes" text,
	"rejection_reason" text,
	"listing_type" varchar(50) DEFAULT 'fixed_price',
	"auction_starts_at" timestamp,
	"auction_ends_at" timestamp,
	"views" integer DEFAULT 0,
	"watch_count" integer DEFAULT 0,
	"offer_count" integer DEFAULT 0,
	"auto_renew" boolean DEFAULT false,
	"featured" boolean DEFAULT false,
	"featured_until" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"published_at" timestamp,
	"last_bumped_at" timestamp,
	CONSTRAINT "listings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"url" varchar(500) NOT NULL,
	"alt_text" varchar(500),
	"is_public" boolean DEFAULT true,
	"is_archived" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"user_id" integer,
	"size" varchar(500),
	"width" integer,
	"height" integer,
	"format" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "metafield_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"namespace" varchar(100) DEFAULT 'custom',
	"key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"validation_rules" jsonb,
	"default_value" text,
	"placeholder" varchar(255),
	"help_text" text,
	"is_required" boolean DEFAULT false,
	"is_searchable" boolean DEFAULT false,
	"is_public" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"settings" jsonb,
	"user_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "metafield_def_unique" UNIQUE("entity_type","namespace","key")
);
--> statement-breakpoint
CREATE TABLE "metafield_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"metafield_definition_id" integer NOT NULL,
	"value" varchar(255) NOT NULL,
	"label" varchar(255) NOT NULL,
	"color" varchar(7),
	"icon" varchar(100),
	"metadata" jsonb,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "metafields" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" integer NOT NULL,
	"metafield_definition_id" integer NOT NULL,
	"value_text" text,
	"value_number" numeric(20, 6),
	"value_integer" integer,
	"value_boolean" boolean,
	"value_date" timestamp,
	"value_json" jsonb,
	"selected_options" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "metafield_unique" UNIQUE("entity_type","entity_id","metafield_definition_id")
);
--> statement-breakpoint
CREATE TABLE "notification_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"data" jsonb NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"processed_at" timestamp,
	"status" varchar(20) DEFAULT 'pending',
	"attempts" integer DEFAULT 0,
	"last_error" text,
	"priority" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"notification_type" varchar(50) NOT NULL,
	"in_app" boolean DEFAULT true,
	"email" boolean DEFAULT true,
	"push" boolean DEFAULT true,
	"sms" boolean DEFAULT false,
	"frequency" varchar(20) DEFAULT 'instant',
	"preferred_time" varchar(5),
	"timezone" varchar(50) DEFAULT 'UTC',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "notification_settings_unique" UNIQUE("user_id","notification_type")
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"title_template" varchar(255),
	"message_template" text NOT NULL,
	"email_subject_template" varchar(255),
	"email_body_template" text,
	"push_template" text,
	"sms_template" varchar(500),
	"default_priority" varchar(20) DEFAULT 'normal',
	"default_category" varchar(50),
	"variables" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "notification_templates_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"title" varchar(255),
	"entity_type" varchar(50),
	"entity_id" integer,
	"from_user_id" integer,
	"part_id" integer,
	"listing_id" integer,
	"build_id" integer,
	"offer_id" integer,
	"priority" varchar(20) DEFAULT 'normal',
	"category" varchar(50),
	"action_url" varchar(500),
	"action_label" varchar(100),
	"metadata" jsonb,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"email_sent" boolean DEFAULT false,
	"email_sent_at" timestamp,
	"push_sent" boolean DEFAULT false,
	"push_sent_at" timestamp,
	"sms_sent" boolean DEFAULT false,
	"sms_sent_at" timestamp,
	"group_key" varchar(100),
	"group_count" integer DEFAULT 1,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "additional_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer NOT NULL,
	"heading" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "option_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"option_id" integer NOT NULL,
	"value" varchar(255) NOT NULL,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "options" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "part_categories" (
	"part_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "part_categories_part_id_category_id_pk" PRIMARY KEY("part_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'draft',
	"user_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "parts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "variant_options" (
	"variant_id" integer NOT NULL,
	"option_value_id" integer NOT NULL,
	CONSTRAINT "variant_options_variant_id_option_value_id_pk" PRIMARY KEY("variant_id","option_value_id")
);
--> statement-breakpoint
CREATE TABLE "variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"sku" varchar(255),
	"barcode" varchar(255),
	"price" numeric(10, 2) NOT NULL,
	"compare_at_price" numeric(10, 2),
	"cost_price" numeric(10, 2),
	"quantity" integer DEFAULT 0,
	"weight" numeric(10, 3),
	"weight_unit" varchar(10) DEFAULT 'kg',
	"requires_shipping" boolean DEFAULT true,
	"taxable" boolean DEFAULT true,
	"inventory_tracking" boolean DEFAULT true,
	"allow_backorder" boolean DEFAULT false,
	"option_values" jsonb,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "seo_meta" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" integer NOT NULL,
	"meta_title" varchar(255),
	"meta_description" text,
	"meta_keywords" text,
	"og_title" varchar(255),
	"og_description" text,
	"og_image" varchar(500),
	"canonical_url" varchar(500),
	"robots" varchar(100),
	"structured_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "part_shipping" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer NOT NULL,
	"shipping_profile_id" integer,
	"width" numeric(10, 2),
	"height" numeric(10, 2),
	"length" numeric(10, 2),
	"dimension_unit" varchar(10) DEFAULT 'cm',
	"shipping_class" varchar(100),
	"origin_zip_code" varchar(20),
	"processing_time" integer,
	"customs_description" text,
	"customs_hs_code" varchar(20),
	"customs_value" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "part_shipping_part_id_unique" UNIQUE("part_id")
);
--> statement-breakpoint
CREATE TABLE "shipping_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shipping_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"shipping_profile_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"carrier" varchar(100),
	"service" varchar(100),
	"base_price" numeric(10, 2) NOT NULL,
	"price_modifiers" jsonb,
	"estimated_days_min" integer,
	"estimated_days_max" integer,
	"zones" jsonb,
	"conditions" jsonb,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "user_social_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "social_type" NOT NULL,
	"link" text NOT NULL,
	CONSTRAINT "uniq_user_type" UNIQUE("user_id","type")
);
--> statement-breakpoint
CREATE TABLE "wishlist_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"image" varchar(512),
	"is_default" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"item_count" integer DEFAULT 0,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wishlist_categories_unique_user_slug" UNIQUE("user_id","slug")
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"entity_type" varchar(50),
	"entity_id" integer,
	"part_id" integer,
	"listing_id" integer,
	"build_id" integer,
	"is_alert_on" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wishlist_items_unique_entity" UNIQUE("category_id","entity_type","entity_id")
);
--> statement-breakpoint
CREATE TABLE "wishlist_price_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"previous_price" numeric(12, 2),
	"current_price" numeric(12, 2),
	"target_price" numeric(12, 2),
	"is_read" boolean DEFAULT false,
	"notification_sent" boolean DEFAULT false,
	"notification_method" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"read_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_vehicle_id_builds_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."builds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocker_id_users_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocked_id_users_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_profile_id_users_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "builds" ADD CONSTRAINT "builds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "builds" ADD CONSTRAINT "builds_brand_id_car_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."car_brands"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "builds" ADD CONSTRAINT "builds_model_id_car_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."car_models"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "builds" ADD CONSTRAINT "builds_type_id_car_model_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."car_model_types"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_brands" ADD CONSTRAINT "car_brands_logo_media_id_media_id_fk" FOREIGN KEY ("logo_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_brands" ADD CONSTRAINT "car_brands_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_model_types" ADD CONSTRAINT "car_model_types_model_id_car_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."car_models"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "car_model_types" ADD CONSTRAINT "car_model_types_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_models" ADD CONSTRAINT "car_models_brand_id_car_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."car_brands"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "car_models" ADD CONSTRAINT "car_models_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_offers" ADD CONSTRAINT "listing_offers_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_offers" ADD CONSTRAINT "listing_offers_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_price_history" ADD CONSTRAINT "listing_price_history_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_price_history" ADD CONSTRAINT "listing_price_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_price_stats" ADD CONSTRAINT "listing_price_stats_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_questions" ADD CONSTRAINT "listing_questions_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_questions" ADD CONSTRAINT "listing_questions_asked_by_users_id_fk" FOREIGN KEY ("asked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_questions" ADD CONSTRAINT "listing_questions_answered_by_users_id_fk" FOREIGN KEY ("answered_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_reviews" ADD CONSTRAINT "listing_reviews_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_reviews" ADD CONSTRAINT "listing_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_transactions" ADD CONSTRAINT "listing_transactions_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_transactions" ADD CONSTRAINT "listing_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_watchlist" ADD CONSTRAINT "listing_watchlist_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_watchlist" ADD CONSTRAINT "listing_watchlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metafield_definitions" ADD CONSTRAINT "metafield_definitions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metafield_options" ADD CONSTRAINT "metafield_options_metafield_definition_id_metafield_definitions_id_fk" FOREIGN KEY ("metafield_definition_id") REFERENCES "public"."metafield_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metafields" ADD CONSTRAINT "metafields_metafield_definition_id_metafield_definitions_id_fk" FOREIGN KEY ("metafield_definition_id") REFERENCES "public"."metafield_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_queue" ADD CONSTRAINT "notification_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_build_id_builds_id_fk" FOREIGN KEY ("build_id") REFERENCES "public"."builds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_offer_id_listing_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."listing_offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "additional_details" ADD CONSTRAINT "additional_details_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_values" ADD CONSTRAINT "option_values_option_id_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "options" ADD CONSTRAINT "options_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_categories" ADD CONSTRAINT "part_categories_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_categories" ADD CONSTRAINT "part_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_options" ADD CONSTRAINT "variant_options_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_options" ADD CONSTRAINT "variant_options_option_value_id_option_values_id_fk" FOREIGN KEY ("option_value_id") REFERENCES "public"."option_values"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_shipping" ADD CONSTRAINT "part_shipping_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_shipping" ADD CONSTRAINT "part_shipping_shipping_profile_id_shipping_profiles_id_fk" FOREIGN KEY ("shipping_profile_id") REFERENCES "public"."shipping_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_shipping_profile_id_shipping_profiles_id_fk" FOREIGN KEY ("shipping_profile_id") REFERENCES "public"."shipping_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_social_media" ADD CONSTRAINT "user_social_media_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_categories" ADD CONSTRAINT "wishlist_categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_category_id_wishlist_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."wishlist_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_build_id_builds_id_fk" FOREIGN KEY ("build_id") REFERENCES "public"."builds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_price_alerts" ADD CONSTRAINT "wishlist_price_alerts_item_id_wishlist_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."wishlist_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_price_alerts" ADD CONSTRAINT "wishlist_price_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_addresses_user_id" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_addresses_vehicle_id" ON "addresses" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "idx_addresses_postal_code" ON "addresses" USING btree ("postal_code");--> statement-breakpoint
CREATE INDEX "idx_follows_follower" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "idx_follows_following" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_username" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "idx_users_phone" ON "users" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "idx_builds_user_id" ON "builds" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_builds_brand_id" ON "builds" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "idx_builds_model_id" ON "builds" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_builds_type_id" ON "builds" USING btree ("type_id");--> statement-breakpoint
CREATE INDEX "idx_builds_license_plate" ON "builds" USING btree ("license_plate");--> statement-breakpoint
CREATE INDEX "category_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "category_user_id_idx" ON "categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_car_brands_name" ON "car_brands" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_car_brands_status" ON "car_brands" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_car_model_types_model_id" ON "car_model_types" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_car_model_types_name" ON "car_model_types" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_car_model_types_status" ON "car_model_types" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_car_models_brand_id" ON "car_models" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "idx_car_models_name" ON "car_models" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_car_models_status" ON "car_models" USING btree ("status");--> statement-breakpoint
CREATE INDEX "offer_listing_idx" ON "listing_offers" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "offer_buyer_idx" ON "listing_offers" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "offer_status_idx" ON "listing_offers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "offer_created_at_idx" ON "listing_offers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "price_history_listing_idx" ON "listing_price_history" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "price_history_created_at_idx" ON "listing_price_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "price_stats_listing_idx" ON "listing_price_stats" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "price_stats_period_idx" ON "listing_price_stats" USING btree ("year","month");--> statement-breakpoint
CREATE INDEX "question_listing_idx" ON "listing_questions" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "question_asked_by_idx" ON "listing_questions" USING btree ("asked_by");--> statement-breakpoint
CREATE INDEX "question_public_idx" ON "listing_questions" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "listing_review_listing_idx" ON "listing_reviews" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listing_review_reviewer_idx" ON "listing_reviews" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "listing_review_action_idx" ON "listing_reviews" USING btree ("action");--> statement-breakpoint
CREATE INDEX "listing_review_created_at_idx" ON "listing_reviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "transaction_listing_idx" ON "listing_transactions" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "transaction_user_idx" ON "listing_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transaction_action_idx" ON "listing_transactions" USING btree ("action");--> statement-breakpoint
CREATE INDEX "transaction_created_at_idx" ON "listing_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "watchlist_listing_idx" ON "listing_watchlist" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "watchlist_user_idx" ON "listing_watchlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "listing_user_idx" ON "listings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "listing_part_idx" ON "listings" USING btree ("part_id");--> statement-breakpoint
CREATE INDEX "listing_variant_idx" ON "listings" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "listing_status_idx" ON "listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "listing_review_status_idx" ON "listings" USING btree ("review_status");--> statement-breakpoint
CREATE INDEX "listing_price_idx" ON "listings" USING btree ("price");--> statement-breakpoint
CREATE INDEX "listing_created_at_idx" ON "listings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "listing_expires_at_idx" ON "listings" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "listing_location_idx" ON "listings" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "listing_available_idx" ON "listings" USING btree ("is_available_for_sale","status");--> statement-breakpoint
CREATE INDEX "media_type_idx" ON "media" USING btree ("type");--> statement-breakpoint
CREATE INDEX "media_public_idx" ON "media" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "media_archived_idx" ON "media" USING btree ("is_archived");--> statement-breakpoint
CREATE INDEX "media_order_idx" ON "media" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "metafield_def_entity_type_idx" ON "metafield_definitions" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "metafield_def_namespace_idx" ON "metafield_definitions" USING btree ("namespace");--> statement-breakpoint
CREATE INDEX "metafield_def_key_idx" ON "metafield_definitions" USING btree ("key");--> statement-breakpoint
CREATE INDEX "metafield_def_type_idx" ON "metafield_definitions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "metafield_def_searchable_idx" ON "metafield_definitions" USING btree ("is_searchable");--> statement-breakpoint
CREATE INDEX "metafield_def_order_idx" ON "metafield_definitions" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "metafield_option_def_idx" ON "metafield_options" USING btree ("metafield_definition_id");--> statement-breakpoint
CREATE INDEX "metafield_option_active_idx" ON "metafield_options" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "metafield_option_order_idx" ON "metafield_options" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "metafield_entity_idx" ON "metafields" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "metafield_def_idx" ON "metafields" USING btree ("metafield_definition_id");--> statement-breakpoint
CREATE INDEX "metafield_value_text_idx" ON "metafields" USING btree ("value_text");--> statement-breakpoint
CREATE INDEX "metafield_value_number_idx" ON "metafields" USING btree ("value_number");--> statement-breakpoint
CREATE INDEX "metafield_value_integer_idx" ON "metafields" USING btree ("value_integer");--> statement-breakpoint
CREATE INDEX "metafield_value_boolean_idx" ON "metafields" USING btree ("value_boolean");--> statement-breakpoint
CREATE INDEX "metafield_value_date_idx" ON "metafields" USING btree ("value_date");--> statement-breakpoint
CREATE INDEX "notification_queue_status_idx" ON "notification_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notification_queue_scheduled_for_idx" ON "notification_queue" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "notification_queue_priority_idx" ON "notification_queue" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "notification_settings_user_id_idx" ON "notification_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_templates_type_idx" ON "notification_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notification_templates_is_active_idx" ON "notification_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notifications_category_idx" ON "notifications" USING btree ("category");--> statement-breakpoint
CREATE INDEX "notifications_priority_idx" ON "notifications" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "notifications_entity_idx" ON "notifications" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "notifications_from_user_idx" ON "notifications" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_group_key_idx" ON "notifications" USING btree ("group_key");--> statement-breakpoint
CREATE INDEX "notifications_user_unread_idx" ON "notifications" USING btree ("user_id","is_read","created_at");--> statement-breakpoint
CREATE INDEX "additional_details_part_idx" ON "additional_details" USING btree ("part_id");--> statement-breakpoint
CREATE INDEX "additional_details_order_idx" ON "additional_details" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "option_value_option_idx" ON "option_values" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "option_value_order_idx" ON "option_values" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "option_part_idx" ON "options" USING btree ("part_id");--> statement-breakpoint
CREATE INDEX "option_order_idx" ON "options" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "part_slug_idx" ON "parts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "part_user_id_idx" ON "parts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "part_status_idx" ON "parts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "variant_part_idx" ON "variants" USING btree ("part_id");--> statement-breakpoint
CREATE INDEX "variant_sku_idx" ON "variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "variant_barcode_idx" ON "variants" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX "variant_order_idx" ON "variants" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "seo_meta_entity_idx" ON "seo_meta" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "part_shipping_part_idx" ON "part_shipping" USING btree ("part_id");--> statement-breakpoint
CREATE INDEX "part_shipping_profile_idx" ON "part_shipping" USING btree ("shipping_profile_id");--> statement-breakpoint
CREATE INDEX "shipping_profile_default_idx" ON "shipping_profiles" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "shipping_rate_profile_idx" ON "shipping_rates" USING btree ("shipping_profile_id");--> statement-breakpoint
CREATE INDEX "shipping_rate_order_idx" ON "shipping_rates" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "idx_user_social_media_user_id" ON "user_social_media" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_social_media_type" ON "user_social_media" USING btree ("type");--> statement-breakpoint
CREATE INDEX "wishlist_categories_user_id_idx" ON "wishlist_categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wishlist_categories_slug_idx" ON "wishlist_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "wishlist_categories_is_public_idx" ON "wishlist_categories" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "wishlist_items_user_id_idx" ON "wishlist_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wishlist_items_category_id_idx" ON "wishlist_items" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "wishlist_items_entity_idx" ON "wishlist_items" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "wishlist_items_part_id_idx" ON "wishlist_items" USING btree ("part_id");--> statement-breakpoint
CREATE INDEX "wishlist_items_listing_id_idx" ON "wishlist_items" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "wishlist_items_build_id_idx" ON "wishlist_items" USING btree ("build_id");--> statement-breakpoint
CREATE INDEX "wishlist_items_is_alert_on_idx" ON "wishlist_items" USING btree ("is_alert_on");--> statement-breakpoint
CREATE INDEX "wishlist_price_alerts_item_id_idx" ON "wishlist_price_alerts" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "wishlist_price_alerts_user_id_idx" ON "wishlist_price_alerts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wishlist_price_alerts_is_read_idx" ON "wishlist_price_alerts" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "wishlist_price_alerts_created_at_idx" ON "wishlist_price_alerts" USING btree ("created_at");