import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateScan, useScans } from "@/hooks/use-scans";
import { ShieldCheck, Search, ArrowRight, Loader2, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";

export default function Home() {
  const [url, setUrl] = useState("");
  const [, navigate] = useLocation();
  const createScan = useCreateScan();
  const { data: recentScans } = useScans();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    try {
      const scan = await createScan.mutateAsync({ url });
      navigate(`/scans/${scan.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  /*const getRiskBadgeVariant = (level: string | null) => {
    switch (level) {
      case "Safe": return "safe";
      case "Low Risk": return "low";
      case "Suspicious": return "suspicious";
      case "Spam": return "spam";
      default: return "neutral";
    }
  };*/


  function getRiskBadgeVariant(risk: string) {
  switch (risk) {
    case "safe":
    case "low":
      return "secondary";

    case "suspicious":
      return "outline";

    case "spam":
      return "destructive";

    default:
      return "default";
  }
}

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-16">
        
        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>AI-Powered Threat Detection System</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-display font-bold tracking-tight text-white leading-[1.1]">
            Is that link <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-accent text-glow">
              safe to click?
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Analyze URLs with our 5-level deep scanning technology. We check keywords,
            unshorten links, verify with Google Safe Browsing, and assess domain reputation using machine learning.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full max-w-2xl relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <form onSubmit={handleScan} className="relative flex items-center bg-card rounded-xl border border-white/10 p-2 shadow-2xl">
            <Search className="w-6 h-6 text-muted-foreground ml-4" />
            <input
              type="url"
              placeholder="Paste a suspicious URL here (e.g., http://bit.ly/...)"
              className="flex-1 bg-transparent border-none text-lg text-foreground placeholder:text-muted-foreground/50 focus:ring-0 px-4 py-3 font-mono"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={createScan.isPending}
              className="px-8 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
            >
              {createScan.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scanning
                </>
              ) : (
                <>
                  Analyze <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Recent Scans */}
        {recentScans && recentScans.length > 0 && (
          <div className="w-full max-w-4xl space-y-4 animate-in fade-in duration-1000 delay-300">
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium uppercase tracking-wider px-2">
              <Activity className="w-4 h-4" />
              Recent Analysis
            </div>
            <div className="grid gap-3">
              {recentScans.slice(0, 3).map((scan) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => navigate(`/scans/${scan.id}`)}
                  className="group cursor-pointer bg-card/50 hover:bg-card border border-white/5 hover:border-primary/30 rounded-xl p-4 flex items-center justify-between transition-all"
                >
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span className="text-foreground font-mono truncate text-sm">{scan.url}</span>
                    <span className="text-xs text-muted-foreground">
                      {scan.createdAt && format(new Date(scan.createdAt), "MMM d, yyyy • h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {scan.status === "pending" ? (
                      <Badge variant="secondary" className="animate-pulse">Scanning...</Badge>
                    ) : (
                      <Badge variant={getRiskBadgeVariant(scan.riskLevel)}>
                        {scan.riskLevel || "Unknown"}
                      </Badge>
                    )}
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground border-t border-white/5">
        <p>© 2025 SpamLink Detector. Powered by Google Safe Browsing & Machine Learning.</p>
      </footer>
    </div>
  );
}
