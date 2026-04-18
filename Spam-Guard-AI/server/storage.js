// ✅ In-memory storage (NO DATABASE)
class MemoryStorage {
    constructor() {
        this.scans = [];
        this.currentId = 1;
    }
    async createScan(insertScan) {
        const scan = {
            id: this.currentId++,
            createdAt: new Date(),
            ...insertScan,
        };
        this.scans.unshift(scan);
        return scan;
    }
    async getScan(id) {
        return this.scans.find((scan) => scan.id === id);
    }
    async getRecentScans() {
        return this.scans.slice(0, 10);
    }
    async updateScan(id, updates) {
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
