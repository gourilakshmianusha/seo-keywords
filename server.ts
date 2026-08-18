import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import {
  generateSmartReport,
  cleanDomainString,
  deriveSiteName,
} from "./src/utils/domainIntelligence";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Lazy-initialized Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Common audit handler for all API aliases (POST & GET)
async function handleSeoAudit(req: Request, res: Response) {
  res.setHeader("Content-Type", "application/json");

  try {
    const rawDomain = (req.body?.domain || req.query?.domain || "stripe.com") as string;
    const niche = (req.body?.niche || req.query?.niche || "") as string;
    const targetAudience = (req.body?.targetAudience || req.query?.targetAudience || "") as string;
    const country = (req.body?.country || req.query?.country || "US") as string;

    const cleanDomain = cleanDomainString(rawDomain);
    const siteName = deriveSiteName(cleanDomain);

    const ai = getGeminiAI();

    // If no API key configured, instantly provide domain-tailored intelligence
    if (!ai) {
      const fallback = generateSmartReport(cleanDomain, niche, targetAudience, country);
      return res.json(fallback);
    }

    const prompt = `You are a world-class Technical SEO Architect and Domain Relevance Specialist.
Perform an exhaustive, data-driven SEO & Keyword Intelligence Audit for the domain: "${cleanDomain}" (Site Name: "${siteName}").
Additional User Context:
- Specified Niche/Industry: ${niche || "Analyze domain name and infer primary industry"}
- Target Audience: ${targetAudience || "Target customer personas"}
- Target Geographic Market: ${country || "Global / US"}

CRITICAL RELEVANCE DIRECTIVE:
1. ONLY generate pages, keywords, schemas, and content that are STRICTLY RELEVANT to what "${cleanDomain}" actually is or does in its respective business vertical.
2. UNRELATED PAGES MUST NOT BE INCLUDED. (e.g., Astrology sites must have /daily-horoscope, /birth-chart-calculator, not SaaS dev docs; E-commerce shops must have /collections, /reviews, /shipping-returns, not healthcare pages; SaaS tools must have /pricing, /features, /integrations, /docs).
3. Meta descriptions MUST be written in simple, plain, easy-to-understand everyday language (140-155 chars) with a clear 3-part structure (plain statement, visitor benefit, actionable invite).

Analyze the domain and produce a comprehensive JSON output matching the schema:
{
  "domain": "https://${cleanDomain}",
  "cleanDomain": "${cleanDomain}",
  "siteName": "${siteName}",
  "analyzedAt": "${new Date().toISOString()}",
  "niche": "string (matching real domain vertical)",
  "targetAudience": "string",
  "seoHealthScore": number (70-99),
  "summary": "2-3 sentence overview of this domain's organic positioning & growth trajectory",
  "competitiveAngle": "strategic differentiator for this website",
  "headingStructure": {
    "h1": "Optimized H1 Headline strictly relevant to the domain",
    "h2s": ["H2 section 1", "H2 section 2", "H2 section 3", "H2 section 4"],
    "h3s": ["H3 sub 1", "H3 sub 2", "H3 sub 3"]
  },
  "topRecommendations": [
    "Actionable technical SEO recommendation 1",
    "Actionable on-page SEO recommendation 2",
    "Actionable content gap recommendation 3",
    "Actionable social meta / CTR recommendation 4"
  ],
  "pages": [
    {
      "id": "p-1",
      "path": "string (e.g. / or /daily-horoscope or /pricing or /collections)",
      "pageType": "Homepage" | "Pricing" | "Features/Services" | "Solutions" | "Blog/Content" | "Docs/Resources" | "About/Company" | "Contact/Lead",
      "title": "string (50-60 chars meta title tailored to this specific page)",
      "metaDescription": "string (145-160 chars meta description)",
      "primaryKeyword": "string (core target keyword for this URL)",
      "secondaryKeywords": ["kw1", "kw2", "kw3"],
      "keywordOptions": [
        {
          "keyword": "string",
          "searchVolume": "string (e.g. 24.5K/mo)",
          "difficulty": number (1-100),
          "difficultyLabel": "Easy" | "Medium" | "Hard",
          "intent": "Transactional" | "Commercial" | "Informational" | "Navigational",
          "cpc": "string (e.g. $3.20)",
          "isPrimary": boolean
        }
      ],
      "h1": "string (optimized H1 headline for this page)",
      "h2s": ["H2 1", "H2 2", "H2 3"],
      "searchIntent": "Transactional" | "Commercial" | "Informational" | "Navigational",
      "schemaType": "string",
      "canonicalUrl": "https://${cleanDomain}/path",
      "priorityScore": number (70-100),
      "implementationSnippet": "export const metadata = { title: '...', description: '...' };"
    }
  ],
  "keywords": [
    {
      "id": "kw-1",
      "keyword": "string",
      "category": "primary" | "secondary" | "longtail" | "question" | "lsi",
      "searchIntent": "Transactional" | "Commercial" | "Informational" | "Navigational",
      "searchVolume": "string (e.g. 18.2K/mo)",
      "difficulty": number (0-100),
      "difficultyLabel": "Easy" | "Medium" | "Hard" | "Very Hard",
      "cpc": "string (e.g. $3.40)",
      "priority": "High" | "Medium" | "Low",
      "relevanceScore": number (1-100),
      "contentOpportunity": "specific page or content asset recommendation",
      "targetUrlSlug": "e.g. /features"
    }
  ],
  "metaTags": [
    {
      "id": "meta-1",
      "label": "Benefit-Driven (Highest CTR)",
      "type": "Benefit-Driven",
      "metaTitle": "string (max 60 chars)",
      "metaTitleLength": number,
      "metaDescription": "string (145-160 chars, compelling with call to action)",
      "metaDescriptionLength": number,
      "ogTitle": "string",
      "ogDescription": "string",
      "canonicalUrl": "https://${cleanDomain}/",
      "focusKeyword": "string"
    }
  ],
  "featureImage": {
    "headline": "Punchy OpenGraph Banner Headline (3-6 words)",
    "subheadline": "Clear value proposition (6-10 words)",
    "badge": "e.g. ★ #1 RATED PLATFORM 2026",
    "dimensions": "1200 x 630 px",
    "aspectRatio": "1.91:1",
    "altText": "Descriptive accessibility and image SEO alt text containing focus keyword",
    "aiPrompt": "Detailed visual generative prompt for Midjourney/Gemini/DALL-E to generate a social banner graphic",
    "colorPalette": {
      "primary": "#3B82F6",
      "secondary": "#10B981",
      "background": "#0F172A",
      "text": "#FFFFFF",
      "accent": "#60A5FA"
    },
    "designTips": [
      "Keep text within safe zones",
      "Use high contrast background gradient",
      "Optimize image file size under 300KB WebP"
    ]
  },
  "codeSnippets": {
    "nextjsAppRouter": "Complete ready-to-paste Next.js 14/15 App Router TypeScript metadata snippet (app/layout.tsx)",
    "nextjsPagesRouter": "Complete Next.js Pages Router Head component (pages/index.tsx)",
    "wordpress": "Complete WordPress functions.php wp_head hook PHP snippet with clean escape functions",
    "viteReact": "Complete Vite index.html head tags and react-helmet-async component",
    "astro": "Complete Astro layout component with SEO props",
    "nuxt": "Complete Nuxt 3 useSeoMeta and useHead script",
    "shopify": "Complete Shopify Liquid theme snippet for snippets/seo-meta-tags.liquid",
    "html5": "Complete standard HTML5 head markup",
    "jsonLdSchema": "Complete Schema.org JSON-LD script (Organization, WebSite with SearchAction, and FAQPage / Service schema)"
  },
  "competitors": [
    {
      "competitorDomain": "competitor domain string",
      "strength": "key strength",
      "gapOpportunity": "actionable organic gap where ${cleanDomain} can win rankings",
      "sharedKeywords": ["keyword1", "keyword2"]
    }
  ]
}

Return ONLY valid, raw JSON. Do not include markdown code block formatting like \`\`\`json.`;

    let parsedData: any = null;
    const modelsToTry = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const responseText = response.text || "";
        if (responseText) {
          const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
          parsedData = JSON.parse(cleanJson);
          if (parsedData && parsedData.domain && parsedData.pages && Array.isArray(parsedData.pages)) {
            break;
          }
        }
      } catch (err: any) {
        continue;
      }
    }

    if (!parsedData || !parsedData.domain || !parsedData.pages) {
      parsedData = generateSmartReport(cleanDomain, niche, targetAudience, country);
    }

    return res.json(parsedData);
  } catch (err: any) {
    const raw = (req.body?.domain || req.query?.domain || "example.com") as string;
    const fallback = generateSmartReport(raw, req.body?.niche || (req.query?.niche as string));
    return res.json(fallback);
  }
}

// Register all API routes and aliases for maximum compatibility
app.post("/api/seo-analyze", handleSeoAudit);
app.get("/api/seo-analyze", handleSeoAudit);

app.post("/api/analyze", handleSeoAudit);
app.get("/api/analyze", handleSeoAudit);

app.post("/api/analyze-domain", handleSeoAudit);
app.get("/api/analyze-domain", handleSeoAudit);

app.post("/api/audit", handleSeoAudit);
app.get("/api/audit", handleSeoAudit);

// Start dev or production server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SEO Intelligence Suite Server running on http://localhost:${PORT}`);
  });
}

startServer();
