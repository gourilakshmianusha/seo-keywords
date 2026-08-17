import React, { useState } from "react";
import { MetaTagPreset } from "../types";
import { Copy, Check, Eye, Smartphone, Monitor, Sparkles, CheckCircle2, AlertTriangle, Edit3 } from "lucide-react";

interface MetaTagsStudioProps {
  metaTags: MetaTagPreset[];
  cleanDomain: string;
  siteName: string;
}

export function MetaTagsStudio({ metaTags, cleanDomain, siteName }: MetaTagsStudioProps) {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [isEditing, setIsEditing] = useState(false);

  // Custom editable state
  const currentPreset = metaTags[selectedPresetIndex] || metaTags[0];
  const [customTitle, setCustomTitle] = useState(currentPreset?.metaTitle || "");
  const [customDesc, setCustomDesc] = useState(currentPreset?.metaDescription || "");

  // Update custom fields when preset changes
  React.useEffect(() => {
    if (currentPreset) {
      setCustomTitle(currentPreset.metaTitle);
      setCustomDesc(currentPreset.metaDescription);
    }
  }, [selectedPresetIndex, currentPreset]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const titleLength = customTitle.length;
  const descLength = customDesc.length;

  // Google limits: Title ~60 chars (approx 580px), Desc ~160 chars
  const isTitleOptimal = titleLength >= 45 && titleLength <= 60;
  const isTitleLong = titleLength > 60;
  const isDescOptimal = descLength >= 135 && descLength <= 160;
  const isDescLong = descLength > 160;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
      {/* Title & Description Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Meta Title & Description Engineering</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              High-CTR Formulas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Optimized for Google SERP display limits, maximum search engine visibility, and organic click-through rates.
          </p>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setDeviceView("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              deviceView === "desktop"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>Desktop SERP</span>
          </button>
          <button
            onClick={() => setDeviceView("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              deviceView === "mobile"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Mobile SERP</span>
          </button>
        </div>
      </div>

      {/* Preset Formula Tabs */}
      <div className="flex flex-wrap gap-2">
        {metaTags.map((preset, idx) => {
          const isSelected = selectedPresetIndex === idx;
          return (
            <button
              key={preset.id || idx}
              onClick={() => {
                setSelectedPresetIndex(idx);
                setIsEditing(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                <span>{preset.type}</span>
              </div>
              <span className={`text-[10px] block opacity-85 font-normal truncate max-w-[200px]`}>
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Editor & Live SERP Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Meta Fields & Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* Meta Title Field */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Page Meta Title (&lt;title&gt;)
                </label>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isTitleOptimal
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : isTitleLong
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {titleLength} / 60 chars {isTitleOptimal ? "✓ Optimal" : isTitleLong ? "⚠ Truncated" : "Short"}
                </span>
              </div>

              <button
                onClick={() => copyToClipboard(customTitle, "title")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                {copiedField === "title" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={2}
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full text-sm font-semibold bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-snug"
            />

            {/* Character Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  isTitleOptimal ? "bg-emerald-500" : isTitleLong ? "bg-rose-500" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, (titleLength / 60) * 100)}%` }}
              />
            </div>
          </div>

          {/* Meta Description Field */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Meta Description (&lt;meta name="description"&gt;)
                </label>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isDescOptimal
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : isDescLong
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {descLength} / 160 chars {isDescOptimal ? "✓ Optimal" : isDescLong ? "⚠ Truncated" : "Short"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Generate a simple, plain-English version of the description
                    const cleanSite = siteName || cleanDomain;
                    const simpleVersion = `Discover simple and reliable solutions with ${cleanSite}. Learn more about our features, pricing, and get started free today.`;
                    setCustomDesc(simpleVersion);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
                  title="Make description simple, direct, and easy to understand"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Simplify Language</span>
                </button>

                <button
                  onClick={() => copyToClipboard(customDesc, "desc")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  {copiedField === "desc" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              placeholder="Simple description explaining what this site offers and why to click..."
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed"
            />

            {/* Character Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  isDescOptimal ? "bg-emerald-500" : isDescLong ? "bg-rose-500" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, (descLength / 160) * 100)}%` }}
              />
            </div>

            {/* Simple Readability Tip */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
              <span>✨ <strong>Rule of thumb:</strong> Plain statement + direct benefit + simple call-to-action.</span>
              <span className="font-semibold text-slate-600">Goal: 140–155 chars</span>
            </div>
          </div>

          {/* Canonical & Focus Keyword pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-100/70 p-3 rounded-lg border border-slate-200/60">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Focus Keyword:</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {currentPreset?.focusKeyword || siteName}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Canonical:</span>
              <span className="font-mono text-slate-700">https://{cleanDomain}/</span>
            </div>
          </div>
        </div>

        {/* Right: Realistic Google SERP Simulator */}
        <div className="lg:col-span-5 bg-slate-50 rounded-xl border border-slate-200/80 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                Google SERP Live Preview ({deviceView})
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Google Search Result</span>
            </div>

            {/* SERP Card Box */}
            <div
              className={`bg-white rounded-xl p-4 border border-slate-200 shadow-xs transition-all ${
                deviceView === "mobile" ? "max-w-[340px] mx-auto border-t-4 border-t-blue-600" : "w-full"
              }`}
            >
              {/* Google URL & Favicon */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-5 w-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-blue-600">
                  {siteName.charAt(0)}
                </div>
                <div className="leading-none">
                  <span className="text-xs font-medium text-slate-900 block">{siteName}</span>
                  <span className="text-[11px] text-slate-500 font-mono block">
                    https://{cleanDomain}
                  </span>
                </div>
              </div>

              {/* SERP Blue Title */}
              <h3 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
                {customTitle || `${siteName} — The Modern Solution`}
              </h3>

              {/* SERP Description */}
              <p className="text-xs text-[#4d5156] mt-1.5 leading-relaxed line-clamp-3">
                {customDesc || `Discover how ${siteName} helps you boost efficiency and scale.`}
              </p>

              {/* Simulated Sitelinks */}
              {deviceView === "desktop" && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#1a0dab] font-medium hover:underline cursor-pointer">
                      Pricing & Plans
                    </span>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      Explore transparent plans for {siteName}.
                    </p>
                  </div>
                  <div>
                    <span className="text-[#1a0dab] font-medium hover:underline cursor-pointer">
                      Features & Demos
                    </span>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      Live interactive workflow preview.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-800 font-medium">
            💡 <strong>SEO Pro-Tip:</strong> Placing your focus keyword at the front of your meta title correlates with a 15-25% boost in search ranking position.
          </div>
        </div>
      </div>
    </div>
  );
}
