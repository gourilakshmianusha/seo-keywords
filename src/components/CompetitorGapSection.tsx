import React from "react";
import { CompetitorInsight } from "../types";
import { Swords, ShieldAlert, Zap, TrendingUp } from "lucide-react";

interface CompetitorGapProps {
  competitors: CompetitorInsight[];
  cleanDomain: string;
}

export function CompetitorGapSection({ competitors, cleanDomain }: CompetitorGapProps) {
  if (!competitors || competitors.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Competitor SEO Gap & Organic Opportunity</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Rank Gap Analysis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify keyword blindspots where competitors are vulnerable and {cleanDomain} can capture traffic.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competitors.map((comp, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3 hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  VS
                </div>
                <span className="font-bold text-slate-900 text-xs sm:text-sm">{comp.competitorDomain}</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Direct Competitor
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                <span className="font-bold text-slate-700 block mb-0.5 flex items-center gap-1 text-[11px]">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                  Competitor Strength:
                </span>
                <p className="text-slate-600 leading-snug">{comp.strength}</p>
              </div>

              <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                <span className="font-bold text-emerald-900 block mb-0.5 flex items-center gap-1 text-[11px]">
                  <Zap className="h-3.5 w-3.5 text-emerald-600" />
                  {cleanDomain} Opportunity Gap:
                </span>
                <p className="text-emerald-800 leading-snug">{comp.gapOpportunity}</p>
              </div>
            </div>

            {comp.sharedKeywords && comp.sharedKeywords.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  High-Overlap Battleground Terms:
                </span>
                <div className="flex flex-wrap gap-1">
                  {comp.sharedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
