import { pgEnum } from "drizzle-orm/pg-core";

export const loginTypeEnum = pgEnum("login_type", [
  "Email",
  "Google",
  "Facebook",
]);
