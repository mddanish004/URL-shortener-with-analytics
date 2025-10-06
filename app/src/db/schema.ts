import { pgTable, text, varchar, boolean, timestamp, uuid, index, uniqueIndex } from "drizzle-orm/pg-core";

export const urls = pgTable("urls", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  originalUrl: text("original_url").notNull(),
  shortCode: varchar("short_code", { length: 32 }).notNull(),
  customAlias: varchar("custom_alias", { length: 64 }),
  title: varchar("title", { length: 256 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
  return {
    shortCodeIdx: uniqueIndex("urls_short_code_idx").on(table.shortCode),
    customAliasIdx: uniqueIndex("urls_custom_alias_idx").on(table.customAlias),
    userIdIdx: index("urls_user_id_idx").on(table.userId),
  };
});

export const clicks = pgTable("clicks", {
  id: uuid("id").primaryKey().defaultRandom(),
  urlId: uuid("url_id").notNull(),
  clickedAt: timestamp("clicked_at").notNull().defaultNow(),
  ipHash: varchar("ip_hash", { length: 128 }).notNull(),
}, (table) => {
  return {
    urlIdIdx: index("clicks_url_id_idx").on(table.urlId),
    clickedAtIdx: index("clicks_clicked_at_idx").on(table.clickedAt),
  };
});

export type Url = typeof urls.$inferSelect;
export type NewUrl = typeof urls.$inferInsert;
export type Click = typeof clicks.$inferSelect;
export type NewClick = typeof clicks.$inferInsert;

