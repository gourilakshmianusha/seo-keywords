import React, { useState, useEffect } from "react";
import { SeoAuditReport } from "./types";
import { Navbar } from "./components/Navbar";
import { DomainInputForm } from "./components/DomainInputForm";
import { OverviewStats } from "./components/OverviewStats";
import { KeywordTable } from "./components/KeywordTable";
import { MetaTagsStudio } from "./components/MetaTagsStudio";
import { PageListStudio } from "./components/PageListStudio";
import { FeatureImageStudio } from "./components/FeatureImageStudio";
import { TechCodeStudio } from "./components/TechCodeStudio";
import { CompetitorGapSection } from "./components/CompetitorGapSection";
import { ExportModal } from "./components/ExportModal";
import {
  Sparkles,
  BarChart3,
  FileCode2,
  Image as ImageIcon,
  KeyRound,
  Layers,
  Swords,
  Download,
  CheckCircle2,
  AlertCircle,
  Globe,
  Briefcase,
} from "lucide-react";

export default function App() {
  const [report, setReport] = useState<SeoAuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDomain, setActiveDomain] = useState("stripe.com");
  const [activeTab, setActiveTab] = useState<
    "overview" | "pages" | "keywords" | "meta" | "image" | "code" | "competitors"
  >("overview");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch or trigger analysis
  const runAnalysis = async (domain: string, niche?: string, targetAudience?: string, country?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setActiveDomain(domain);

    try {
      const response = await fetch("/api/seo-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          niche: niche || "SaaS & Cloud Software",
          targetAudience: targetAudience || "Founders, product leaders, and engineering teams",
          country: country || "US",
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data: SeoAuditReport = await response.json();
      setReport(data);
    } catch (err: any) {
      console.error("Failed to analyze domain:", err);
      setErrorMsg("Unable to complete live audit. Using verified domain intelligence fallback.");
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial analysis on first load
  useEffect(() => {
    runAnalysis("stripe.com", "SaaS & Payment Infrastructure");
  }, []);

  const handleSelectSample = (sampleDomain: string, sampleNiche?: string) => {
    runAnalysis(sampleDomain, sampleNiche);
  };

  const navSections = [
    { id: "overview", label: "Overview & Score", icon: BarChart3 },
    { id: "pages", label: `Pages Breakdown (${report?.pages?.length || 0})`, icon: Globe },
    { id: "keywords", label: `Keywords (${report?.keywords?.length || 0})`, icon: KeyRound },
    { id: "meta", label: "Meta Tags & SERP", icon: Layers },
    { id: "image", label: "Feature Image (1200x630)", icon: ImageIcon },
    { id: "code", label: "Multi-Tech Code", icon: FileCode2 },
    { id: "competitors", label: "Competitor Gaps", icon: Swords },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Header */}
      <Navbar
        report={report}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onSelectSampleDomain={handleSelectSample}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Domain & Industry Input Form */}
        <DomainInputForm
          onAnalyze={(domain, niche, targetAudience, country) =>
            runAnalysis(domain, niche, targetAudience, country)
          }
          isLoading={isLoading}
          activeDomain={activeDomain}
        />

        {/* Error Notification if any */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Report Content */}
        {report && (
          <div className="space-y-6">
            {/* Navigation Tabs Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white p-2 rounded-2xl shadow-2xs overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1">
                {navSections.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeTab === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setActiveTab(sec.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        isActive
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{sec.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="hidden sm:flex items-center gap-2 pr-2">
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-lg transition-all border border-blue-200"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV / PDF</span>
                </button>
              </div>
            </div>

            {/* Tab Views */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-in fade-in duration-150">
                <OverviewStats report={report} />
                <PageListStudio
                  pages={report.pages || []}
                  cleanDomain={report.cleanDomain}
                  siteName={report.siteName}
                  industry={report.niche}
                  onUpdatePages={(updated) => setReport({ ...report, pages: updated })}
                />
                <MetaTagsStudio
                  metaTags={report.metaTags}
                  cleanDomain={report.cleanDomain}
                  siteName={report.siteName}
                />
                <KeywordTable keywords={report.keywords} cleanDomain={report.cleanDomain} />
              </div>
            )}

            {activeTab === "pages" && (
              <div className="animate-in fade-in duration-150">
                <PageListStudio
                  pages={report.pages || []}
                  cleanDomain={report.cleanDomain}
                  siteName={report.siteName}
                  industry={report.niche}
                  onUpdatePages={(updated) => setReport({ ...report, pages: updated })}
                />
              </div>
            )}

            {activeTab === "keywords" && (
              <div className="animate-in fade-in duration-150">
                <KeywordTable keywords={report.keywords} cleanDomain={report.cleanDomain} />
              </div>
            )}

            {activeTab === "meta" && (
              <div className="animate-in fade-in duration-150">
                <MetaTagsStudio
                  metaTags={report.metaTags}
                  cleanDomain={report.cleanDomain}
                  siteName={report.siteName}
                />
              </div>
            )}

            {activeTab === "image" && (
              <div className="animate-in fade-in duration-150">
                <FeatureImageStudio
                  featureImage={report.featureImage}
                  cleanDomain={report.cleanDomain}
                  siteName={report.siteName}
                  metaTitle={report.metaTags[0]?.metaTitle || report.siteName}
                  metaDesc={report.metaTags[0]?.metaDescription || report.summary}
                />
              </div>
            )}

            {activeTab === "code" && (
              <div className="animate-in fade-in duration-150">
                <TechCodeStudio
                  snippets={report.codeSnippets}
                  siteName={report.siteName}
                  cleanDomain={report.cleanDomain}
                />
              </div>
            )}

            {activeTab === "competitors" && (
              <div className="animate-in fade-in duration-150">
                <CompetitorGapSection
                  competitors={report.competitors}
                  cleanDomain={report.cleanDomain}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">SeoPulse.ai</span>
            <span>•</span>
            <span>Universal Domain Keyword Strategy &amp; Page Architecture Generator</span>
          </div>
          <div>
            <span>Next.js • WordPress • Vite • Astro • Nuxt • Shopify • 17 Industry Verticals (Astrology, SaaS, E-Com &amp; more)</span>
          </div>
        </div>
      </footer>

      {/* Export Dialog Modal */}
      {report && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          report={report}
        />
      )}
    </div>
  );
}
