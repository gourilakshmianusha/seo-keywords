import React from "react";
import { SeoAuditReport } from "../types";
import { CheckCircle2, TrendingUp, Target, Sparkles, ShieldCheck, Layers, Hash } from "lucide-react";

interface OverviewStatsProps {
  report: SeoAuditReport;
}

export function OverviewStats({ report }: OverviewStatsProps) {
  // Calculate average difficulty
  const avgDifficulty = Math.round(
    report.keywords.reduce((acc, k) => acc + k.difficulty, 0) / (report.keywords.length || 1)
  );

  const highPriorityCount = report.keywords.filter((k) => k.priority === "High").length;
  const commercialCount = report.keywords.filter((k) => k.searchIntent === "Commercial" || k.searchIntent === "Transactional").length;

  return (
    <div className="space-y-6">
      {/* Top Score and Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* SEO Health Score Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SEO Health Score</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-4xl font-extrabold text-slate-900">{report.seoHealthScore}</span>
            <span className="text-sm font-medium text-slate-500">/ 100</span>
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Optimal
            </span>
          </div>
          <p className="text-xs text-slate-600">
            High organic growth potential with meta & keyword expansion.
          </p>
        </div>

        {/* Keywords Generated Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Keywords</span>
            <Hash className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-4xl font-extrabold text-slate-900">{report.keywords.length}</span>
            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-semibold border border-blue-200">
              {highPriorityCount} High Priority
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Primary, secondary, long-tail, and question clusters mapped.
          </p>
        </div>

        {/* Commercial Intent Density */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Buyer Intent Terms</span>
            <Target className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-4xl font-extrabold text-slate-900">{commercialCount}</span>
            <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-semibold border border-indigo-200">
              Transactional
            </span>
          </div>
          <p className="text-xs text-slate-600">
            High-converting keywords targeting purchasing visitors.
          </p>
        </div>

        {/* Avg Keyword Difficulty */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg. Keyword Difficulty</span>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-4xl font-extrabold text-slate-900">{avgDifficulty}</span>
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
              {avgDifficulty < 35 ? "Easy to Rank" : "Moderate Competition"}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Balanced mix of low-hanging fruit and high-volume targets.
          </p>
        </div>
      </div>

      {/* Strategic Summary & Actionable Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Domain Overview & Positioning */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Organic Strategy & Positioning for {report.cleanDomain}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Niche: <span className="font-semibold text-slate-700">{report.niche}</span>
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {new Date(report.analyzedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
            {report.summary}
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Core Strategic Differentiator
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium bg-blue-50/50 p-3 rounded-lg border border-blue-100/60">
              {report.competitiveAngle}
            </p>
          </div>

          {/* Heading Structure Guide */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-600" />
              Recommended On-Page Heading Architecture
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start gap-2 bg-slate-100/70 p-2 rounded-md">
                <span className="font-bold text-blue-700 shrink-0 font-mono">H1:</span>
                <span className="text-slate-800 font-semibold">{report.headingStructure.h1}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {report.headingStructure.h2s.map((h2, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200/60">
                    <span className="font-bold text-slate-500 font-mono text-[10px]">H2:</span>
                    <span className="text-slate-700 truncate">{h2}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Priority Action Checklist */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col">
          <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Top Recommendations
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Priority technical & on-page actions to implement immediately.
          </p>

          <div className="space-y-3 flex-1">
            {report.topRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs text-slate-700 leading-relaxed"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                  {idx + 1}
                </div>
                <span>{rec}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              Ready to copy snippets below for Next.js, WordPress & Vite
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
