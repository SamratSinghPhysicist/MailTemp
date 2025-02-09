import { pgTable, text, serial, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tempEmails = pgTable("temp_emails", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  password: text("password").notNull(),
  token: text("token").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  emailId: serial("email_id").references(() => tempEmails.id),
  from: text("from").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  rawData: json("raw_data").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertTempEmailSchema = createInsertSchema(tempEmails).omit({ 
  id: true,
  createdAt: true 
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});

export type InsertTempEmail = z.infer<typeof insertTempEmailSchema>;
export type TempEmail = typeof tempEmails.$inferSelect;
export type Message = typeof messages.$inferSelect;
