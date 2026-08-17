import React, { useState } from "react";
import { TechCodeSnippets } from "../types";
import { Code2, Copy, Check, FileCode, Terminal, Sparkles, Layers, BookOpen } from "lucide-react";

interface TechCodeStudioProps {
  snippets: TechCodeSnippets;
  siteName: string;
  cleanDomain: string;
}

interface TechTab {
  id: keyof TechCodeSnippets;
  name: string;
  badge: string;
  iconColor: string;
  targetFile: string;
  language: string;
  description: string;
}

const TECH_TABS: TechTab[] = [
  {
    id: "nextjsAppRouter",
    name: "Next.js (App Router)",
    badge: "Next.js 14 / 15",
    iconColor: "text-slate-900 bg-slate-100",
    targetFile: "app/layout.tsx or app/page.tsx",
    language: "typescript",
    description: "Export static `Metadata` or dynamic `generateMetadata` with full OpenGraph & Twitter schema.",
  },
  {
    id: "nextjsPagesRouter",
    name: "Next.js (Pages Router)",
    badge: "Next.js Pages",
    iconColor: "text-slate-800 bg-slate-100",
    targetFile: "pages/_app.tsx or pages/index.tsx",
    language: "tsx",
    description: "Declarative `<Head>` component with canonical links, social tags, and viewport configs.",
  },
  {
    id: "wordpress",
    name: "WordPress",
    badge: "WP 6.x / Yoast / RankMath",
    iconColor: "text-blue-700 bg-blue-50",
    targetFile: "functions.php or custom plugin",
    language: "php",
    description: "Clean `wp_head` hook function escaping all dynamic properties and social meta tags.",
  },
  {
    id: "viteReact",
    name: "Vite + React",
    badge: "Vite / React 18 & 19",
    iconColor: "text-purple-600 bg-purple-50",
    targetFile: "index.html or react-helmet-async",
    language: "html",
    description: "Standard HTML root header plus react-helmet-async component for Single Page Apps.",
  },
  {
    id: "astro",
    name: "Astro",
    badge: "Astro 4+",
    iconColor: "text-orange-600 bg-orange-50",
    targetFile: "src/layouts/BaseLayout.astro",
    language: "astro",
    description: "Zero-JS fast layout component with dynamic Props interface for SEO canonicals.",
  },
  {
    id: "nuxt",
    name: "Nuxt 3",
    badge: "Nuxt 3 / Vue 3",
    iconColor: "text-emerald-600 bg-emerald-50",
    targetFile: "app.vue or pages/index.vue",
    language: "vue",
    description: "`useSeoMeta()` and `useHead()` composables for full server-side rendering (SSR) indexing.",
  },
  {
    id: "shopify",
    name: "Shopify (Liquid)",
    badge: "Shopify Theme 2.0",
    iconColor: "text-lime-700 bg-lime-50",
    targetFile: "snippets/seo-meta-tags.liquid",
    language: "liquid",
    description: "Liquid snippet for `theme.liquid` with dynamic page title, handle, and product tags.",
  },
  {
    id: "jsonLdSchema",
    name: "Schema.org (JSON-LD)",
    badge: "Google Rich Snippets",
    iconColor: "text-amber-600 bg-amber-50",
    targetFile: "HTML <head> script tag",
    language: "json",
    description: "Structured Data for Organization, WebSite (SearchAction), and FAQPage rich results.",
  },
  {
    id: "html5",
    name: "Standard HTML5",
    badge: "Pure HTML",
    iconColor: "text-rose-600 bg-rose-50",
    targetFile: "index.html <head>",
    language: "html",
    description: "Universal standards-compliant HTML5 metadata block with OpenGraph and Twitter tags.",
  },
];

export function TechCodeStudio({ snippets, siteName, cleanDomain }: TechCodeStudioProps) {
  const [activeTabId, setActiveTabId] = useState<keyof TechCodeSnippets>("nextjsAppRouter");
  const [copied, setCopied] = useState(false);

  const activeTab = TECH_TABS.find((t) => t.id === activeTabId) || TECH_TABS[0];
  const activeCode = snippets[activeTab.id] || "";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Multi-Technology Implementation Snippets</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Copy & Paste Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Production-grade meta tags, OpenGraph tags, and Schema.org JSON-LD tailored for your exact stack.
          </p>
        </div>

        <button
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-black text-xs font-semibold text-white shadow-xs transition-all"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy {activeTab.name} Snippet</span>
            </>
          )}
        </button>
      </div>

      {/* Tech Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 scrollbar-none">
        {TECH_TABS.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200/70 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Code2 className="h-3.5 w-3.5 shrink-0" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Code Display Area */}
      <div className="space-y-3">
        {/* Placement Guide Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Target File:</span>
            <code className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700 font-semibold">
              {activeTab.targetFile}
            </code>
          </div>
          <span className="text-slate-500 font-medium text-[11px]">{activeTab.description}</span>
        </div>

        {/* Code Block */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] shadow-md group">
          {/* Code Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 font-mono">
              <Terminal className="h-3.5 w-3.5 text-blue-400" />
              <span>{activeTab.targetFile}</span>
            </div>
            <span className="uppercase text-[10px] tracking-wider text-slate-500 font-bold">
              {activeTab.language}
            </span>
          </div>

          {/* Preformatted Code Content */}
          <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed max-h-[420px] scrollbar-thin">
            <code>{activeCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
