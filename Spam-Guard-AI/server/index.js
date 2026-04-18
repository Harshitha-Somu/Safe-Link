import "dotenv/config";
import express from "express";
import { registerRoutes } from "./routes.js";
import { serveStatic } from "./static.js";
import { createServer } from "http";
const app = express();
const httpServer = createServer(app);
app.use(express.json({
    verify: (req, _res, buf) => {
        req.rawBody = buf;
    },
}));
app.use(express.urlencoded({ extended: false }));
export function log(message, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
}
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
    const originalResJson = res.json.bind(res);
    res.json = function (bodyJson) {
        capturedJsonResponse = bodyJson;
        return originalResJson(bodyJson);
    };
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            log(logLine);
        }
    });
    next();
});
(async () => {
    await registerRoutes(httpServer, app);
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
    });
    // Serve frontend
    if (process.env.NODE_ENV === "production") {
        serveStatic(app);
    }
    else {
        const { setupVite } = await import("./vite");
        await setupVite(httpServer, app);
    }
    // ✅ WINDOWS-SAFE LISTEN (FIXED PART)
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(port, () => {
        log(`serving on http://localhost:${port}`);
    });
})();
