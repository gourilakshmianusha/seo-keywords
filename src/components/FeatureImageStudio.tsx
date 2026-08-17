import React, { useState, useRef, useEffect } from "react";
import { FeatureImageSpec } from "../types";
import { Image as ImageIcon, Download, Copy, Check, Sparkles, Share2, Palette, RefreshCw, Eye } from "lucide-react";

interface FeatureImageStudioProps {
  featureImage: FeatureImageSpec;
  cleanDomain: string;
  siteName: string;
  metaTitle: string;
  metaDesc: string;
}

const GRADIENT_THEMES = [
  { id: "midnight", name: "Midnight Sapphire", start: "#0F172A", mid: "#1E293B", end: "#1D4ED8", text: "#FFFFFF", badgeBg: "#3B82F6" },
  { id: "emerald", name: "Cyber Emerald", start: "#064E3B", mid: "#065F46", end: "#059669", text: "#FFFFFF", badgeBg: "#10B981" },
  { id: "indigo", name: "Royal Violet", start: "#31104B", mid: "#4C1D95", end: "#6D28D9", text: "#FFFFFF", badgeBg: "#8B5CF6" },
  { id: "sunset", name: "Sunset Crimson", start: "#1E1B4B", mid: "#831843", end: "#BE123C", text: "#FFFFFF", badgeBg: "#F43F5E" },
  { id: "obsidian", name: "Obsidian Tech", start: "#0A0A0A", mid: "#171717", end: "#262626", text: "#FFFFFF", badgeBg: "#E5E5E5" },
];

export function FeatureImageStudio({
  featureImage,
  cleanDomain,
  siteName,
  metaTitle,
  metaDesc,
}: FeatureImageStudioProps) {
  const [headline, setHeadline] = useState(featureImage.headline || `Scale Faster With ${siteName}`);
  const [subheadline, setSubheadline] = useState(featureImage.subheadline || "The Modern High-Performance SEO Platform");
  const [badge, setBadge] = useState(featureImage.badge || "★ #1 RATED PLATFORM 2026");
  const [selectedTheme, setSelectedTheme] = useState(GRADIENT_THEMES[0]);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedAlt, setCopiedAlt] = useState(false);
  const [socialPlatform, setSocialPlatform] = useState<"twitter" | "linkedin" | "facebook">("twitter");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Re-render canvas when headline, theme, or badge changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set 1200x630 resolution
    canvas.width = 1200;
    canvas.height = 630;

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, selectedTheme.start);
    gradient.addColorStop(0.5, selectedTheme.mid);
    gradient.addColorStop(1, selectedTheme.end);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Decorative geometric grid lines / glows
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 1200; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 630);
      ctx.stroke();
    }
    for (let y = 0; y < 630; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    // Glowing circle accent
    const radGlow = ctx.createRadialGradient(1000, 150, 10, 1000, 150, 400);
    radGlow.addColorStop(0, "rgba(96, 165, 250, 0.25)");
    radGlow.addColorStop(1, "rgba(96, 165, 250, 0)");
    ctx.fillStyle = radGlow;
    ctx.beginPath();
    ctx.arc(1000, 150, 400, 0, Math.PI * 2);
    ctx.fill();

    // Top Left Brand Badge
    ctx.fillStyle = selectedTheme.badgeBg;
    ctx.beginPath();
    ctx.roundRect(80, 80, 240, 38, 19);
    ctx.fill();

    ctx.fillStyle = selectedTheme.id === "obsidian" ? "#000000" : "#FFFFFF";
    ctx.font = "bold 16px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(badge.toUpperCase(), 200, 105);

    // Domain pill on right
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.beginPath();
    ctx.roundRect(900, 80, 220, 38, 19);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "600 16px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(cleanDomain, 1010, 105);

    // Main Headline
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 56px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";

    // Multi-line word wrap for headline
    const words = headline.split(" ");
    let line = "";
    let curY = 240;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 950 && n > 0) {
        ctx.fillText(line, 80, curY);
        line = words[n] + " ";
        curY += 68;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 80, curY);

    // Subheadline
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "30px Inter, system-ui, sans-serif";
    ctx.fillText(subheadline, 80, curY + 64);

    // Bottom Decorative Bar
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(80, 540, 1040, 2);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "16px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`1200 × 630px • High-Res OpenGraph Social Card`, 80, 575);

    ctx.textAlign = "right";
    ctx.fillText(`© ${new Date().getFullYear()} ${siteName}. All rights reserved.`, 1120, 575);
  }, [headline, subheadline, badge, selectedTheme, cleanDomain, siteName]);

  // Download high-resolution PNG
  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageUri = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `og-image-${cleanDomain}.png`;
    link.href = imageUri;
    link.click();
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(featureImage.aiPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const copyAltText = () => {
    navigator.clipboard.writeText(featureImage.altText);
    setCopiedAlt(true);
    setTimeout(() => setCopiedAlt(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Feature Image & OpenGraph (1200x630) Studio</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Social Media Card
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic OpenGraph banner generator and social media share card preview for maximum CTR on Twitter, LinkedIn, and Facebook.
          </p>
        </div>

        <button
          id="btn-download-og-png"
          onClick={handleDownloadPNG}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-semibold text-white shadow-sm transition-all"
        >
          <Download className="h-4 w-4" />
          <span>Download 1200x630 PNG</span>
        </button>
      </div>

      {/* Main Grid: Live Canvas & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Canvas & Customizer */}
        <div className="lg:col-span-7 space-y-4">
          {/* Canvas Render Container */}
          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 aspect-[1.91/1] relative group">
            <canvas ref={canvasRef} className="w-full h-full object-cover block" />
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-white font-mono">
              1200 × 630 px (1.91:1)
            </div>
          </div>

          {/* Theme Gradient Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-slate-400" />
              Select Brand Gradient Palette
            </label>
            <div className="flex flex-wrap gap-2">
              {GRADIENT_THEMES.map((theme) => {
                const isSelected = selectedTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-white/50 shadow-xs"
                      style={{ background: `linear-gradient(135deg, ${theme.start}, ${theme.end})` }}
                    />
                    <span>{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Tag</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subheadline</label>
              <input
                type="text"
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Social Media Share Previews & AI Prompts */}
        <div className="lg:col-span-5 space-y-4">
          {/* Social Platform Switcher */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-slate-400" />
                Live Social Share Preview
              </span>
              <div className="flex items-center gap-1">
                {(["twitter", "linkedin", "facebook"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSocialPlatform(p)}
                    className={`text-[10px] uppercase font-bold px-2 py-1 rounded transition-all ${
                      socialPlatform === p
                        ? "bg-slate-900 text-white"
                        : "text-slate-500 hover:text-slate-900 bg-white border border-slate-200"
                    }`}
                  >
                    {p === "twitter" ? "X / Twitter" : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Card Box */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              {/* Preview Thumbnail */}
              <div
                className="w-full aspect-[1.91/1] flex items-center justify-center text-white p-4 relative"
                style={{ background: `linear-gradient(135deg, ${selectedTheme.start}, ${selectedTheme.end})` }}
              >
                <div className="text-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs block mb-1">
                    {badge}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold line-clamp-2">{headline}</h4>
                  <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">{subheadline}</p>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-3 bg-white">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  {cleanDomain}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5 truncate">{metaTitle}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">{metaDesc}</p>
              </div>
            </div>
          </div>

          {/* AI Generative Image Prompt */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                Midjourney / DALL-E / Gemini Prompt
              </label>
              <button
                onClick={copyPrompt}
                className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-800"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 font-mono leading-relaxed">
              {featureImage.aiPrompt}
            </p>
          </div>

          {/* Image SEO Alt-Text */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100/70 border border-slate-200 text-xs">
            <div className="max-w-[80%]">
              <span className="font-semibold text-slate-600 block text-[10px] uppercase">
                Image Alt-Text (Image SEO):
              </span>
              <span className="text-slate-800 font-medium truncate block">{featureImage.altText}</span>
            </div>
            <button
              onClick={copyAltText}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0 ml-2"
            >
              {copiedAlt ? "Copied" : "Copy Alt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
