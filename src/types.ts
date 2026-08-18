export interface KeywordItem {
  id: string;
  keyword: string;
  category: 'primary' | 'secondary' | 'longtail' | 'question' | 'lsi';
  searchIntent: 'Transactional' | 'Commercial' | 'Informational' | 'Navigational';
  searchVolume: string;
  difficulty: number; // 0-100
  difficultyLabel: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  cpc: string;
  priority: 'High' | 'Medium' | 'Low';
  relevanceScore: number;
  contentOpportunity: string;
  targetUrlSlug: string;
}

export interface KeywordOption {
  keyword: string;
  searchVolume?: string;
  difficulty?: number; // 0-100
  difficultyLabel?: 'Easy' | 'Medium' | 'Hard';
  intent?: 'Transactional' | 'Commercial' | 'Informational' | 'Navigational';
  cpc?: string;
  isPrimary?: boolean;
}

export interface MetaTagPreset {
  id: string;
  label: string;
  type: 'Brand-First' | 'Benefit-Driven' | 'Action-Oriented' | 'SEO-Optimized' | 'Local/Targeted';
  metaTitle: string;
  metaTitleLength: number;
  metaDescription: string;
  metaDescriptionLength: number;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
  focusKeyword: string;
  focusKeywordOptions?: string[];
}

export interface FeatureImageSpec {
  headline: string;
  subheadline: string;
  badge: string;
  dimensions: string; // "1200 x 630 px"
  aspectRatio: string; // "1.91:1"
  altText: string;
  aiPrompt: string; // Midjourney / DALL-E / Gemini prompt
  colorPalette: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  designTips: string[];
}

export interface PageSeoItem {
  id: string;
  path: string; // e.g. "/", "/horoscopes", "/pricing", "/doctors", etc.
  pageType: string; // Dynamic domain-specific category e.g. "Homepage", "Daily Horoscopes", "Birth Chart", "Clinical Services", "Pricing", etc.
  title: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  keywordOptions?: KeywordOption[];
  h1: string;
  h2s: string[];
  searchIntent: 'Transactional' | 'Commercial' | 'Informational' | 'Navigational';
  schemaType: string;
  implementationSnippet: string;
  canonicalUrl: string;
  priorityScore: number; // 0-100
}

export interface TechCodeSnippets {
  nextjsAppRouter: string;
  nextjsPagesRouter: string;
  wordpress: string;
  viteReact: string;
  astro: string;
  nuxt: string;
  shopify: string;
  html5: string;
  jsonLdSchema: string;
}

export interface CompetitorInsight {
  competitorDomain: string;
  strength: string;
  gapOpportunity: string;
  sharedKeywords: string[];
}

export interface SeoAuditReport {
  domain: string;
  cleanDomain: string;
  siteName: string;
  analyzedAt: string;
  niche: string;
  targetAudience: string;
  seoHealthScore: number;
  summary: string;
  competitiveAngle: string;
  industry?: string;
  headingStructure: {
    h1: string;
    h2s: string[];
    h3s: string[];
  };
  topRecommendations: string[];
  keywords: KeywordItem[];
  metaTags: MetaTagPreset[];
  pages: PageSeoItem[];
  featureImage: FeatureImageSpec;
  codeSnippets: TechCodeSnippets;
  competitors: CompetitorInsight[];
}
