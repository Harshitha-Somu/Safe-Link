import { useRoute } from "wouter";
import { useScan } from "@/hooks/use-scans";
import { RiskGauge } from "@/components/RiskGauge";
import { LevelCard } from "@/components/LevelCard";
import { ArrowLeft, Share2, ShieldAlert, ShieldCheck, ExternalLink, Loader2, Globe, Search, Database, BrainCircuit } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";



export default function ScanDetails() {
  const [, params] = useRoute("/scans/:id");
  if (!params) return null;
  if (!params) return null;

  const id = parseInt((params as { id: string }).id);
  const { data: scan, isLoading, error } = useScan(id);

  const handleShareReport = () => {
    if (!scan) return;

    const shareUrl = `${window.location.origin}/report/${scan.id}`;

    navigator.clipboard.writeText(shareUrl);
    alert("Shareable report link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-muted-foreground">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-mono text-sm animate-pulse">Initializing Scan Protocols...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-bold">Scan Not Found</h2>
        <Link href="/" className="text-primary hover:underline">Return Home</Link>
      </div>
    );
  }

  const isPending = scan.status === "pending";
  const details = scan.details;
  const score = scan.score || 0;

  // Determine status color for cards
  const getLevelStatus = (risk: boolean) => risk ? "danger" : "safe";
  
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Scanner
          </Link>
          <div className="text-xs font-mono text-muted-foreground">
            SCAN ID: {scan.id.toString().padStart(6, '0')}
          </div>
        </div>

        {/* Header Report Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-[2fr,1fr] gap-6"
        >
          <div className="bg-card rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                {isPending ? (
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-muted text-muted-foreground animate-pulse">
  ANALYSIS IN PROGRESS
</span>

                ) : (
                  <span
  className={`px-3 py-1 rounded-full text-xs font-mono ${
    scan.riskLevel === "Safe"
      ? "bg-emerald-500/15 text-emerald-400"
      : scan.riskLevel === "Low Risk"
      ? "bg-yellow-500/15 text-yellow-400"
      : "bg-red-500/15 text-red-400"
  }`}
>
  {scan.riskLevel?.toUpperCase()}
</span>

                )}
                <span className="text-xs text-muted-foreground font-mono">
                  {scan.createdAt && format(new Date(scan.createdAt), "PPP p")}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-mono font-bold break-all text-foreground mb-6">
                {scan.url}
              </h1>

              <div className="flex flex-wrap gap-4">
                <a 
                  href={scan.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium transition-colors"
                >
                  Visit URL <ExternalLink className="w-3 h-3" />
                </a>
                <button
  onClick={handleShareReport}
  className="flex items-center gap-2 px-4 py-2 rounded-lg border"
>
  Share Report
</button>
              </div>
            </div>
          </div>

          {/* Score Gauge */}
          <div className="bg-card rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center relative shadow-lg">
            {isPending ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">Calculating Score...</p>
              </div>
            ) : (
              <RiskGauge score={score} size={160} />
            )}
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Composite Threat Score</p>
            </div>
          </div>
        </motion.div>

        {isPending ? (
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="h-48 bg-card/30 rounded-2xl border border-white/5"></div>
             ))}
           </div>
        ) : details ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Level 1: Keyword Analysis */}
            <LevelCard
              title="Keyword Analysis"
              description="Scans for suspicious words and patterns"
              status={details.level1.hasSuspiciousKeywords || details.level1.excessiveSymbols ? "warning" : "safe"}
              delay={0.1}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Suspicious Keywords:</span>
                  <span className={details.level1.hasSuspiciousKeywords ? "text-red-400" : "text-emerald-400"}>
                    {details.level1.suspiciousKeywordsFound.length > 0 ? details.level1.suspiciousKeywordsFound.join(", ") : "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">URL Length:</span>
                  <span>{details.level1.urlLength} chars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbols:</span>
                  <span className={details.level1.excessiveSymbols ? "text-red-400" : "text-emerald-400"}>
                    {details.level1.excessiveSymbols ? "Excessive" : "Normal"}
                  </span>
                </div>
              </div>
            </LevelCard>

            {/* Level 2: Expansion */}
            <LevelCard
              title="URL Expansion"
              description="Resolves shortened links to destination"
              status="info"
              delay={0.2}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shortened:</span>
                  <span>{details.level2.isShortened ? "Yes" : "No"}</span>
                </div>
                {details.level2.isShortened && (
                  <div className="flex flex-col gap-1 mt-1 p-2 bg-black/20 rounded">
                    <span className="text-xs text-muted-foreground">Destination:Unable to resolve (restricted by shortener)</span>
                    <span className="break-all text-xs text-blue-300">{details.level2.expandedUrl}</span>
                  </div>
                )}
                {details.level2.redirectChain.length > 0 && (
                   <div className="text-xs text-muted-foreground">
                     {details.level2.redirectChain.length} redirects detected
                   </div>
                )}
              </div>
            </LevelCard>

            {/* Level 3: Google Safe Browsing */}
            <LevelCard
              title="Google Safe Browsing"
              description="Checks against global threat database"
              status={details.level3.safeBrowsingMatch ? "danger" : "safe"}
              delay={0.3}
            >
              <div className="flex flex-col items-center justify-center py-2 text-center gap-2">
                {details.level3.safeBrowsingMatch ? (
                   <>
                     <ShieldAlert className="w-12 h-12 text-red-500 mb-2" />
                     <div className="font-bold text-red-500">THREAT DETECTED</div>
                     <span className="px-2 py-1 rounded text-xs bg-red-500/15 text-red-400">
  {details.level3.threatType || "MALWARE"}
</span>

                   </>
                ) : (
                  <>
                    <ShieldCheck className="w-12 h-12 text-emerald-500 mb-2" />
                    <div className="font-bold text-emerald-500">No Threats Found</div>
                    <p className="text-xs text-muted-foreground">URL is not in Google's blacklist</p>
                  </>
                )}
              </div>
            </LevelCard>

            {/* Level 4: Domain Analysis */}
            <LevelCard
              title="Domain Reputation"
              description="Evaluates age, HTTPS, and registrar"
              status={!details.level4.hasHttps || (details.level4.domainAgeDays !== null && details.level4.domainAgeDays < 30) ? "warning" : "safe"}
              delay={0.4}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HTTPS:</span>
                  <span className={details.level4.hasHttps ? "text-emerald-400" : "text-red-400"}>
                    {details.level4.hasHttps ? "Valid Certificate" : "Missing / Invalid"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domain Age:</span>
                  <span className={(details.level4.domainAgeDays || 0) < 30 ? "text-orange-400" : "text-foreground"}>
                    {details.level4.domainAgeDays ? `${details.level4.domainAgeDays} days` : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registrar:</span>
                  <span className="truncate max-w-[120px]" title={details.level4.registrar || "Unknown"}>
                    {details.level4.registrar || "Hidden"}
                  </span>
                </div>
              </div>
            </LevelCard>

            {/* Level 5: Classification */}
            <LevelCard
              title="ML Classification"
              description="Final XGBoost risk assessment"
              status={scan.riskLevel === "Spam" ? "danger" : scan.riskLevel === "Suspicious" ? "warning" : "safe"}
              delay={0.5}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Confidence Score</span>
                  <span className="font-mono font-bold">{(score * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      score > 0.75 ? "bg-red-500" : score > 0.5 ? "bg-orange-500" : score > 0.25 ? "bg-yellow-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${score * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Based on keyword patterns, URL structure, domain reputation, and external threat intelligence feeds.
                </p>
              </div>
            </LevelCard>
          </div>
        ) : null}
      </div>
    </div>
  );
}
