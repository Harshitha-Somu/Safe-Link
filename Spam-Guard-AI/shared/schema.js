import { pgTable, text, serial, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
// === TABLE DEFINITIONS ===
export const scans = pgTable("scans", {
    id: serial("id").primaryKey(),
    url: text("url").notNull(),
    status: text("status").notNull().default("pending"), // pending, completed, failed
    riskLevel: text("risk_level"), // Safe, Low Risk, Suspicious, Spam
    score: real("score"), // 0.00 - 1.00
    details: jsonb("details"), // Stores detailed results from all 5 levels
    createdAt: timestamp("created_at").defaultNow(),
});
// === BASE SCHEMAS ===
export const insertScanSchema = createInsertSchema(scans).pick({
    url: true,
});
