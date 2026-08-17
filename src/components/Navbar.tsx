import { Search, FileSpreadsheet, FileText, Download, Sparkles, Globe, RefreshCw } from "lucide-react";
import { SeoAuditReport } from "../types";

interface NavbarProps {
  report: SeoAuditReport | null;
  onOpenExportModal: () => void;
  onSelectSampleDomain: (domain: string, niche?: string) => void;
  isLoading: boolean;
}

const SAMPLE_DOMAINS = [
  { domain: "stripe.com", niche: "Fintech & Payment Infrastructure" },
  { domain: "astrology.com", niche: "Astrology, Horoscopes & Zodiac Signs" },
  { domain: "linear.app", niche: "Issue Tracking & Project Management" },
  { domain: "notion.so", niche: "Productivity & Knowledge Workspace" },
  { domain: "shopify.com", niche: "E-commerce & Online Store Builder" },
];

export function Navbar({ report, onOpenExportModal, onSelectSampleDomain, isLoading }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 text-base sm:text-lg">
                SeoPulse<span className="text-blue-600">.ai</span>
              </span>
              <span className="hidden rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-700/10 sm:inline-block">
                Domain Intelligence
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-500 md:block">
              Keywords • Meta Titles & Descs • Feature Image • Multi-Tech Snippets
            </p>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg border border-slate-200/80">
          <span className="text-[11px] font-medium text-slate-500 px-2 flex items-center gap-1">
            <Globe className="h-3 w-3 text-slate-400" />
            Try domain:
          </span>
          {SAMPLE_DOMAINS.map((item) => (
            <button
              key={item.domain}
              disabled={isLoading}
              onClick={() => onSelectSampleDomain(item.domain, item.niche)}
              className="text-xs font-medium px-2.5 py-1 rounded-md text-slate-700 hover:bg-white hover:text-blue-600 hover:shadow-xs transition-all disabled:opacity-50"
            >
              {item.domain}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {report && (
            <div className="flex items-center gap-2">
              <button
                id="btn-export-reports"
                onClick={onOpenExportModal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Download className="h-4 w-4" />
                <span>Export (CSV / PDF)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
