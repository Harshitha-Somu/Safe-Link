import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Badge } from "@/components/ui/Badge";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export default function ScanReport() {
  const [, params] = useRoute("/report/:id");
  const scanId = params?.id;
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/scans/${scanId}`)
      .then(res => res.json())
      .then(data => {
        setScan(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [scanId]);

  if (loading) return <p className="p-6">Loading report...</p>;
  if (!scan) return <p className="p-6">Report not found</p>;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-card p-6 rounded-xl border">
          <h1 className="font-mono break-all text-lg">{scan.url}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge>{scan.riskLevel}</Badge>
            <span className="text-muted-foreground text-sm">
              Scan ID: {scan.id}
            </span>
          </div>
        </div>

        {/* Risk Score */}
        <div className="bg-card p-6 rounded-xl border">
          <h2 className="text-xl font-semibold">Risk Score</h2>
          <p className="text-4xl font-bold mt-2">
            {Math.round(scan.score * 100)} / 100
          </p>
        </div>

        {/* Analysis */}
        <div className="grid md:grid-cols-2 gap-4">
          <AnalysisCard
            title="Keyword Analysis"
            ok={!scan.details.level1.hasSuspiciousKeywords}
          >
            Keywords: {scan.details.level1.suspiciousKeywordsFound.join(", ") || "None"}
          </AnalysisCard>

          <AnalysisCard
            title="URL Expansion"
            ok={!scan.details.level2.isShortened}
          >
            {scan.details.level2.expandedUrl || "Not shortened"}
          </AnalysisCard>

          <AnalysisCard
            title="Google Safe Browsing"
            ok={!scan.details.level3.safeBrowsingMatch}
          >
            {scan.details.level3.safeBrowsingMatch
              ? "Threat detected"
              : "No threats found"}
          </AnalysisCard>

          <AnalysisCard
            title="Domain Reputation"
            ok={scan.details.level4.hasHttps}
          >
            HTTPS: {scan.details.level4.hasHttps ? "Yes" : "No"}
          </AnalysisCard>
        </div>

      </div>
    </div>
  );
}

function AnalysisCard({
  title,
  ok,
  children,
}: {
  title: string;
  ok: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card p-5 rounded-xl border">
      <div className="flex items-center gap-2 mb-2">
        {ok ? (
          <ShieldCheck className="text-green-500 w-5 h-5" />
        ) : (
          <ShieldAlert className="text-yellow-500 w-5 h-5" />
        )}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
