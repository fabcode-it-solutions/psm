import { pgTable, serial, text, integer, index } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const userSocialMedia = pgTable(
  "user_social_media",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    facebook: text("facebook"),
    instagram: text("instagram"),
    youtube: text("youtube"),
    twitter: text("twitter"),
    linkedIn: text("linkedIn"),
  },
  (t) => ({
    userIdIdx: index("idx_user_social_media_user_id").on(t.userId),
  })
);
