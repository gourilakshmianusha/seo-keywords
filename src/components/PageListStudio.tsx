import React, { useState } from "react";
import { PageSeoItem, KeywordOption } from "../types";
import {
  FileText,
  Search,
  Filter,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Code2,
  Download,
  Eye,
  CheckCircle2,
  Tag,
  Hash,
  Trash2,
  ClipboardPaste,
  Plus,
  Link2,
  ArrowRight,
  Target,
  PlusCircle,
} from "lucide-react";
import { exportPagesToCSV } from "../utils/exportUtils";

interface PageListStudioProps {
  pages: PageSeoItem[];
  cleanDomain: string;
  siteName: string;
  industry?: string;
  onUpdatePages?: (updatedPages: PageSeoItem[]) => void;
}

export function PageListStudio({ pages = [], cleanDomain, siteName, industry, onUpdatePages }: PageListStudioProps) {
  const [localPages, setLocalPages] = useState<PageSeoItem[]>(pages);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [expandedPageId, setExpandedPageId] = useState<string | null>(pages[0]?.id || null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  
  // Quick paste bar state
  const [quickPathInput, setQuickPathInput] = useState("");
  const [quickPasteFeedback, setQuickPasteFeedback] = useState(false);
  const [modalPasteFeedback, setModalPasteFeedback] = useState(false);
  const [customKwInputs, setCustomKwInputs] = useState<Record<string, string>>({});

  // New page form state
  const [newPath, setNewPath] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrimaryKw, setNewPrimaryKw] = useState("");
  const [newPageType, setNewPageType] = useState<PageSeoItem["pageType"]>("Features/Services");

  // Path normalization helper for robust URL and path pasting
  const normalizePath = (raw: string): string => {
    let val = raw.trim();
    if (!val) return "";
    // If user pasted a full URL e.g. https://domain.com/sub/page?q=1#hash
    if (val.startsWith("http://") || val.startsWith("https://")) {
      try {
        const parsed = new URL(val);
        val = parsed.pathname;
      } catch {
        val = val.replace(/^https?:\/\/[^/]+/i, "");
      }
    } else if (val.includes("/") && val.indexOf("/") > 0) {
      // If user pasted "domain.com/sub/page", strip domain part
      const firstSlash = val.indexOf("/");
      const before = val.substring(0, firstSlash);
      if (before.includes(".")) {
        val = val.substring(firstSlash);
      }
    }
    // Clean query parameters and hashes
    val = val.split("?")[0].split("#")[0].trim();
    if (val && !val.startsWith("/")) {
      val = "/" + val;
    }
    return val;
  };

  // Generate multiple rich keyword options with metrics for any path
  const generateKeywordOptionsForPath = (
    pathStr: string,
    brandName: string,
    existingPrimary?: string,
    existingSecondary?: string[]
  ): KeywordOption[] => {
    const clean = pathStr.replace(/[/_-]/g, " ").trim();
    const baseTerm = clean || `${brandName.toLowerCase()} official`;
    const optionsMap = new Map<string, KeywordOption>();

    const addOption = (
      kw: string,
      vol: string,
      kd: number,
      intent: KeywordOption["intent"] = "Commercial",
      cpc = "$2.40"
    ) => {
      const trimmed = kw.trim();
      if (!trimmed || optionsMap.has(trimmed.toLowerCase())) return;
      const diffLabel: "Easy" | "Medium" | "Hard" = kd <= 30 ? "Easy" : kd <= 60 ? "Medium" : "Hard";
      optionsMap.set(trimmed.toLowerCase(), {
        keyword: trimmed,
        searchVolume: vol,
        difficulty: kd,
        difficultyLabel: diffLabel,
        intent,
        cpc,
        isPrimary: existingPrimary ? existingPrimary.toLowerCase() === trimmed.toLowerCase() : false,
      });
    };

    if (existingPrimary) {
      addOption(existingPrimary, "24.5K/mo", 32, "Commercial", "$3.80");
    }

    // Generate diverse keyword options across multiple search intents
    addOption(baseTerm, "18.2K/mo", 28, "Informational", "$1.95");
    addOption(`best ${baseTerm}`, "14.6K/mo", 44, "Commercial", "$4.20");
    addOption(`${baseTerm} online`, "12.1K/mo", 22, "Transactional", "$3.50");
    addOption(`${brandName.toLowerCase()} ${baseTerm}`, "9.4K/mo", 15, "Navigational", "$1.10");
    addOption(`free ${baseTerm} calculator`, "8.7K/mo", 26, "Transactional", "$2.80");
    addOption(`how to use ${baseTerm}`, "6.2K/mo", 18, "Informational", "$0.85");
    addOption(`${baseTerm} reviews and guide`, "5.5K/mo", 30, "Commercial", "$3.10");

    if (existingSecondary && Array.isArray(existingSecondary)) {
      existingSecondary.forEach((sec, idx) => {
        addOption(sec, `${(15 - idx * 2.5).toFixed(1)}K/mo`, 20 + idx * 6, "Informational", "$2.20");
      });
    }

    const results = Array.from(optionsMap.values());
    if (!results.some((r) => r.isPrimary) && results.length > 0) {
      results[0].isPrimary = true;
    }
    return results;
  };

  // Human-readable title and keyword inference
  const inferFieldsFromPath = (pathStr: string, brandName: string) => {
    const clean = pathStr.replace(/[/_-]/g, " ").trim();
    if (!clean) {
      return {
        title: `${brandName} — Official Website`,
        primaryKeyword: `${brandName.toLowerCase()} official`,
        metaDescription: `Discover official services, solutions, and updates from ${brandName}.`,
        suggestedKeywords: [
          `${brandName.toLowerCase()} official`,
          `best ${brandName.toLowerCase()} platform`,
          `${brandName.toLowerCase()} online services`,
          `how to use ${brandName.toLowerCase()}`,
        ],
      };
    }
    const capitalized = clean
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    return {
      title: `${capitalized} | ${brandName}`,
      primaryKeyword: clean.toLowerCase(),
      metaDescription: `Explore ${clean} on ${brandName}. Detailed insights, user guides, pricing, and features designed for high search visibility.`,
      suggestedKeywords: [
        clean.toLowerCase(),
        `best ${clean.toLowerCase()}`,
        `${clean.toLowerCase()} online`,
        `${brandName.toLowerCase()} ${clean.toLowerCase()}`,
        `free ${clean.toLowerCase()}`,
        `how to use ${clean.toLowerCase()}`,
      ],
    };
  };

  // Clipboard paste for Quick Add
  const handleQuickPasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const cleaned = normalizePath(text);
          setQuickPathInput(cleaned);
          setQuickPasteFeedback(true);
          setTimeout(() => setQuickPasteFeedback(false), 2000);
        }
      }
    } catch (err) {
      console.warn("Clipboard read not permitted", err);
    }
  };

  // Clipboard paste for Modal
  const handleModalPasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const cleaned = normalizePath(text);
          setNewPath(cleaned);
          const inferred = inferFieldsFromPath(cleaned, siteName);
          if (!newTitle || newTitle.trim() === "") setNewTitle(inferred.title);
          if (!newPrimaryKw || newPrimaryKw.trim() === "") setNewPrimaryKw(inferred.primaryKeyword);
          if (!newDescription || newDescription.trim() === "") setNewDescription(inferred.metaDescription);
          setModalPasteFeedback(true);
          setTimeout(() => setModalPasteFeedback(false), 2000);
        }
      }
    } catch (err) {
      console.warn("Clipboard read not permitted", err);
    }
  };

  // Quick Add handler
  const handleQuickAddPath = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pathClean = normalizePath(quickPathInput);
    if (!pathClean || pathClean === "") return;

    // If page already exists, expand it
    const existing = localPages.find((p) => p.path === pathClean);
    if (existing) {
      setExpandedPageId(existing.id);
      setQuickPathInput("");
      return;
    }

    const inferred = inferFieldsFromPath(pathClean, siteName);
    const category = pathClean.includes("pricing")
      ? "Pricing"
      : pathClean.includes("blog") || pathClean.includes("news")
      ? "Blog/Content"
      : pathClean.includes("contact") || pathClean.includes("demo")
      ? "Contact/Lead"
      : pathClean.includes("docs") || pathClean.includes("api")
      ? "Docs/Resources"
      : "Features/Services";

    const initialOptions = generateKeywordOptionsForPath(pathClean, siteName, inferred.primaryKeyword, [
      `${siteName.toLowerCase()} ${inferred.primaryKeyword}`,
      `best ${inferred.primaryKeyword}`,
      `${inferred.primaryKeyword} online`,
    ]);

    const newPage: PageSeoItem = {
      id: `p-custom-${Date.now()}`,
      path: pathClean,
      pageType: category,
      title: inferred.title,
      metaDescription: inferred.metaDescription,
      primaryKeyword: inferred.primaryKeyword,
      secondaryKeywords: [`${siteName.toLowerCase()} ${inferred.primaryKeyword}`, `best ${inferred.primaryKeyword}`],
      keywordOptions: initialOptions,
      h1: inferred.title.split("|")[0].trim(),
      h2s: ["Key Features & Overview", "Why Choose Us", "Frequently Asked Questions"],
      searchIntent: category === "Pricing" ? "Transactional" : "Informational",
      schemaType: category === "Pricing" ? "PriceSpecification" : "WebPage",
      canonicalUrl: `https://${cleanDomain}${pathClean}`,
      priorityScore: 90,
      implementationSnippet: `export const metadata = {\n  title: "${inferred.title}",\n  description: "${inferred.metaDescription}",\n  alternates: { canonical: "https://${cleanDomain}${pathClean}" }\n};`,
    };

    const updated = [...localPages, newPage];
    setLocalPages(updated);
    if (onUpdatePages) {
      onUpdatePages(updated);
    }
    setQuickPathInput("");
    setExpandedPageId(newPage.id);
  };

  // Switch active primary keyword for a page with 1-click
  const handleSelectPrimaryKeywordForPage = (pageId: string, keywordOption: string) => {
    const updated = localPages.map((p) => {
      if (p.id === pageId) {
        const newKw = keywordOption.trim();
        const oldPrimary = p.primaryKeyword;
        
        // Preserve old primary in secondary keywords if different
        const newSec = Array.from(
          new Set([
            ...(p.secondaryKeywords || []).filter((k) => k.toLowerCase() !== newKw.toLowerCase()),
            ...(oldPrimary && oldPrimary.toLowerCase() !== newKw.toLowerCase() ? [oldPrimary] : []),
          ])
        );

        // Re-generate tailored title & H1 reflecting this new primary keyword
        const words = newKw
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        const newTitle = p.path === "/" ? `${words} | ${siteName} — Official Site` : `${words} — ${siteName}`;
        const newH1 = words;
        const newDescription = p.metaDescription && p.metaDescription.includes(oldPrimary)
          ? p.metaDescription.replace(new RegExp(oldPrimary, "gi"), newKw)
          : `Discover ${newKw} on ${siteName}. Complete guide, top features, and clear insights tailored for optimal search visibility.`;

        // Update keyword options array
        const baseOptions = p.keywordOptions && p.keywordOptions.length > 0
          ? p.keywordOptions
          : generateKeywordOptionsForPath(p.path, siteName, p.primaryKeyword, p.secondaryKeywords);

        const newOptions = baseOptions.map((opt) => ({
          ...opt,
          isPrimary: opt.keyword.toLowerCase() === newKw.toLowerCase(),
        }));

        return {
          ...p,
          primaryKeyword: newKw,
          secondaryKeywords: newSec,
          title: newTitle,
          h1: newH1,
          metaDescription: newDescription,
          keywordOptions: newOptions,
          implementationSnippet: `export const metadata = {\n  title: "${newTitle}",\n  description: "${newDescription}",\n  alternates: { canonical: "${p.canonicalUrl || `https://${cleanDomain}${p.path}`}" }\n};`,
        };
      }
      return p;
    });

    setLocalPages(updated);
    if (onUpdatePages) {
      onUpdatePages(updated);
    }
  };

  // Toggle secondary/LSI keyword inclusion for a page
  const handleToggleSecondaryKeyword = (pageId: string, kw: string) => {
    const updated = localPages.map((p) => {
      if (p.id === pageId) {
        const exists = (p.secondaryKeywords || []).some((k) => k.toLowerCase() === kw.toLowerCase());
        const nextSec = exists
          ? (p.secondaryKeywords || []).filter((k) => k.toLowerCase() !== kw.toLowerCase())
          : [...(p.secondaryKeywords || []), kw];
        return {
          ...p,
          secondaryKeywords: nextSec,
        };
      }
      return p;
    });
    setLocalPages(updated);
    if (onUpdatePages) onUpdatePages(updated);
  };

  // Add custom keyword option to a page
  const handleAddCustomKeywordOption = (pageId: string) => {
    const inputVal = customKwInputs[pageId]?.trim();
    if (!inputVal) return;

    const updated = localPages.map((p) => {
      if (p.id === pageId) {
        const currentOptions = p.keywordOptions && p.keywordOptions.length > 0
          ? p.keywordOptions
          : generateKeywordOptionsForPath(p.path, siteName, p.primaryKeyword, p.secondaryKeywords);

        if (currentOptions.some((o) => o.keyword.toLowerCase() === inputVal.toLowerCase())) {
          return p;
        }

        const newOpt: KeywordOption = {
          keyword: inputVal,
          searchVolume: "8.5K/mo",
          difficulty: 25,
          difficultyLabel: "Easy",
          intent: "Commercial",
          cpc: "$2.90",
          isPrimary: false,
        };

        return {
          ...p,
          keywordOptions: [newOpt, ...currentOptions],
          secondaryKeywords: [...(p.secondaryKeywords || []), inputVal],
        };
      }
      return p;
    });

    setLocalPages(updated);
    if (onUpdatePages) onUpdatePages(updated);
    setCustomKwInputs({ ...customKwInputs, [pageId]: "" });
  };

  // Keep in sync with parent props
  React.useEffect(() => {
    setLocalPages(pages);
    if (pages.length > 0 && !expandedPageId) {
      setExpandedPageId(pages[0].id);
    }
  }, [pages]);

  // Dynamically derive page types from the loaded domain pages
  const availablePageTypes = [
    "all",
    ...Array.from(new Set(localPages.map((p) => p.pageType).filter(Boolean))),
  ];

  const filteredPages = localPages.filter((p) => {
    const matchesSearch =
      p.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.primaryKeyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pageType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || p.pageType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleRemovePage = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    const updated = localPages.filter((p) => p.id !== pageId);
    setLocalPages(updated);
    if (onUpdatePages) {
      onUpdatePages(updated);
    }
  };

  const handleAddNewPage = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPath = normalizePath(newPath);
    if (!formattedPath || !newTitle.trim()) return;

    const initialOptions = generateKeywordOptionsForPath(
      formattedPath,
      siteName,
      newPrimaryKw.trim() || formattedPath.replace(/[/_-]/g, " ").trim(),
      []
    );

    const newPage: PageSeoItem = {
      id: `p-custom-${Date.now()}`,
      path: formattedPath,
      pageType: newPageType,
      title: newTitle.trim(),
      metaDescription: newDescription.trim() || `Learn more about ${formattedPath} on ${siteName}.`,
      primaryKeyword: newPrimaryKw.trim() || formattedPath.replace(/[/_-]/g, " ").trim(),
      secondaryKeywords: [`${siteName.toLowerCase()} ${formattedPath.replace(/[/_-]/g, " ").trim()}`],
      keywordOptions: initialOptions,
      h1: newTitle.trim().split("|")[0].trim(),
      h2s: ["Key Features & Details", "Why Choose Us", "Frequently Asked Questions"],
      searchIntent: newPageType === "Pricing" ? "Transactional" : newPageType === "Features/Services" ? "Commercial" : "Informational",
      schemaType: newPageType === "Pricing" ? "PriceSpecification" : "WebPage",
      canonicalUrl: `https://${cleanDomain}${formattedPath}`,
      priorityScore: 90,
      implementationSnippet: `export const metadata = {\n  title: "${newTitle.trim()}",\n  description: "${newDescription.trim() || `Explore ${formattedPath} at ${siteName}.`}",\n  alternates: { canonical: "https://${cleanDomain}${formattedPath}" }\n};`,
    };

    const updated = [...localPages, newPage];
    setLocalPages(updated);
    if (onUpdatePages) {
      onUpdatePages(updated);
    }

    // Reset & close
    setNewPath("");
    setNewTitle("");
    setNewDescription("");
    setNewPrimaryKw("");
    setShowAddPageModal(false);
    setExpandedPageId(newPage.id);
  };

  const handleCopySnippet = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleToggleExpand = (id: string) => {
    setExpandedPageId(expandedPageId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-2">
            <Layers className="h-3.5 w-3.5" />
            Page-by-Page SEO Architecture
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Every Page SEO Breakdown for {cleanDomain}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Targeted Meta Titles, Meta Descriptions, H1 headlines, keywords &amp; Schemas engineered for every core page.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddPageModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs"
          >
            <Sparkles className="h-4 w-4" />
            <span>+ Add Specific Page</span>
          </button>

          <button
            onClick={() => exportPagesToCSV(localPages, cleanDomain)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-all border border-blue-200"
          >
            <Download className="h-4 w-4" />
            <span>Export Pages CSV ({localPages.length})</span>
          </button>
        </div>
      </div>

      {/* Quick Paste & Add Page Path Bar */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50 p-3 sm:p-4 rounded-2xl border border-blue-100/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 shrink-0">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-2xs">
            <Link2 className="h-3.5 w-3.5" />
          </div>
          <span>Quick Paste Path / URL:</span>
        </div>

        <div className="flex-1 flex items-center bg-white rounded-xl border border-slate-200 shadow-inner px-3 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <span className="text-slate-400 font-mono text-xs hidden md:inline shrink-0">https://{cleanDomain}</span>
          <input
            type="text"
            value={quickPathInput}
            onChange={(e) => setQuickPathInput(e.target.value)}
            onPaste={(e) => {
              const text = e.clipboardData?.getData("text");
              if (text) {
                e.preventDefault();
                setQuickPathInput(normalizePath(text));
                setQuickPasteFeedback(true);
                setTimeout(() => setQuickPasteFeedback(false), 2000);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleQuickAddPath();
              }
            }}
            placeholder="/daily-horoscope, /services, or paste any full URL..."
            className="flex-1 bg-transparent px-2 text-xs sm:text-sm font-mono text-slate-900 focus:outline-hidden"
          />

          {/* Direct Paste Clipboard Button */}
          <button
            type="button"
            onClick={handleQuickPasteFromClipboard}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 transition-colors shrink-0 mr-1.5"
            title="Paste path directly from clipboard"
          >
            {quickPasteFeedback ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Pasted!</span>
              </>
            ) : (
              <>
                <ClipboardPaste className="h-3 w-3" />
                <span>Paste</span>
              </>
            )}
          </button>

          {quickPathInput && (
            <button
              type="button"
              onClick={() => setQuickPathInput("")}
              className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleQuickAddPath()}
          disabled={!quickPathInput.trim()}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add &amp; Audit Page</span>
        </button>
      </div>

      {/* Add Specific Page Modal */}
      {showAddPageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Related Page for {cleanDomain}</h3>
                <p className="text-xs text-slate-500">Paste any URL or path to generate tailored SEO tags &amp; keywords.</p>
              </div>
              <button
                onClick={() => setShowAddPageModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewPage} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Page Path / Slug</label>
                  <button
                    type="button"
                    onClick={handleModalPasteFromClipboard}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                  >
                    {modalPasteFeedback ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Pasted!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardPaste className="h-3 w-3" />
                        <span>Paste from Clipboard</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
                  <span className="text-slate-400 font-mono">https://{cleanDomain}</span>
                  <input
                    type="text"
                    required
                    placeholder="/specific-service, /calculator, or paste full URL"
                    value={newPath}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewPath(val);
                      if (val.trim()) {
                        const inferred = inferFieldsFromPath(val, siteName);
                        if (!newTitle || newTitle.trim() === "") setNewTitle(inferred.title);
                        if (!newPrimaryKw || newPrimaryKw.trim() === "") setNewPrimaryKw(inferred.primaryKeyword);
                        if (!newDescription || newDescription.trim() === "") setNewDescription(inferred.metaDescription);
                      }
                    }}
                    onPaste={(e) => {
                      const text = e.clipboardData?.getData("text");
                      if (text) {
                        e.preventDefault();
                        const cleaned = normalizePath(text);
                        setNewPath(cleaned);
                        const inferred = inferFieldsFromPath(cleaned, siteName);
                        if (!newTitle || newTitle.trim() === "") setNewTitle(inferred.title);
                        if (!newPrimaryKw || newPrimaryKw.trim() === "") setNewPrimaryKw(inferred.primaryKeyword);
                        if (!newDescription || newDescription.trim() === "") setNewDescription(inferred.metaDescription);
                        setModalPasteFeedback(true);
                        setTimeout(() => setModalPasteFeedback(false), 2000);
                      }
                    }}
                    className="flex-1 bg-transparent pl-1 font-mono font-medium text-slate-900 focus:outline-hidden"
                  />
                </div>
                {newPath && (
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Target URL: <span className="text-blue-600 font-semibold">https://{cleanDomain}{normalizePath(newPath)}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Page Category</label>
                  <select
                    value={newPageType}
                    onChange={(e) => setNewPageType(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800 bg-white"
                  >
                    <option value="Features/Services">Features / Services</option>
                    <option value="Pricing">Pricing / Plans</option>
                    <option value="Solutions">Solutions / Products</option>
                    <option value="Blog/Content">Blog / Content</option>
                    <option value="Docs/Resources">Docs / Resources</option>
                    <option value="About/Company">About / Team</option>
                    <option value="Contact/Lead">Contact / Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Keyword</label>
                  <input
                    type="text"
                    placeholder="e.g. daily horoscope chart"
                    value={newPrimaryKw}
                    onChange={(e) => setNewPrimaryKw(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meta Title (50-60 chars)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Natal Chart Calculator & Astrology Readings"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meta Description (145-160 chars)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Calculate your exact natal birth chart with planetary houses, rising sign, and daily planetary aspects."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPageModal(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs"
                >
                  Add Page to Architecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by path (/pricing, /services), keyword, or title..."
            className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all text-slate-900"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {availablePageTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedType === type
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              {type === "all" ? "All Pages" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Pages List */}
      {filteredPages.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No pages matched your search filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try searching for a different URL path or resetting the page type filter.</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedType("all");
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPages.map((page) => {
            const isExpanded = expandedPageId === page.id;
            const fullUrl = `https://${cleanDomain}${page.path.startsWith("/") ? page.path : `/${page.path}`}`;

            return (
              <div
                key={page.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => handleToggleExpand(page.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none bg-white hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 font-mono font-bold text-xs">
                      {page.path === "/" ? "HOME" : page.path.substring(1, 4).toUpperCase()}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900 hover:text-blue-600">
                          {page.path}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {page.pageType}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Schema: {page.schemaType}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                          Priority: {page.priorityScore}/100
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium line-clamp-1">
                        {page.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <div className="text-right hidden md:block mr-1">
                      <div className="text-[11px] font-semibold text-slate-500">Primary Keyword:</div>
                      <div className="text-xs font-bold text-slate-900">{page.primaryKeyword}</div>
                    </div>

                    <button
                      type="button"
                      title="Remove unrelated page"
                      onClick={(e) => handleRemovePage(e, page.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-6 space-y-6">
                    {/* Google SERP Preview for this page */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-blue-600" />
                          Live Google SERP Snippet Preview:
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{fullUrl}</span>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                        <div className="text-xs text-slate-600 flex items-center gap-1 font-sans truncate">
                          <span className="font-semibold text-slate-800">{siteName}</span>
                          <span className="text-slate-400">›</span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            {fullUrl}
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-blue-700 hover:underline cursor-pointer leading-tight">
                          {page.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">
                          {page.metaDescription}
                        </p>
                      </div>
                    </div>

                    {/* Metadata & Tag Specs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Meta Title Info */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Meta Title</span>
                          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {page.title.length} / 60 Chars
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          {page.title}
                        </p>
                      </div>

                      {/* Meta Description Info */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Meta Description</span>
                          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {page.metaDescription.length} / 160 Chars
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          {page.metaDescription}
                        </p>
                      </div>
                    </div>

                    {/* Keyword & Heading Architecture */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Multiple Keywords Options for this page */}
                      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div>
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Target className="h-4 w-4 text-blue-600" />
                              Target Keyword Options &amp; Search Variations:
                            </span>
                            <p className="text-[11px] text-slate-500">
                              Click <strong className="text-blue-700">Set Primary</strong> to swap focus keyword and auto-regenerate Title/H1.
                            </p>
                          </div>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0 self-start sm:self-auto">
                            {(page.keywordOptions && page.keywordOptions.length > 0
                              ? page.keywordOptions
                              : generateKeywordOptionsForPath(page.path, siteName, page.primaryKeyword, page.secondaryKeywords)).length} Options Available
                          </span>
                        </div>

                        {/* Keyword Options List */}
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {(page.keywordOptions && page.keywordOptions.length > 0
                            ? page.keywordOptions
                            : generateKeywordOptionsForPath(page.path, siteName, page.primaryKeyword, page.secondaryKeywords)
                          ).map((opt, i) => {
                            const isCurrentPrimary = opt.keyword.toLowerCase() === page.primaryKeyword.toLowerCase() || opt.isPrimary;
                            const isCurrentSecondary = (page.secondaryKeywords || []).some(
                              (k) => k.toLowerCase() === opt.keyword.toLowerCase()
                            );

                            return (
                              <div
                                key={`${opt.keyword}-${i}`}
                                className={`p-2.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                  isCurrentPrimary
                                    ? "bg-blue-50/80 border-blue-300 ring-1 ring-blue-300/60"
                                    : "bg-slate-50/70 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                }`}
                              >
                                <div className="space-y-1 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-900 font-mono">
                                      {opt.keyword}
                                    </span>

                                    {isCurrentPrimary && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs">
                                        <Check className="h-2.5 w-2.5" />
                                        Active Primary Focus
                                      </span>
                                    )}

                                    {isCurrentSecondary && !isCurrentPrimary && (
                                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                                        Secondary LSI
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                    <span>Vol: <strong className="text-slate-700 font-semibold">{opt.searchVolume || "10K/mo"}</strong></span>
                                    <span>•</span>
                                    <span>
                                      KD: <strong className={`font-semibold ${
                                        (opt.difficulty || 30) <= 30
                                          ? "text-emerald-600"
                                          : (opt.difficulty || 30) <= 60
                                          ? "text-amber-600"
                                          : "text-red-600"
                                      }`}>
                                        {opt.difficulty || 30} ({opt.difficultyLabel || ((opt.difficulty || 30) <= 30 ? "Easy" : "Medium")})
                                      </strong>
                                    </span>
                                    <span>•</span>
                                    <span className="px-1.5 py-0.2 rounded bg-white border border-slate-200 text-[10px] font-medium text-slate-600">
                                      {opt.intent || "Commercial"}
                                    </span>
                                    <span>•</span>
                                    <span>CPC: <strong className="text-slate-700">{opt.cpc || "$2.40"}</strong></span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                  {!isCurrentPrimary && (
                                    <button
                                      type="button"
                                      onClick={() => handleSelectPrimaryKeywordForPage(page.id, opt.keyword)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-2xs transition-colors"
                                    >
                                      <Sparkles className="h-3 w-3" />
                                      Set Primary
                                    </button>
                                  )}

                                  {!isCurrentPrimary && (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSecondaryKeyword(page.id, opt.keyword)}
                                      className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                                        isCurrentSecondary
                                          ? "bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300"
                                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                      }`}
                                    >
                                      {isCurrentSecondary ? "Remove Secondary" : "+ Secondary"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Add Custom Keyword Option Input */}
                        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                          <input
                            type="text"
                            value={customKwInputs[page.id] || ""}
                            onChange={(e) =>
                              setCustomKwInputs({ ...customKwInputs, [page.id]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCustomKeywordOption(page.id);
                              }
                            }}
                            placeholder="Add your own custom target keyword option..."
                            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500 text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCustomKeywordOption(page.id)}
                            disabled={!customKwInputs[page.id]?.trim()}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white text-xs font-semibold shrink-0 transition-colors"
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            Add Option
                          </button>
                        </div>
                      </div>

                      {/* Headings Architecture */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-indigo-600" />
                          Recommended On-Page Headings:
                        </span>

                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-bold text-indigo-600 font-mono mr-1.5">H1:</span>
                            <span className="font-semibold text-slate-900">{page.h1}</span>
                          </div>

                          {page.h2s && page.h2s.length > 0 && (
                            <div className="space-y-1">
                              <span className="font-bold text-slate-500 font-mono text-[11px]">Recommended H2s:</span>
                              <ul className="space-y-1 pl-3 border-l-2 border-slate-200 text-slate-700">
                                {page.h2s.map((h2, i) => (
                                  <li key={i} className="text-xs">
                                    • {h2}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ready Implementation Code Snippet */}
                    <div className="bg-slate-900 rounded-xl p-4 text-white space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-blue-400" />
                          <span className="text-xs font-bold text-slate-200">
                            Ready-to-Paste Next.js / React Metadata for {page.path}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopySnippet(page.id, page.implementationSnippet || `export const metadata = { title: "${page.title}", description: "${page.metaDescription}" };`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                        >
                          {copiedSnippetId === page.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Snippet</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded-lg overflow-x-auto">
                        <code>{page.implementationSnippet || `export const metadata = {\n  title: "${page.title}",\n  description: "${page.metaDescription}",\n  alternates: { canonical: "${page.canonicalUrl || fullUrl}" }\n};`}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
