import React, { useState, useMemo } from "react";
import { KeywordItem } from "../types";
import { Search, Download, Copy, Check, Filter, ArrowUpDown, HelpCircle, Sparkles, Tag } from "lucide-react";
import { exportKeywordsToCSV } from "../utils/exportUtils";

interface KeywordTableProps {
  keywords: KeywordItem[];
  cleanDomain: string;
}

type SortField = "keyword" | "searchVolume" | "difficulty" | "cpc" | "priority" | "relevanceScore";
type SortOrder = "asc" | "desc";

export function KeywordTable({ keywords, cleanDomain }: KeywordTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIntent, setSelectedIntent] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("priority");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtered & Sorted Keywords
  const filteredKeywords = useMemo(() => {
    return keywords
      .filter((k) => {
        // Text Search
        const matchesQuery =
          k.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
          k.contentOpportunity.toLowerCase().includes(searchQuery.toLowerCase()) ||
          k.targetUrlSlug.toLowerCase().includes(searchQuery.toLowerCase());

        // Category
        const matchesCategory = selectedCategory === "all" || k.category === selectedCategory;

        // Intent
        const matchesIntent = selectedIntent === "all" || k.searchIntent === selectedIntent;

        // Difficulty
        let matchesDiff = true;
        if (selectedDifficulty === "easy") matchesDiff = k.difficulty <= 30;
        else if (selectedDifficulty === "medium") matchesDiff = k.difficulty > 30 && k.difficulty <= 60;
        else if (selectedDifficulty === "hard") matchesDiff = k.difficulty > 60;

        return matchesQuery && matchesCategory && matchesIntent && matchesDiff;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === "searchVolume") {
          // Parse "24.5K" to number
          const parseVol = (s: string) => {
            const num = parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
            return s.includes("K") ? num * 1000 : s.includes("M") ? num * 1000000 : num;
          };
          valA = parseVol(a.searchVolume);
          valB = parseVol(b.searchVolume);
        } else if (sortField === "cpc") {
          valA = parseFloat(a.cpc.replace(/[^0-9.]/g, "")) || 0;
          valB = parseFloat(b.cpc.replace(/[^0-9.]/g, "")) || 0;
        } else if (sortField === "priority") {
          const rank = { High: 3, Medium: 2, Low: 1 };
          valA = rank[a.priority];
          valB = rank[b.priority];
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [keywords, searchQuery, selectedCategory, selectedIntent, selectedDifficulty, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const copyKeyword = (kw: KeywordItem) => {
    navigator.clipboard.writeText(kw.keyword);
    setCopiedId(kw.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredKeywords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredKeywords.map((k) => k.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const copySelectedKeywords = () => {
    const selectedKws = keywords.filter((k) => selectedIds.has(k.id)).map((k) => k.keyword);
    navigator.clipboard.writeText(selectedKws.join("\n"));
    setCopiedId("selected-batch");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const exportList =
      selectedIds.size > 0 ? keywords.filter((k) => selectedIds.has(k.id)) : filteredKeywords;
    exportKeywordsToCSV(exportList, cleanDomain);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header with Title and CSV Export */}
      <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">SEO Keyword Research Matrix</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {filteredKeywords.length} terms
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Targeted search queries categorized by search intent, keyword difficulty (KD), and content mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={copySelectedKeywords}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-all"
            >
              {copiedId === "selected-batch" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Copied ({selectedIds.size})</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Selected ({selectedIds.size})</span>
                </>
              )}
            </button>
          )}

          <button
            id="btn-export-keywords-csv"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-xs font-semibold text-white shadow-xs transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Export Keywords (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200/60 flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords or content targets..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-slate-500">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="primary">Primary Targets</option>
            <option value="secondary">Secondary / Competitor</option>
            <option value="longtail">Long-tail (High Intent)</option>
            <option value="question">Questions / FAQ</option>
            <option value="lsi">LSI / Semantic</option>
          </select>
        </div>

        {/* Intent Filter */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-slate-500">Intent:</span>
          <select
            value={selectedIntent}
            onChange={(e) => setSelectedIntent(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">All Intents</option>
            <option value="Transactional">Transactional</option>
            <option value="Commercial">Commercial</option>
            <option value="Informational">Informational</option>
            <option value="Navigational">Navigational</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-slate-500">KD:</span>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy (&le; 30)</option>
            <option value="medium">Medium (31 - 60)</option>
            <option value="hard">Hard (&gt; 60)</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredKeywords.length && filteredKeywords.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
              </th>
              <th
                onClick={() => handleSort("keyword")}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-all"
              >
                <div className="flex items-center gap-1">
                  <span>Target Keyword</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Intent</th>
              <th
                onClick={() => handleSort("searchVolume")}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-all text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Volume</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("difficulty")}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-all text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>KD</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("cpc")}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-all text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>CPC</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("priority")}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-all text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3">Content Placement & URL Slug</th>
              <th className="py-3 px-3 text-center w-12">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredKeywords.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500">
                  No keywords matching the current filters.
                </td>
              </tr>
            ) : (
              filteredKeywords.map((kw) => {
                const isSelected = selectedIds.has(kw.id);

                // Intent styling
                const intentColors: Record<string, string> = {
                  Transactional: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  Commercial: "bg-indigo-50 text-indigo-700 border-indigo-200",
                  Informational: "bg-blue-50 text-blue-700 border-blue-200",
                  Navigational: "bg-slate-100 text-slate-700 border-slate-200",
                };

                // Category styling
                const catLabels: Record<string, string> = {
                  primary: "Primary",
                  secondary: "Secondary",
                  longtail: "Long-Tail",
                  question: "Question / FAQ",
                  lsi: "LSI / Semantic",
                };

                return (
                  <tr
                    key={kw.id}
                    className={`hover:bg-slate-50/90 transition-colors ${
                      isSelected ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <td className="py-3 px-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(kw.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 max-w-[240px]">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{kw.keyword}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                        {catLabels[kw.category] || kw.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          intentColors[kw.searchIntent] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {kw.searchIntent}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-800">
                      {kw.searchVolume}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                            kw.difficulty <= 30
                              ? "bg-emerald-50 text-emerald-700"
                              : kw.difficulty <= 60
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {kw.difficulty}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {kw.cpc}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          kw.priority === "High"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : kw.priority === "Medium"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {kw.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-[280px]">
                      <div className="text-[11px] truncate font-medium text-slate-800">
                        {kw.contentOpportunity}
                      </div>
                      <div className="text-[10px] text-blue-600 font-mono truncate">
                        {kw.targetUrlSlug}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => copyKeyword(kw)}
                        title="Copy keyword"
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                      >
                        {copiedId === kw.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
