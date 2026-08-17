import React, { useState } from "react";
import { SeoAuditReport } from "../types";
import { X, FileSpreadsheet, FileText, Download, Code, Sparkles, CheckCircle2, ArrowRight, Layers } from "lucide-react";
import {
  exportKeywordsToCSV,
  exportPagesToCSV,
  exportFullAuditToCSV,
  exportReportToPDF,
  exportReportToMarkdown,
  exportReportToJSON,
} from "../utils/exportUtils";
import confetti from "canvas-confetti";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SeoAuditReport;
}

export function ExportModal({ isOpen, onClose, report }: ExportModalProps) {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const handleExport = (type: "keywords_csv" | "pages_csv" | "full_csv" | "pdf" | "md" | "json") => {
    setDownloadingFormat(type);
    setTimeout(() => {
      if (type === "keywords_csv") {
        exportKeywordsToCSV(report.keywords, report.cleanDomain);
      } else if (type === "pages_csv") {
        exportPagesToCSV(report.pages || [], report.cleanDomain);
      } else if (type === "full_csv") {
        exportFullAuditToCSV(report);
      } else if (type === "pdf") {
        exportReportToPDF(report);
      } else if (type === "md") {
        exportReportToMarkdown(report);
      } else if (type === "json") {
        exportReportToJSON(report);
      }
      triggerConfetti();
      setDownloadingFormat(null);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            SEO Deliverable Export Suite
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Export SEO Strategy for {report.cleanDomain}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Industry: <span className="font-semibold text-slate-800">{report.niche}</span> • Export client-ready spreadsheets, multi-page PDFs, or developer code.
          </p>
        </div>

        {/* Export Options Grid */}
        <div className="space-y-3">
          {/* PDF Report Option (Primary) */}
          <div
            onClick={() => handleExport("pdf")}
            className="flex items-center justify-between p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Executive PDF Audit Report</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multi-page client-ready PDF with scorecard, page architecture, keyword matrix, and feature image specs.
                </p>
              </div>
            </div>
            <button
              disabled={downloadingFormat === "pdf"}
              className="p-2 rounded-lg bg-white border border-blue-200 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0 ml-3"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>

          {/* Page-by-Page Breakdown CSV */}
          <div
            onClick={() => handleExport("pages_csv")}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Every Page SEO Breakdown (CSV)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    {report.pages?.length || 0} Pages
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Page paths, custom meta titles, descriptions, H1 headings, and Schemas for each URL.
                </p>
              </div>
            </div>
            <button
              disabled={downloadingFormat === "pages_csv"}
              className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shrink-0 ml-3"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>

          {/* Keywords CSV Option */}
          <div
            onClick={() => handleExport("keywords_csv")}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block">Keywords Matrix (CSV)</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formatted spreadsheet with all {report.keywords.length} keywords, search volume, KD, CPC, and intent.
                </p>
              </div>
            </div>
            <button
              disabled={downloadingFormat === "keywords_csv"}
              className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all shrink-0 ml-3"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>

          {/* Full Audit CSV Option */}
          <div
            onClick={() => handleExport("full_csv")}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block">Full SEO Strategy Bundle (CSV)</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Includes executive summary, all meta variations, page breakdown, and keywords in one file.
                </p>
              </div>
            </div>
            <button
              disabled={downloadingFormat === "full_csv"}
              className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all shrink-0 ml-3"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>

          {/* Secondary Formats: Markdown & JSON */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => handleExport("md")}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all"
            >
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>Markdown (.md)</span>
            </button>

            <button
              onClick={() => handleExport("json")}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all"
            >
              <Code className="h-4 w-4 text-purple-600" />
              <span>Raw JSON Data</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{report.keywords.length} keywords • {report.pages?.length || 0} pages mapped</span>
          <button
            onClick={onClose}
            className="font-semibold text-slate-700 hover:text-slate-900 px-3 py-1"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
