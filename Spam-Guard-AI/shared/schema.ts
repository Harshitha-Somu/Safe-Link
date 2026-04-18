import { pgTable, text, serial, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
/*export const insertScanSchema = createInsertSchema(scans).pick({
  url: true,
});*/

export const insertScanSchema = z.object({
  url: z.string(),
});

// === TYPES ===
export type Scan = typeof scans.$inferSelect;
export type InsertScan = z.infer<typeof insertScanSchema>;

// Detailed Analysis Types
export interface Level1Result {
  hasSuspiciousKeywords: boolean;
  suspiciousKeywordsFound: string[];
  urlLength: number;
  excessiveSymbols: boolean;
  riskScore: number;
}

export interface Level2Result {
  isShortened: boolean;
  expandedUrl: string | null;
  redirectChain: string[];
}

export interface Level3Result {
  safeBrowsingMatch: boolean;
  threatType: string | null; // MALWARE, SOCIAL_ENGINEERING, etc.
}

export interface Level4Result {
  domainAgeDays: number | null;
  hasHttps: boolean;
  registrar: string | null;
  creationDate: string | null;
}

export interface ScanDetails {
  level1: Level1Result;
  level2: Level2Result;
  level3: Level3Result;
  level4: Level4Result;
}
