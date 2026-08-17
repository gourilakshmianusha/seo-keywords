import jsPDF from "jspdf";
import { SeoAuditReport, KeywordItem, PageSeoItem } from "../types";

/**
 * Clean string for CSV escaping
 */
function escapeCsvValue(val: string | number | undefined): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Trigger browser file download
 */
function triggerDownload(content: string | Blob, fileName: string, mimeType: string) {
  const blob = typeof content === "string" ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export Keywords to CSV
 */
export function exportKeywordsToCSV(keywords: KeywordItem[], domain: string) {
  const headers = [
    "Keyword",
    "Category",
    "Search Intent",
    "Estimated Volume",
    "Difficulty (KD)",
    "Difficulty Level",
    "Est. CPC",
    "Priority",
    "Relevance Score",
    "Content Opportunity",
    "Target URL Slug",
  ];

  const rows = keywords.map((k) => [
    escapeCsvValue(k.keyword),
    escapeCsvValue(k.category.toUpperCase()),
    escapeCsvValue(k.searchIntent),
    escapeCsvValue(k.searchVolume),
    escapeCsvValue(k.difficulty),
    escapeCsvValue(k.difficultyLabel),
    escapeCsvValue(k.cpc),
    escapeCsvValue(k.priority),
    escapeCsvValue(`${k.relevanceScore}%`),
    escapeCsvValue(k.contentOpportunity),
    escapeCsvValue(k.targetUrlSlug),
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const fileName = `seo-keywords-${domain.replace(/[^a-z0-9]/gi, "-")}.csv`;
  triggerDownload(csvContent, fileName, "text/csv;charset=utf-8;");
}

/**
 * Export Page-by-Page Breakdown to CSV
 */
export function exportPagesToCSV(pages: PageSeoItem[], domain: string) {
  const headers = [
    "Path",
    "Page Type",
    "Meta Title",
    "Meta Description",
    "Primary Keyword",
    "Secondary Keywords",
    "H1 Headline",
    "Search Intent",
    "Schema Type",
    "Priority Score",
    "Canonical URL",
  ];

  const rows = (pages || []).map((p) => [
    escapeCsvValue(p.path),
    escapeCsvValue(p.pageType),
    escapeCsvValue(p.title),
    escapeCsvValue(p.metaDescription),
    escapeCsvValue(p.primaryKeyword),
    escapeCsvValue(p.secondaryKeywords ? p.secondaryKeywords.join("; ") : ""),
    escapeCsvValue(p.h1),
    escapeCsvValue(p.searchIntent),
    escapeCsvValue(p.schemaType),
    escapeCsvValue(p.priorityScore),
    escapeCsvValue(p.canonicalUrl),
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const fileName = `seo-pages-matrix-${domain.replace(/[^a-z0-9]/gi, "-")}.csv`;
  triggerDownload(csvContent, fileName, "text/csv;charset=utf-8;");
}

/**
 * Export Comprehensive SEO Audit Report to CSV
 */
export function exportFullAuditToCSV(report: SeoAuditReport) {
  const lines: string[] = [];

  lines.push("SEO & KEYWORD INTELLIGENCE AUDIT REPORT");
  lines.push(`Domain,${escapeCsvValue(report.domain)}`);
  lines.push(`Site Name,${escapeCsvValue(report.siteName)}`);
  lines.push(`Industry / Niche,${escapeCsvValue(report.niche)}`);
  lines.push(`SEO Health Score,${report.seoHealthScore}/100`);
  lines.push(`Generated Date,${escapeCsvValue(new Date(report.analyzedAt).toLocaleString())}`);
  lines.push("");

  lines.push("STRATEGIC SUMMARY");
  lines.push(escapeCsvValue(report.summary));
  lines.push("");

  lines.push("RECOMMENDED META TAGS");
  lines.push("Formula Type,Meta Title,Title Length,Meta Description,Description Length,Focus Keyword,Canonical");
  report.metaTags.forEach((m) => {
    lines.push(
      [
        escapeCsvValue(m.type),
        escapeCsvValue(m.metaTitle),
        m.metaTitleLength,
        escapeCsvValue(m.metaDescription),
        m.metaDescriptionLength,
        escapeCsvValue(m.focusKeyword),
        escapeCsvValue(m.canonicalUrl),
      ].join(",")
    );
  });
  lines.push("");

  lines.push("PAGE BY PAGE SEO MATRIX");
  lines.push("Path,Type,Title,Meta Description,Primary Keyword,H1 Headline,Schema Type,Priority");
  (report.pages || []).forEach((p) => {
    lines.push(
      [
        escapeCsvValue(p.path),
        escapeCsvValue(p.pageType),
        escapeCsvValue(p.title),
        escapeCsvValue(p.metaDescription),
        escapeCsvValue(p.primaryKeyword),
        escapeCsvValue(p.h1),
        escapeCsvValue(p.schemaType),
        p.priorityScore,
      ].join(",")
    );
  });
  lines.push("");

  lines.push("TARGET KEYWORDS LIST");
  lines.push("Keyword,Category,Search Intent,Est Volume,KD Score,Difficulty,Est CPC,Priority,Target URL");
  report.keywords.forEach((k) => {
    lines.push(
      [
        escapeCsvValue(k.keyword),
        escapeCsvValue(k.category),
        escapeCsvValue(k.searchIntent),
        escapeCsvValue(k.searchVolume),
        k.difficulty,
        escapeCsvValue(k.difficultyLabel),
        escapeCsvValue(k.cpc),
        escapeCsvValue(k.priority),
        escapeCsvValue(k.targetUrlSlug),
      ].join(",")
    );
  });

  const csvContent = "\uFEFF" + lines.join("\r\n");
  const fileName = `seo-full-audit-${report.cleanDomain}.csv`;
  triggerDownload(csvContent, fileName, "text/csv;charset=utf-8;");
}

/**
 * Export High-Fidelity Multi-Page PDF Report
 */
export function exportReportToPDF(report: SeoAuditReport) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  // Helper for page overflow
  function checkPageBreak(requiredHeight: number) {
    if (y + requiredHeight > 280) {
      doc.addPage();
      y = 18;
      // Header on subsequent pages
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(`${report.siteName} (${report.cleanDomain}) — SEO & Keyword Strategy Audit`, margin, 10);
      doc.line(margin, 12, pageWidth - margin, 12);
    }
  }

  // Cover / Header Banner
  doc.setFillColor(15, 23, 42); // Dark slate (#0F172A)
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("SEO & KEYWORD INTELLIGENCE REPORT", margin + 8, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(147, 197, 253); // Light blue
  doc.text(`Domain: ${report.cleanDomain}  |  Niche: ${report.niche}`, margin + 8, y + 20);
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${new Date(report.analyzedAt).toLocaleDateString()}  •  SEO Health Score: ${report.seoHealthScore}/100`, margin + 8, y + 27);

  y += 42;

  // Executive Summary Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("Executive Summary & Competitive Angle", margin + 5, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const summaryLines = doc.splitTextToSize(report.summary, contentWidth - 10);
  doc.text(summaryLines, margin + 5, y + 13);

  y += 32;

  // Key Recommendations
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Priority SEO Recommendations", margin, y);
  y += 6;

  report.topRecommendations.forEach((rec, idx) => {
    checkPageBreak(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(37, 99, 235);
    doc.text(`${idx + 1}.`, margin, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const recLines = doc.splitTextToSize(rec, contentWidth - 8);
    doc.text(recLines, margin + 6, y);
    y += recLines.length * 4.2 + 2;
  });

  y += 4;
  checkPageBreak(40);

  // Page-by-Page SEO Architecture Section
  if (report.pages && report.pages.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Page-by-Page SEO Architecture & Meta Strategy", margin, y);
    y += 6;

    report.pages.slice(0, 5).forEach((page) => {
      checkPageBreak(24);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`${page.path} (${page.pageType}) — Target Keyword: ${page.primaryKeyword}`, margin + 4, y + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(37, 99, 235);
      const titleLines = doc.splitTextToSize(`Title: ${page.title}`, contentWidth - 8);
      doc.text(titleLines, margin + 4, y + 10);

      doc.setTextColor(71, 85, 105);
      const descLines = doc.splitTextToSize(`Meta Description: ${page.metaDescription}`, contentWidth - 8);
      doc.text(descLines, margin + 4, y + 15);

      y += 25;
    });

    y += 4;
  }

  checkPageBreak(40);

  // Meta Tags Strategy Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Optimized Homepage Meta Variations", margin, y);
  y += 6;

  report.metaTags.forEach((meta) => {
    checkPageBreak(28);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 23, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`${meta.type} [${meta.metaTitleLength} chars]`, margin + 4, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235);
    const titleSnippet = doc.splitTextToSize(meta.metaTitle, contentWidth - 8);
    doc.text(titleSnippet, margin + 4, y + 10);

    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const descSnippet = doc.splitTextToSize(meta.metaDescription, contentWidth - 8);
    doc.text(descSnippet, margin + 4, y + 15);

    y += 27;
  });

  y += 4;
  checkPageBreak(50);

  // Keyword Matrix Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Keyword Research & Target Ranking Matrix", margin, y);
  y += 6;

  // Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, contentWidth, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("KEYWORD", margin + 3, y + 5);
  doc.text("CATEGORY", margin + 65, y + 5);
  doc.text("INTENT", margin + 92, y + 5);
  doc.text("VOLUME", margin + 118, y + 5);
  doc.text("KD", margin + 140, y + 5);
  doc.text("CPC", margin + 155, y + 5);
  doc.text("PRIORITY", margin + 168, y + 5);

  y += 7;

  report.keywords.forEach((kw, index) => {
    checkPageBreak(9);
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, 6.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    const truncatedKw = kw.keyword.length > 35 ? kw.keyword.substring(0, 33) + "..." : kw.keyword;
    doc.text(truncatedKw, margin + 3, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(kw.category.toUpperCase(), margin + 65, y + 4.5);
    doc.text(kw.searchIntent, margin + 92, y + 4.5);
    doc.text(kw.searchVolume, margin + 118, y + 4.5);

    // Difficulty with colored text
    doc.setFont("helvetica", "bold");
    if (kw.difficulty < 30) doc.setTextColor(22, 163, 74); // Green
    else if (kw.difficulty < 60) doc.setTextColor(202, 138, 4); // Yellow
    else doc.setTextColor(220, 38, 38); // Red
    doc.text(`${kw.difficulty}`, margin + 140, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(kw.cpc, margin + 155, y + 4.5);

    if (kw.priority === "High") doc.setTextColor(225, 29, 72);
    else if (kw.priority === "Medium") doc.setTextColor(37, 99, 235);
    else doc.setTextColor(100, 116, 139);
    doc.text(kw.priority, margin + 168, y + 4.5);

    y += 6.5;
  });

  y += 6;
  checkPageBreak(45);

  // Feature Image Specifications
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("OpenGraph Feature Image (1200x630) Specifications", margin, y);
  y += 6;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`Headline: ${report.featureImage.headline}`, margin + 4, y + 5);
  doc.text(`Subheadline: ${report.featureImage.subheadline}`, margin + 4, y + 10);
  doc.text(`Badge: ${report.featureImage.badge}  |  Alt Text: ${report.featureImage.altText}`, margin + 4, y + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("AI Image Generation Prompt (Midjourney / DALL-E / Gemini):", margin + 4, y + 21);
  const promptLines = doc.splitTextToSize(report.featureImage.aiPrompt, contentWidth - 8);
  doc.text(promptLines, margin + 4, y + 25);

  y += 38;
  checkPageBreak(30);

  // Footer note
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated by Domain SEO & Keyword Intelligence Suite. Multi-industry code snippets ready for Next.js, WordPress, Vite, Astro, Nuxt & Shopify.`,
    margin,
    290
  );

  doc.save(`seo-report-${report.cleanDomain}.pdf`);
}

/**
 * Export Markdown Report
 */
export function exportReportToMarkdown(report: SeoAuditReport) {
  const md = `# SEO & Keyword Strategy Report: ${report.siteName} (${report.cleanDomain})
**Generated Date:** ${new Date(report.analyzedAt).toLocaleString()}  
**Industry / Niche:** ${report.niche}  
**SEO Health Score:** ${report.seoHealthScore}/100  

---

## 1. Executive Summary
${report.summary}

**Competitive Differentiator:** ${report.competitiveAngle}

---

## 2. Priority Recommendations
${report.topRecommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

---

## 3. Page-by-Page SEO Architecture
${(report.pages || [])
  .map(
    (p) => `### ${p.path} [${p.pageType}]
- **Meta Title:** \`${p.title}\`
- **Meta Description:** \`${p.metaDescription}\`
- **Primary Keyword:** \`${p.primaryKeyword}\`
- **H1 Headline:** \`${p.h1}\`
- **Schema Type:** \`${p.schemaType}\`
- **Priority:** \`${p.priorityScore}/100\`
`
  )
  .join("\n")}

---

## 4. Recommended Meta Tags Variations
${report.metaTags
  .map(
    (m) => `### ${m.type} (${m.label})
- **Meta Title (${m.metaTitleLength} chars):** \`${m.metaTitle}\`
- **Meta Description (${m.metaDescriptionLength} chars):** \`${m.metaDescription}\`
- **OpenGraph Title:** \`${m.ogTitle}\`
- **Canonical URL:** \`${m.canonicalUrl}\`
- **Focus Keyword:** \`${m.focusKeyword}\`
`
  )
  .join("\n")}

---

## 5. Keyword Research Matrix
| Keyword | Category | Intent | Est. Volume | KD | Level | CPC | Priority | Content Target |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${report.keywords
  .map(
    (k) =>
      `| **${k.keyword}** | ${k.category} | ${k.searchIntent} | ${k.searchVolume} | ${k.difficulty} | ${k.difficultyLabel} | ${k.cpc} | ${k.priority} | \`${k.targetUrlSlug}\` |`
  )
  .join("\n")}

---

## 6. Feature Image (OpenGraph 1200x630) Specs
- **Headline:** ${report.featureImage.headline}
- **Subheadline:** ${report.featureImage.subheadline}
- **Badge:** ${report.featureImage.badge}
- **Alt Text:** ${report.featureImage.altText}
- **AI Image Prompt:** \`${report.featureImage.aiPrompt}\`

---

## 7. Implementation Code Snippets
### Next.js App Router (app/layout.tsx)
\`\`\`typescript
${report.codeSnippets.nextjsAppRouter}
\`\`\`

### WordPress (functions.php)
\`\`\`php
${report.codeSnippets.wordpress}
\`\`\`

### Vite / React (index.html)
\`\`\`html
${report.codeSnippets.viteReact}
\`\`\`

### Schema.org JSON-LD
\`\`\`html
${report.codeSnippets.jsonLdSchema}
\`\`\`
`;

  triggerDownload(md, `seo-report-${report.cleanDomain}.md`, "text/markdown;charset=utf-8;");
}

/**
 * Export JSON Report
 */
export function exportReportToJSON(report: SeoAuditReport) {
  const jsonStr = JSON.stringify(report, null, 2);
  triggerDownload(jsonStr, `seo-report-${report.cleanDomain}.json`, "application/json;charset=utf-8;");
}
