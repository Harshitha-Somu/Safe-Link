import { type InsertScan, type Scan } from "@shared/schema";

export interface IStorage {
  createScan(scan: InsertScan): Promise<Scan>;
  getScan(id: number): Promise<Scan | undefined>;
  getRecentScans(): Promise<Scan[]>;
  updateScan(id: number, updates: Partial<Scan>): Promise<Scan>;
}

// ✅ In-memory storage (NO DATABASE)
class MemoryStorage implements IStorage {
  private scans: Scan[] = [];
  private currentId = 1;

  async createScan(insertScan: InsertScan): Promise<Scan> {
    const scan: Scan = {
      id: this.currentId++,
      createdAt: new Date(),
      ...insertScan,
    } as Scan;

    this.scans.unshift(scan);
    return scan;
  }

  async getScan(id: number): Promise<Scan | undefined> {
    return this.scans.find((scan) => scan.id === id);
  }

  async getRecentScans(): Promise<Scan[]> {
    return this.scans.slice(0, 10);
  }

  async updateScan(id: number, updates: Partial<Scan>): Promise<Scan> {
    const index = this.scans.findIndex((scan) => scan.id === id);
    if (index === -1) {
      throw new Error("Scan not found");
    }

    this.scans[index] = {
      ...this.scans[index],
      ...updates,
    };

    return this.scans[index];
  }
}

// ✅ Export storage without DB dependency
export const storage = new MemoryStorage();
