import { storage } from "./storage.js";
import { api } from "../shared/routes.js";
import { insertScanSchema } from "../shared/schema.js";
import axios from "axios";
import whois from "whois-json";
import { z } from "zod";
export async function registerRoutes(httpServer, app) {
    app.post(api.scans.create.path, async (req, res) => {
        try {
            const input = insertScanSchema.parse(req.body);
            // Basic validation
            try {
                const parsed = new URL(String(input.url));
                if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                    throw new Error("Invalid protocol");
                }
            }
            catch {
                return res.status(400).json({ message: "Invalid URL format" });
            }
            // Create initial pending scan
            const scan = await storage.createScan(input);
            // Start async analysis (but we await it here for immediate results in this MVP)
            // In a production app, we might use a queue
            const analysis = await analyzeUrl(input.url);
            const updatedScan = await storage.updateScan(scan.id, {
                status: "completed",
                ...analysis
            });
            res.status(201).json(updatedScan);
        }
        catch (err) {
            console.error("Scan error:", err);
            if (err instanceof z.ZodError) {
                const zodError = err;
                return res.status(400).json({
                    message: zodError.errors[0]?.message,
                    field: zodError.errors[0]?.path.join('.'),
                });
            }
            res.status(500).json({ message: "Internal server error" });
        }
    });
    app.get(api.scans.get.path, async (req, res) => {
        const scan = await storage.getScan(Number(req.params.id));
        if (!scan) {
            return res.status(404).json({ message: "Scan not found" });
        }
        res.json(scan);
    });
    app.get(api.scans.list.path, async (req, res) => {
        const scans = await storage.getRecentScans();
        res.json(scans);
    });
    return httpServer;
}
// === Analysis Logic ===
async function analyzeUrl(url) {
    // 1. Level 1: Keyword Analysis
    const level1 = analyzeKeywords(url);
    // 2. Level 2: Expansion
    const level2 = await analyzeExpansion(url);
    const targetUrl = level2.expandedUrl || url;
    // 3. Level 3: Safe Browsing
    const level3 = await analyzeSafeBrowsing(targetUrl);
    // 4. Level 4: Domain Age
    const level4 = await analyzeDomain(targetUrl);
    // 5. Level 5: Final Scoring
    const { score, riskLevel } = calculateRisk(level1, level2, level3, level4);
    return {
        score,
        riskLevel,
        details: { level1, level2, level3, level4 }
    };
}
function analyzeKeywords(url) {
    const suspiciousKeywords = ['login', 'verify', 'account', 'update', 'banking', 'secure', 'confirm', 'free', 'win', 'prize', 'gift'];
    const found = suspiciousKeywords.filter(k => url.toLowerCase().includes(k));
    const excessiveSymbols = (url.match(/[-_@.!#$%^&*]/g) || []).length > 5;
    let riskScore = 0;
    if (found.length > 0)
        riskScore += 0.3;
    if (excessiveSymbols)
        riskScore += 0.2;
    if (url.length > 100)
        riskScore += 0.1;
    return {
        hasSuspiciousKeywords: found.length > 0,
        suspiciousKeywordsFound: found,
        urlLength: url.length,
        excessiveSymbols,
        riskScore: Math.min(riskScore, 1)
    };
}
async function analyzeExpansion(url) {
    const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'buff.ly'];
    const isShortened = shorteners.some(s => url.includes(s));
    let expandedUrl = null;
    const redirectChain = [];
    if (isShortened) {
        try {
            const response = await axios.get(url, {
                maxRedirects: 5,
                timeout: 5000,
                validateStatus: () => true,
            });
            const finalUrl = response.request?.res?.responseUrl ||
                response.request?.responseURL ||
                null;
            expandedUrl = finalUrl && finalUrl !== url ? finalUrl : null;
        }
        catch (err) {
            console.log("URL expansion blocked by shortener");
        }
    }
    return {
        isShortened,
        expandedUrl,
        redirectChain,
    };
}
async function analyzeSafeBrowsing(url) {
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    if (!apiKey) {
        console.log("Skipping Safe Browsing check: No API Key");
        return { safeBrowsingMatch: false, threatType: null };
    }
    try {
        const response = await axios.post(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
            client: {
                clientId: "replit-spam-detector",
                clientVersion: "1.0.0"
            },
            threatInfo: {
                threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url }]
            }
        });
        const matches = response.data.matches;
        if (matches && matches.length > 0) {
            return {
                safeBrowsingMatch: true,
                threatType: matches[0].threatType
            };
        }
    }
    catch (e) {
        console.error("Safe Browsing API error", e);
    }
    return { safeBrowsingMatch: false, threatType: null };
}
async function analyzeDomain(url) {
    let domain = "";
    try {
        const parsed = new URL(url);
        domain = parsed.hostname;
    }
    catch {
        return { domainAgeDays: null, hasHttps: false, registrar: null, creationDate: null };
    }
    const hasHttps = url.startsWith("https://");
    let domainAgeDays = null;
    let registrar = null;
    let creationDate = null;
    try {
        const data = await whois(domain);
        if (data.creationDate) {
            const created = new Date(data.creationDate);
            creationDate = created.toISOString();
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - created.getTime());
            domainAgeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        registrar = data.registrar;
    }
    catch (e) {
        console.log("WHOIS failed", e);
    }
    return {
        domain,
        domainAgeDays,
        hasHttps,
        registrar,
        creationDate
    };
}
function calculateRisk(l1, l2, l3, l4) {
    // ====================
    // TRUSTED DOMAIN BYPASS
    // ====================
    const trustedDomains = [
        // 🔍 Search & Tech
        "google.com",
        "bing.com",
        "duckduckgo.com",
        "microsoft.com",
        "apple.com",
        // 🎥 Video & Streaming
        "youtube.com",
        "netflix.com",
        "primevideo.com",
        "hotstar.com",
        // 💼 Professional & Social
        "linkedin.com",
        "twitter.com",
        "facebook.com",
        "instagram.com",
        // 🛒 E-commerce
        "amazon.com",
        "flipkart.com",
        "myntra.com",
        "meesho.com",
        "ajio.com",
        // 💬 Communication
        "gmail.com",
        "outlook.com",
        "whatsapp.com",
        "telegram.org",
        "discord.com",
        // 👩‍💻 Developer & Learning
        "github.com",
        "gitlab.com",
        "stackoverflow.com",
        "geeksforgeeks.org",
        "w3schools.com",
        // 📚 Knowledge & Education
        "wikipedia.org",
        "coursera.org",
        "udemy.com",
        "edx.org",
        // 🏦 Payments & Finance
        "paypal.com",
        "paytm.com",
        "phonepe.com",
        "googlepay.com",
        // 🏛️ Government / Official
        "india.gov.in",
        "uidai.gov.in",
        "nasa.gov",
        "usa.gov"
    ];
    if (l4.domain &&
        trustedDomains.some(d => l4.domain === d || l4.domain.endsWith("." + d))) {
        return { score: 0.0, riskLevel: "Safe" };
    }
    let score = 0;
    // --------------------
    // Level 1: Keywords
    // --------------------
    score += l1.riskScore;
    // --------------------
    // Level 2: Shortened URL
    // --------------------
    if (l2.isShortened)
        score += 0.15;
    // --------------------
    // Level 3: Safe Browsing
    // --------------------
    if (l3.safeBrowsingMatch) {
        return { score: 1.0, riskLevel: "Spam" };
    }
    // --------------------
    // Level 4: Domain Trust
    // --------------------
    if (!l4.hasHttps)
        score += 0.15;
    if (l4.domainAgeDays !== null && l4.domainAgeDays < 30) {
        score += 0.25;
    }
    if (l4.domainAgeDays === null) {
        score += 0.00;
    }
    const riskyTlds = [".xyz", ".top", ".site", ".online", ".click"];
    if (l4.domain && riskyTlds.some(tld => l4.domain.endsWith(tld))) {
        score += 0.15;
    }
    // --------------------
    // Final result
    // --------------------
    score = Math.min(score, 1.0);
    let riskLevel = "Safe";
    if (score >= 0.75)
        riskLevel = "Spam";
    else if (score >= 0.5)
        riskLevel = "Suspicious";
    else if (score >= 0.25)
        riskLevel = "Low Risk";
    return { score, riskLevel };
}
