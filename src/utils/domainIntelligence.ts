import { SeoAuditReport, PageSeoItem, KeywordItem, MetaTagPreset, FeatureImageSpec, TechCodeSnippets, CompetitorInsight, KeywordOption } from "../types";

export function extractDomainAndPath(rawDomain: string): { cleanDomain: string; detectedPath: string | null } {
  let text = (rawDomain || "").trim();
  let detectedPath: string | null = null;

  if (text.startsWith("http://") || text.startsWith("https://")) {
    try {
      const url = new URL(text);
      text = url.hostname;
      if (url.pathname && url.pathname !== "/") {
        detectedPath = url.pathname;
      }
    } catch {
      text = text.replace(/^https?:\/\//i, "");
    }
  }

  if (text.includes("/")) {
    const slashIdx = text.indexOf("/");
    if (!detectedPath) {
      detectedPath = text.substring(slashIdx).split("?")[0].split("#")[0];
    }
    text = text.substring(0, slashIdx);
  }

  text = text.replace(/^www\./i, "").split("?")[0].split("#")[0].trim().toLowerCase();
  return { cleanDomain: text || "example.com", detectedPath };
}

export function cleanDomainString(rawDomain: string): string {
  return extractDomainAndPath(rawDomain).cleanDomain;
}

export function deriveSiteName(domain: string): string {
  const parts = domain.split(".");
  const name = parts[0] || "Website";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function generateKeywordOptionsForPath(
  pathStr: string,
  brandName: string,
  existingPrimary?: string,
  existingSecondary?: string[]
): KeywordOption[] {
  const clean = pathStr.replace(/[/_-]/g, " ").trim();
  const baseTerm = clean || `${brandName.toLowerCase()} official`;
  const optionsMap = new Map<string, KeywordOption>();

  const addOption = (
    kw: string,
    vol: string,
    kd: number,
    intent: KeywordOption["intent"] = "Commercial",
    cpc = "$2.40",
    serpFeature = "Top 3 Organic",
    rankingTip = "Place in H1 tag, first 100 words of body copy, and meta title to boost Google relevance score.",
    timeframe = "1-3 weeks (Quick Win)"
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
      serpFeatureTarget: serpFeature,
      googleRankingTip: rankingTip,
      rankTimeframe: timeframe,
    });
  };

  if (existingPrimary) {
    addOption(
      existingPrimary,
      "24.5K/mo",
      32,
      "Commercial",
      "$3.80",
      "Top 3 Organic Blue Link",
      "Include in page title, H1, and lead paragraph with high topical depth to secure top 3 Google ranking.",
      "3-5 weeks"
    );
  }

  addOption(
    baseTerm,
    "18.2K/mo",
    28,
    "Informational",
    "$1.95",
    "Google AI Overview & Featured Snippet",
    "Provide a direct, 45-word explanatory answer right under the H2 to win Google Position 0.",
    "2-3 weeks (Quick Win)"
  );
  addOption(
    `best ${baseTerm}`,
    "14.6K/mo",
    44,
    "Commercial",
    "$4.20",
    "Google Comparison Carousel",
    "Implement a comparative pros/cons matrix table and user review aggregate schema to capture high-intent buyers.",
    "4-8 weeks"
  );
  addOption(
    `${baseTerm} online`,
    "12.1K/mo",
    22,
    "Transactional",
    "$3.50",
    "Top 3 Organic",
    "Add clear interactive CTA button above the fold and secure HTTPS canonical tagging.",
    "1-3 weeks (Quick Win)"
  );
  addOption(
    `${brandName.toLowerCase()} ${baseTerm}`,
    "9.4K/mo",
    15,
    "Navigational",
    "$1.10",
    "SiteLinks & Brand Knowledge Graph",
    "Configure Organization JSON-LD schema with exact match Brand name to claim Google Knowledge Panel.",
    "1-2 weeks (Immediate)"
  );
  addOption(
    `free ${baseTerm} calculator`,
    "8.7K/mo",
    26,
    "Transactional",
    "$2.80",
    "Interactive Tool Rich Result",
    "Use SoftwareApplication / WebApplication schema and client-side interactive inputs for fast indexing.",
    "2-4 weeks (Quick Win)"
  );
  addOption(
    `how to use ${baseTerm}`,
    "6.2K/mo",
    18,
    "Informational",
    "$0.85",
    "People Also Ask (PAA) & FAQ Accordion",
    "Format with step-by-step numbered list (H3) and FAQPage structured data to trigger Google PAA accordion.",
    "1-3 weeks (Quick Win)"
  );
  addOption(
    `${baseTerm} reviews and guide`,
    "5.5K/mo",
    30,
    "Commercial",
    "$3.10",
    "Review Snippets (Stars in SERP)",
    "Integrate Review Schema (AggregateRating) to display yellow review stars directly in Google search results.",
    "2-4 weeks"
  );

  if (existingSecondary && Array.isArray(existingSecondary)) {
    existingSecondary.forEach((sec, idx) => {
      addOption(
        sec,
        `${(15 - idx * 2.5).toFixed(1)}K/mo`,
        20 + idx * 6,
        "Informational",
        "$2.20",
        idx % 2 === 0 ? "Google AI Overview" : "Featured Snippet #0",
        `Target semantic entity variations in H2/H3 subheadings to boost Google topical authority.`,
        `${2 + idx * 2} weeks`
      );
    });
  }

  const results = Array.from(optionsMap.values());
  if (!results.some((r) => r.isPrimary) && results.length > 0) {
    results[0].isPrimary = true;
  }
  return results;
}

export function generateSmartReport(domain: string, nicheInput?: string, targetAudienceInput?: string, countryInput?: string): SeoAuditReport {
  const { cleanDomain } = extractDomainAndPath(domain);
  const siteName = deriveSiteName(cleanDomain);
  const niche = nicheInput || "SaaS & Cloud Software";
  const targetAudience = targetAudienceInput || "Founders, developers, and product teams";
  const country = countryInput || "US / Global";

  const isAstrology = /astro|horoscope|zodiac|tarot|natal|birth.*chart|psychic|spiritual|mystic|constellation/i.test(niche + " " + cleanDomain);
  const isEcom = /shop|store|retail|cloth|shoe|fashion|commerce|goods|apparel/i.test(niche + " " + cleanDomain);
  const isHealth = /health|clinic|doctor|dental|care|patient|medical|therapy|hospital/i.test(niche + " " + cleanDomain);
  const isRealEstate = /real|estate|property|home|house|realtor|realty|mortgage/i.test(niche + " " + cleanDomain);
  const isLegal = /legal|law|attorney|lawyer|injury|counsel|defense/i.test(niche + " " + cleanDomain);
  const isFinance = /crypto|bank|invest|fintech|trading|loan|credit|wealth/i.test(niche + " " + cleanDomain);

  let detectedVertical = "SaaS & Technology";
  if (isAstrology) detectedVertical = "Astrology & Cosmic Guidance";
  else if (isEcom) detectedVertical = "E-Commerce & Online Retail";
  else if (isHealth) detectedVertical = "Healthcare & Medical Services";
  else if (isRealEstate) detectedVertical = "Real Estate & Housing";
  else if (isLegal) detectedVertical = "Legal Services & Law Practice";
  else if (isFinance) detectedVertical = "Fintech & Financial Services";

  let pagesList: PageSeoItem[] = [];

  if (isAstrology) {
    pagesList = [
      {
        id: "p-home",
        path: "/",
        pageType: "Homepage",
        title: `${siteName} — Accurate Daily Horoscopes, Zodiac & Birth Charts`,
        metaDescription: `Unlock cosmic insights with ${siteName}. Explore free daily horoscopes, accurate birth chart analysis, and zodiac compatibility reports today.`,
        primaryKeyword: `${siteName.toLowerCase()} daily horoscope`,
        secondaryKeywords: ["accurate daily horoscopes", "zodiac signs guide", "cosmic readings"],
        keywordOptions: generateKeywordOptionsForPath("/", siteName, `${siteName.toLowerCase()} daily horoscope`, ["accurate daily horoscopes", "zodiac signs guide"]),
        h1: `Accurate Daily Horoscopes & Cosmic Insights at ${siteName}`,
        h2s: [
          "Today's Horoscopes for All 12 Zodiac Signs",
          "Free Interactive Natal Birth Chart Calculator",
          "Zodiac Love & Relationship Compatibility",
          "Planetary Transits & Upcoming Lunar Cycles",
        ],
        searchIntent: "Informational",
        schemaType: "WebSite / Organization",
        canonicalUrl: `https://${cleanDomain}/`,
        priorityScore: 99,
        implementationSnippet: `export const metadata = {\n  title: "${siteName} — Accurate Daily Horoscopes, Zodiac & Birth Charts",\n  description: "Unlock cosmic insights with ${siteName}. Free daily horoscopes and birth charts.",\n  alternates: { canonical: "https://${cleanDomain}/" }\n};`,
      },
      {
        id: "p-horoscopes",
        path: "/daily-horoscope",
        pageType: "Daily Horoscopes",
        title: `Today's Free Daily Horoscopes for All 12 Signs | ${siteName}`,
        metaDescription: `Read today's accurate horoscope for Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces.`,
        primaryKeyword: "daily horoscopes for all zodiac signs",
        secondaryKeywords: ["today horoscope", "love horoscope today", "career horoscope"],
        keywordOptions: generateKeywordOptionsForPath("/daily-horoscope", siteName, "daily horoscopes for all zodiac signs", ["today horoscope", "love horoscope today"]),
        h1: "Free Daily Horoscopes for Every Zodiac Sign",
        h2s: ["Fire Signs (Aries, Leo, Sagittarius)", "Earth Signs (Taurus, Virgo, Capricorn)", "Air Signs (Gemini, Libra, Aquarius)", "Water Signs (Cancer, Scorpio, Pisces)"],
        searchIntent: "Informational",
        schemaType: "Article / FAQPage",
        canonicalUrl: `https://${cleanDomain}/daily-horoscope`,
        priorityScore: 98,
        implementationSnippet: `export const metadata = {\n  title: "Today's Free Daily Horoscopes for All 12 Signs | ${siteName}",\n  description: "Read today's accurate horoscope for all 12 zodiac signs.",\n  alternates: { canonical: "https://${cleanDomain}/daily-horoscope" }\n};`,
      },
      {
        id: "p-birth-chart",
        path: "/birth-chart-calculator",
        pageType: "Birth Chart",
        title: `Free Birth Chart Calculator (Natal Chart with Houses) | ${siteName}`,
        metaDescription: `Calculate your free astrological natal chart with rising sign (Ascendant), Moon sign, planetary aspects, and 12 houses with detailed explanations.`,
        primaryKeyword: "free birth chart calculator with houses",
        secondaryKeywords: ["natal chart reading", "rising sign calculator", "moon sign calculator"],
        keywordOptions: generateKeywordOptionsForPath("/birth-chart-calculator", siteName, "free birth chart calculator with houses", ["natal chart reading", "rising sign calculator"]),
        h1: "Interactive Natal Birth Chart & Planetary Placement Calculator",
        h2s: ["Enter Your Exact Date, Time & City of Birth", "Your Sun, Moon & Rising Sign Breakdown", "Planetary Aspects & House Positions"],
        searchIntent: "Transactional",
        schemaType: "SoftwareApplication / FAQPage",
        canonicalUrl: `https://${cleanDomain}/birth-chart-calculator`,
        priorityScore: 96,
        implementationSnippet: `export const metadata = {\n  title: "Free Birth Chart Calculator (Natal Chart with Houses) | ${siteName}",\n  description: "Calculate your free astrological natal chart with rising sign and planetary aspects.",\n  alternates: { canonical: "https://${cleanDomain}/birth-chart-calculator" }\n};`,
      },
      {
        id: "p-compatibility",
        path: "/zodiac-compatibility",
        pageType: "Zodiac Compatibility",
        title: `Zodiac Signs Love & Relationship Compatibility Test | ${siteName}`,
        metaDescription: `Discover your romantic chemistry and astrological connection. Compare two zodiac signs to explore love strengths, communication, and intimacy.`,
        primaryKeyword: "zodiac love compatibility test",
        secondaryKeywords: ["horoscope match", "star sign compatibility", "best zodiac couples"],
        keywordOptions: generateKeywordOptionsForPath("/zodiac-compatibility", siteName, "zodiac love compatibility test", ["horoscope match", "star sign compatibility"]),
        h1: "Zodiac Signs Love & Emotional Compatibility Checker",
        h2s: ["Select Partner 1 and Partner 2 Sun Signs", "Element Compatibility (Fire, Earth, Air, Water)", "Communication & Emotional Bond Scores"],
        searchIntent: "Commercial",
        schemaType: "ItemPage / FAQPage",
        canonicalUrl: `https://${cleanDomain}/zodiac-compatibility`,
        priorityScore: 92,
        implementationSnippet: `export const metadata = {\n  title: "Zodiac Signs Love & Relationship Compatibility Test | ${siteName}",\n  description: "Compare two zodiac signs to explore love strengths and compatibility.",\n  alternates: { canonical: "https://${cleanDomain}/zodiac-compatibility" }\n};`,
      },
      {
        id: "p-tarot",
        path: "/daily-tarot",
        pageType: "Tarot Card Readings",
        title: `Free 3-Card Daily Tarot Reading (Past, Present, Future) | ${siteName}`,
        metaDescription: `Draw your free 3-card daily tarot spread. Gain clarity on love, career choices, and upcoming spiritual milestones with insightful card meanings.`,
        primaryKeyword: "free 3 card daily tarot reading",
        secondaryKeywords: ["interactive tarot card draw", "major arcana meanings", "spiritual tarot insight"],
        keywordOptions: generateKeywordOptionsForPath("/daily-tarot", siteName, "free 3 card daily tarot reading", ["interactive tarot card draw", "major arcana meanings"]),
        h1: "Interactive 3-Card Tarot Reading for Daily Guidance",
        h2s: ["Card 1: Recent Past Energies", "Card 2: Current Situation & Challenges", "Card 3: Upcoming Outlook & Advice"],
        searchIntent: "Informational",
        schemaType: "Article / FAQPage",
        canonicalUrl: `https://${cleanDomain}/daily-tarot`,
        priorityScore: 89,
        implementationSnippet: `export const metadata = {\n  title: "Free 3-Card Daily Tarot Reading | ${siteName}",\n  description: "Draw your free 3-card daily tarot spread for love and career clarity.",\n  alternates: { canonical: "https://${cleanDomain}/daily-tarot" }\n};`,
      },
      {
        id: "p-astrologers",
        path: "/astrologers",
        pageType: "Live Astrologers & Consultations",
        title: `Verified Vedic & Western Astrologers for Live Consultations | ${siteName}`,
        metaDescription: `Connect with certified professional astrologers and tarot readers for 1-on-1 personalized chart analysis, transits, and life guidance.`,
        primaryKeyword: "live astrologer consultation online",
        secondaryKeywords: ["book astrology reading", "verified horoscope readers", "expert birth chart analyst"],
        keywordOptions: generateKeywordOptionsForPath("/astrologers", siteName, "live astrologer consultation online", ["book astrology reading", "expert birth chart analyst"]),
        h1: "Book a 1-on-1 Consultation with Certified Astrologers",
        h2s: ["Top Rated Readers This Week", "Specialties: Vedic, Hellenistic, Tarot, Numerology", "Client Reviews and Verified Ratings"],
        searchIntent: "Transactional",
        schemaType: "LocalBusiness / ProfessionalService",
        canonicalUrl: `https://${cleanDomain}/astrologers`,
        priorityScore: 86,
        implementationSnippet: `export const metadata = {\n  title: "Verified Astrologers for Live Consultations | ${siteName}",\n  description: "Connect with certified professional astrologers for personalized readings.",\n  alternates: { canonical: "https://${cleanDomain}/astrologers" }\n};`,
      },
    ];
  } else {
    // SaaS & Standard Business
    pagesList = [
      {
        id: "p-home",
        path: "/",
        pageType: "Homepage",
        title: `${siteName} — The All-in-One Solution for ${niche.split(",")[0]}`,
        metaDescription: `Discover how ${siteName} helps you streamline workflows, boost efficiency, and scale seamlessly. Get started free in 2 minutes today.`,
        primaryKeyword: `${siteName.toLowerCase()} platform`,
        secondaryKeywords: [`best ${siteName.toLowerCase()} alternative`, `top rated ${niche.split(" ")[0].toLowerCase()} software`],
        keywordOptions: generateKeywordOptionsForPath("/", siteName, `${siteName.toLowerCase()} platform`, [`best ${siteName.toLowerCase()} alternative`, `top rated ${niche.split(" ")[0].toLowerCase()} software`]),
        h1: `${siteName} — The Modern Operating System for ${niche.split(",")[0]}`,
        h2s: [
          `Why Leading Teams Choose ${siteName}`,
          "Core Features Built for Speed and Scalability",
          "Transparent Pricing and Comparison Matrix",
          "Frequently Asked Questions",
        ],
        searchIntent: "Commercial",
        schemaType: "SoftwareApplication / Organization",
        canonicalUrl: `https://${cleanDomain}/`,
        priorityScore: 98,
        implementationSnippet: `export const metadata = {\n  title: "${siteName} — The All-in-One Solution for ${niche.split(",")[0]}",\n  description: "Discover how ${siteName} helps you streamline workflows and scale.",\n  alternates: { canonical: "https://${cleanDomain}/" }\n};`,
      },
      {
        id: "p-pricing",
        path: "/pricing",
        pageType: "Pricing",
        title: `Transparent Pricing Plans & Cost Calculator | ${siteName}`,
        metaDescription: `Explore flexible pricing plans for ${siteName}. Compare Free, Pro, and Enterprise tiers with no hidden fees or contracts. Start free!`,
        primaryKeyword: `${siteName.toLowerCase()} pricing`,
        secondaryKeywords: ["cost plans", "free tier", "enterprise pricing calculator"],
        keywordOptions: generateKeywordOptionsForPath("/pricing", siteName, `${siteName.toLowerCase()} pricing`, ["cost plans", "free tier", "enterprise pricing calculator"]),
        h1: "Simple, Predictable Pricing for Teams of All Sizes",
        h2s: ["Plan Comparison Table", "Enterprise Custom Quotes", "Frequently Asked Billing Questions"],
        searchIntent: "Transactional",
        schemaType: "PriceSpecification / FAQPage",
        canonicalUrl: `https://${cleanDomain}/pricing`,
        priorityScore: 96,
        implementationSnippet: `export const metadata = {\n  title: "Transparent Pricing Plans | ${siteName}",\n  description: "Explore flexible pricing plans for ${siteName}. Compare Free, Pro, and Enterprise.",\n  alternates: { canonical: "https://${cleanDomain}/pricing" }\n};`,
      },
      {
        id: "p-features",
        path: "/features",
        pageType: "Features/Services",
        title: `Core Features & Powerful Capabilities | ${siteName}`,
        metaDescription: `Discover all built-in features that make ${siteName} the top choice for modern teams. Real-time sync, automated workflows, and robust security.`,
        primaryKeyword: `${siteName.toLowerCase()} features`,
        secondaryKeywords: ["workflow automation", "real-time analytics", "cloud integrations"],
        keywordOptions: generateKeywordOptionsForPath("/features", siteName, `${siteName.toLowerCase()} features`, ["workflow automation", "real-time analytics"]),
        h1: "Powerful Features Designed to Supercharge Your Productivity",
        h2s: ["Automated Workflows & Triggers", "Deep Analytics & Real-Time Reporting", "Enterprise-Grade Security & SOC2 Compliance"],
        searchIntent: "Commercial",
        schemaType: "Service / Product",
        canonicalUrl: `https://${cleanDomain}/features`,
        priorityScore: 94,
        implementationSnippet: `export const metadata = {\n  title: "Core Features & Capabilities | ${siteName}",\n  description: "Discover all built-in features that make ${siteName} the top choice for modern teams.",\n  alternates: { canonical: "https://${cleanDomain}/features" }\n};`,
      },
      {
        id: "p-integrations",
        path: "/integrations",
        pageType: "Solutions",
        title: `100+ App Integrations & Developer Webhooks | ${siteName}`,
        metaDescription: `Seamlessly connect ${siteName} with Slack, GitHub, Zapier, Stripe, Salesforce, and more. Set up custom webhooks and REST APIs in minutes.`,
        primaryKeyword: `${siteName.toLowerCase()} integrations`,
        secondaryKeywords: ["connect apps", "zapier integration", "rest api webhooks"],
        keywordOptions: generateKeywordOptionsForPath("/integrations", siteName, `${siteName.toLowerCase()} integrations`, ["connect apps", "zapier integration"]),
        h1: "Integrate Seamlessly with Your Entire Tech Stack",
        h2s: ["Popular Developer & Productivity Apps", "Custom Webhooks & REST API Documentation", "One-Click Native Setup"],
        searchIntent: "Commercial",
        schemaType: "CollectionPage",
        canonicalUrl: `https://${cleanDomain}/integrations`,
        priorityScore: 90,
        implementationSnippet: `export const metadata = {\n  title: "100+ App Integrations | ${siteName}",\n  description: "Seamlessly connect ${siteName} with your favorite developer and productivity tools.",\n  alternates: { canonical: "https://${cleanDomain}/integrations" }\n};`,
      },
      {
        id: "p-docs",
        path: "/docs",
        pageType: "Docs/Resources",
        title: `Documentation, API Reference & Quickstart Guides | ${siteName}`,
        metaDescription: `Get up and running with step-by-step guides, code examples, SDKs, and full API documentation for ${siteName}. Start building in minutes.`,
        primaryKeyword: `${siteName.toLowerCase()} documentation`,
        secondaryKeywords: ["api reference", "developer quickstart", "sdk installation"],
        keywordOptions: generateKeywordOptionsForPath("/docs", siteName, `${siteName.toLowerCase()} documentation`, ["api reference", "developer quickstart"]),
        h1: "Developer Documentation & Setup Guides",
        h2s: ["5-Minute Quickstart Guide", "Authentication & API Keys", "SDKs for TypeScript, Python & Go"],
        searchIntent: "Informational",
        schemaType: "TechArticle",
        canonicalUrl: `https://${cleanDomain}/docs`,
        priorityScore: 88,
        implementationSnippet: `export const metadata = {\n  title: "Documentation & API Reference | ${siteName}",\n  description: "Get up and running with step-by-step developer guides and full API reference.",\n  alternates: { canonical: "https://${cleanDomain}/docs" }\n};`,
      },
      {
        id: "p-blog",
        path: "/blog",
        pageType: "Blog/Content",
        title: `Blog: Insights, Tutorials & Best Practices | ${siteName}`,
        metaDescription: `Read actionable guides, industry trends, and deep-dive technical tutorials written by experts at ${siteName}. Level up your skills today.`,
        primaryKeyword: `${siteName.toLowerCase()} blog`,
        secondaryKeywords: ["tutorials and guides", "industry best practices", "tech insights"],
        keywordOptions: generateKeywordOptionsForPath("/blog", siteName, `${siteName.toLowerCase()} blog`, ["tutorials and guides", "industry best practices"]),
        h1: "Engineering & Growth Insights from the ${siteName} Team",
        h2s: ["Featured Articles", "Recent Tutorials & Code Snippets", "Product Changelog & Release Notes"],
        searchIntent: "Informational",
        schemaType: "Blog",
        canonicalUrl: `https://${cleanDomain}/blog`,
        priorityScore: 85,
        implementationSnippet: `export const metadata = {\n  title: "Blog: Insights & Tutorials | ${siteName}",\n  description: "Read actionable guides, industry trends, and technical tutorials.",\n  alternates: { canonical: "https://${cleanDomain}/blog" }\n};`,
      },
    ];
  }

  const keywordsList: KeywordItem[] = [
    {
      id: "kw-1",
      keyword: pagesList[0]?.primaryKeyword || `${siteName.toLowerCase()} platform`,
      category: "primary",
      searchIntent: "Commercial",
      searchVolume: "24.5K/mo",
      difficulty: 32,
      difficultyLabel: "Easy",
      cpc: "$3.80",
      priority: "High",
      relevanceScore: 99,
      contentOpportunity: "Homepage Hero Section & Primary Value Proposition",
      targetUrlSlug: "/",
      serpFeatureTarget: "Top 3 Organic Blue Link",
      googleRankingTip: "Place exact target phrase in Title Tag, H1, and first 100 words of lead paragraph. Include clear internal links with anchor text.",
      rankPotential: "Quick Win (1-2 wks)",
    },
    {
      id: "kw-2",
      keyword: `best ${siteName.toLowerCase()} alternative`,
      category: "secondary",
      searchIntent: "Commercial",
      searchVolume: "14.2K/mo",
      difficulty: 45,
      difficultyLabel: "Medium",
      cpc: "$4.10",
      priority: "High",
      relevanceScore: 94,
      contentOpportunity: "Comparison Table & Competitive Advantage Matrix",
      targetUrlSlug: "/pricing",
      serpFeatureTarget: "Google Comparison Carousel & Top 3",
      googleRankingTip: "Build an honest side-by-side comparison table with clear feature ticks, price differences, and migration guides to rank for buyer-intent searchers.",
      rankPotential: "High Growth (3-6 wks)",
    },
    {
      id: "kw-3",
      keyword: `${siteName.toLowerCase()} pricing and plans`,
      category: "longtail",
      searchIntent: "Transactional",
      searchVolume: "9.8K/mo",
      difficulty: 22,
      difficultyLabel: "Easy",
      cpc: "$5.20",
      priority: "High",
      relevanceScore: 96,
      contentOpportunity: "Interactive ROI / Cost Calculator Page",
      targetUrlSlug: "/pricing",
      serpFeatureTarget: "Price Rich Snippets & FAQ Accordion",
      googleRankingTip: "Implement PriceSpecification Schema (JSON-LD) with currency and tier pricing to get direct pricing displays in Google SERPs.",
      rankPotential: "Quick Win (1-2 wks)",
    },
    {
      id: "kw-4",
      keyword: `how to use ${siteName.toLowerCase()}`,
      category: "question",
      searchIntent: "Informational",
      searchVolume: "8.4K/mo",
      difficulty: 18,
      difficultyLabel: "Easy",
      cpc: "$1.40",
      priority: "Medium",
      relevanceScore: 91,
      contentOpportunity: "Step-by-Step Onboarding Video & Tutorial Documentation",
      targetUrlSlug: "/docs",
      serpFeatureTarget: "Featured Snippet #0 & People Also Ask (PAA)",
      googleRankingTip: "Use an ordered <ol> list under an H2 question header with 4-6 concise steps (40-50 words total) to claim Google's coveted Position 0 snippet.",
      rankPotential: "Quick Win (1-2 wks)",
    },
    {
      id: "kw-5",
      keyword: `${siteName.toLowerCase()} reviews and ratings`,
      category: "lsi",
      searchIntent: "Commercial",
      searchVolume: "6.7K/mo",
      difficulty: 28,
      difficultyLabel: "Easy",
      cpc: "$2.90",
      priority: "Medium",
      relevanceScore: 89,
      contentOpportunity: "Customer Case Studies & Verified Testimonials Section",
      targetUrlSlug: "/",
      serpFeatureTarget: "Review Snippets (Gold Stars in SERP)",
      googleRankingTip: "Add Schema.org AggregateRating markup with genuine reviewer quotes to generate high-CTR gold star ratings in Google search listings.",
      rankPotential: "Quick Win (1-2 wks)",
    },
    {
      id: "kw-6",
      keyword: `free ${siteName.toLowerCase()} online tool`,
      category: "longtail",
      searchIntent: "Transactional",
      searchVolume: "11.3K/mo",
      difficulty: 26,
      difficultyLabel: "Easy",
      cpc: "$2.60",
      priority: "High",
      relevanceScore: 93,
      contentOpportunity: "Free Interactive Tool or Sample Audit Widget",
      targetUrlSlug: pagesList[1]?.path || "/features",
      serpFeatureTarget: "Google AI Overview & Interactive Web Tool",
      googleRankingTip: "Provide instant value without registration barriers to achieve high time-on-page and low bounce rates, signaling top quality to Google RankBrain.",
      rankPotential: "Quick Win (1-2 wks)",
    },
  ];

  const metaTagsList: MetaTagPreset[] = [
    {
      id: "meta-1",
      label: "Benefit-Driven (Highest CTR)",
      type: "Benefit-Driven",
      metaTitle: `${pagesList[0]?.title.slice(0, 58) || `${siteName} — Official Platform`}`,
      metaTitleLength: (pagesList[0]?.title || "").length,
      metaDescription: pagesList[0]?.metaDescription || `Discover official solutions and features on ${siteName}. Simple, fast, and secure. Explore guides today.`,
      metaDescriptionLength: (pagesList[0]?.metaDescription || "").length,
      ogTitle: `${siteName} — High Performance Solutions`,
      ogDescription: `Learn how ${siteName} helps you achieve top results with ease and precision.`,
      canonicalUrl: `https://${cleanDomain}/`,
      focusKeyword: pagesList[0]?.primaryKeyword || `${siteName.toLowerCase()}`,
      focusKeywordOptions: [
        pagesList[0]?.primaryKeyword || `${siteName.toLowerCase()}`,
        `best ${siteName.toLowerCase()} platform`,
        `${siteName.toLowerCase()} online services`,
      ],
    },
    {
      id: "meta-2",
      label: "Action-Oriented (Conversion Focus)",
      type: "Action-Oriented",
      metaTitle: `Start with ${siteName} Today — Fast & Easy Setup`,
      metaTitleLength: 46,
      metaDescription: `Get started with ${siteName} in 2 minutes. Transparent options, powerful features, and 24/7 dedicated support. Try it free today!`,
      metaDescriptionLength: 133,
      ogTitle: `Experience the Difference with ${siteName}`,
      ogDescription: `Join thousands of satisfied users scaling effortlessly with ${siteName}.`,
      canonicalUrl: `https://${cleanDomain}/`,
      focusKeyword: `try ${siteName.toLowerCase()} free`,
      focusKeywordOptions: [`try ${siteName.toLowerCase()} free`, `${siteName.toLowerCase()} free signup`],
    },
    {
      id: "meta-3",
      label: "Brand-First (Authoritative)",
      type: "Brand-First",
      metaTitle: `${siteName} | Official Website & Complete Guide`,
      metaTitleLength: 44,
      metaDescription: `The official homepage of ${siteName}. Discover verified resources, expert insights, and our comprehensive suite of offerings.`,
      metaDescriptionLength: 128,
      ogTitle: `${siteName} Official Portal`,
      ogDescription: `Verified features, updates, and comprehensive resources from ${siteName}.`,
      canonicalUrl: `https://${cleanDomain}/`,
      focusKeyword: `${siteName.toLowerCase()} official`,
      focusKeywordOptions: [`${siteName.toLowerCase()} official`, `${siteName.toLowerCase()} brand`],
    },
  ];

  const featureImage: FeatureImageSpec = {
    headline: `Unlock the Power of ${siteName}`,
    subheadline: `The Modern High-Performance Platform for ${detectedVertical}`,
    badge: "★ TOP RATED 2026",
    dimensions: "1200 x 630 px",
    aspectRatio: "1.91:1",
    altText: `${siteName} open graph featured banner graphic showcasing modern features for ${detectedVertical}`,
    aiPrompt: `A sleek, modern 3D banner graphic for ${siteName}, an online authority in ${detectedVertical}. Dark modern background with sapphire blue and emerald neon accents, clean geometric UI cards floating in dynamic 3D space, high resolution, 8k, professional graphic design.`,
    colorPalette: {
      primary: "#3B82F6",
      secondary: "#10B981",
      background: "#0F172A",
      text: "#FFFFFF",
      accent: "#60A5FA",
    },
    designTips: [
      "Keep text within the 1200x630 safe zone (100px padding)",
      "Use high contrast background gradient for readability on social feeds",
      "Compress to WebP format under 250KB for rapid page speeds",
    ],
  };

  const codeSnippets: TechCodeSnippets = {
    nextjsAppRouter: `// app/layout.tsx (Next.js 14/15 App Router)
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://${cleanDomain}"),
  title: {
    default: "${pagesList[0]?.title || `${siteName} — Official Platform`}",
    template: "%s | ${siteName}",
  },
  description: "${pagesList[0]?.metaDescription || `Discover official solutions on ${siteName}.`}",
  alternates: {
    canonical: "https://${cleanDomain}/",
  },
  openGraph: {
    title: "${siteName} — Official Portal",
    description: "${pagesList[0]?.metaDescription || `Discover official solutions on ${siteName}.`}",
    url: "https://${cleanDomain}/",
    siteName: "${siteName}",
    images: [
      {
        url: "https://${cleanDomain}/og-image.png",
        width: 1200,
        height: 630,
        alt: "${siteName} banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "${siteName} — Official Portal",
    description: "${pagesList[0]?.metaDescription || `Discover official solutions on ${siteName}.`}",
    images: ["https://${cleanDomain}/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
    nextjsPagesRouter: `// pages/index.tsx (Next.js Pages Router)
import Head from "next/head";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>${pagesList[0]?.title || `${siteName} — Official Platform`}</title>
        <meta name="description" content="${pagesList[0]?.metaDescription || `Discover official solutions on ${siteName}.`}" />
        <link rel="canonical" href="https://${cleanDomain}/" />
        <meta property="og:title" content="${siteName} — Official Portal" />
        <meta property="og:description" content="${pagesList[0]?.metaDescription || `Discover official solutions on ${siteName}.`}" />
        <meta property="og:image" content="https://${cleanDomain}/og-image.png" />
        <meta property="og:url" content="https://${cleanDomain}/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <main>
        <h1>${pagesList[0]?.h1 || siteName}</h1>
      </main>
    </>
  );
}`,
    wordpress: `<?php
// Add to functions.php in active WordPress theme
function add_custom_seo_meta_tags() {
    if (is_front_page() || is_home()) {
        echo '<meta name="description" content="' . esc_attr("${pagesList[0]?.metaDescription || `Discover official solutions on ${siteName}.`}") . '" />' . "\\n";
        echo '<link rel="canonical" href="' . esc_url("https://${cleanDomain}/") . '" />' . "\\n";
        echo '<meta property="og:title" content="' . esc_attr("${siteName} — Official Portal") . '" />' . "\\n";
        echo '<meta property="og:description" content="' . esc_attr("${pagesList[0]?.metaDescription || `Discover official solutions on ${siteName}.`}") . '" />' . "\\n";
        echo '<meta property="og:image" content="' . esc_url("https://${cleanDomain}/og-image.png") . '" />' . "\\n";
        echo '<meta property="og:type" content="website" />' . "\\n";
    }
}
add_action('wp_head', 'add_custom_seo_meta_tags', 1);
?>`,
    viteReact: `<!-- index.html (Vite React SPA) -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pagesList[0]?.title || `${siteName} — Official Platform`}</title>
    <meta name="description" content="${pagesList[0]?.metaDescription || `Discover official solutions on ${siteName}.`}" />
    <link rel="canonical" href="https://${cleanDomain}/" />
    <meta property="og:title" content="${siteName} — Official Portal" />
    <meta property="og:description" content="${pagesList[0]?.metaDescription || `Discover official solutions on ${siteName}.`}" />
    <meta property="og:image" content="https://${cleanDomain}/og-image.png" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
    astro: `---
// src/layouts/Layout.astro (Astro SEO Layout)
interface Props {
  title?: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
}

const {
  title = "${pagesList[0]?.title || `${siteName} — Official Platform`}",
  description = "${pagesList[0]?.metaDescription || `Discover official solutions on ${siteName}.`}",
  image = "https://${cleanDomain}/og-image.png",
  canonicalUrl = "https://${cleanDomain}/",
} = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalUrl} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>
    <slot />
  </body>
</html>`,
    nuxt: `<!-- app.vue (Nuxt 3 SEO Setup) -->
<script setup lang="ts">
useSeoMeta({
  title: '${pagesList[0]?.title || `${siteName} — Official Platform`}',
  description: '${pagesList[0]?.metaDescription || `Discover official solutions on ${siteName}.`}',
  ogTitle: '${siteName} — Official Portal',
  ogDescription: '${pagesList[0]?.metaDescription || `Discover official solutions on ${siteName}.`}',
  ogImage: 'https://${cleanDomain}/og-image.png',
  ogUrl: 'https://${cleanDomain}/',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://${cleanDomain}/' }
  ]
})
</script>

<template>
  <NuxtPage />
</template>`,
    shopify: `{%- comment -%} snippets/seo-meta-tags.liquid (Shopify Liquid) {%- endcomment -%}
<title>{{ page_title }} | {{ shop.name }}</title>
<meta name="description" content="{{ page_description | default: '${pagesList[0]?.metaDescription || `Discover official solutions on ${siteName}.`}' | escape }}">
<link rel="canonical" href="{{ canonical_url }}">
<meta property="og:site_name" content="{{ shop.name }}">
<meta property="og:url" content="{{ canonical_url }}">
<meta property="og:title" content="{{ page_title | default: shop.name | escape }}">
<meta property="og:type" content="website">
<meta property="og:description" content="{{ page_description | default: shop.description | escape }}">
<meta name="twitter:card" content="summary_large_image">`,
    html5: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pagesList[0]?.title || `${siteName} — Official Website`}</title>
  <meta name="description" content="${pagesList[0]?.metaDescription || `Discover official solutions on ${siteName}.`}">
  <link rel="canonical" href="https://${cleanDomain}/">
  <meta property="og:title" content="${siteName} — Official Portal">
  <meta property="og:description" content="${pagesList[0]?.metaDescription || `Discover official solutions on ${siteName}.`}">
  <meta property="og:image" content="https://${cleanDomain}/og-image.png">
  <meta property="og:url" content="https://${cleanDomain}/">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
</head>
<body>
  <h1>${pagesList[0]?.h1 || siteName}</h1>
</body>
</html>`,
    jsonLdSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://${cleanDomain}/#organization",
      "name": "${siteName}",
      "url": "https://${cleanDomain}",
      "logo": {
        "@type": "ImageObject",
        "url": "https://${cleanDomain}/logo.png"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://${cleanDomain}/#website",
      "url": "https://${cleanDomain}",
      "name": "${siteName}",
      "publisher": {
        "@id": "https://${cleanDomain}/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://${cleanDomain}/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
}
</script>`,
  };

  const competitors: CompetitorInsight[] = [
    {
      competitorDomain: `competitor-${siteName.toLowerCase()}1.com`,
      strength: "Established backlink authority across broad top-of-funnel keywords",
      gapOpportunity: `Target specific feature comparison terms and interactive tools where competitor content is thin`,
      sharedKeywords: [pagesList[0]?.primaryKeyword || "platform", "online tools"],
    },
    {
      competitorDomain: `competitor-${siteName.toLowerCase()}2.io`,
      strength: "Strong brand presence and active community forum signals",
      gapOpportunity: `Build faster, more comprehensive documentation and schema-enhanced answers to win Featured Snippets`,
      sharedKeywords: [pagesList[1]?.primaryKeyword || "pricing", "best alternative"],
    },
  ];

  return {
    domain: `https://${cleanDomain}`,
    cleanDomain,
    siteName,
    analyzedAt: new Date().toISOString(),
    niche: detectedVertical,
    industry: detectedVertical,
    targetAudience,
    seoHealthScore: 92,
    summary: `${cleanDomain} possesses strong organic upside in the ${detectedVertical} vertical. Prioritizing structured schema markup, page-specific search intent alignment, and high-CTR meta titles will rapidly capture high-value search demand.`,
    competitiveAngle: `Positioning ${siteName} as the fastest, most reliable destination with zero friction and superior user clarity.`,
    headingStructure: {
      h1: pagesList[0]?.h1 || `${siteName} — Official Platform`,
      h2s: pagesList[0]?.h2s || ["Core Highlights", "Features Overview", "Frequently Asked Questions"],
      h3s: ["Fast Integration", "Security First", "24/7 Support"],
    },
    topRecommendations: [
      "Implement JSON-LD Organization and WebSite structured data across all top-level entry routes.",
      "Ensure distinct, non-duplicated meta title and description tags for each individual URL slug.",
      "Optimize OpenGraph 1200x630 social sharing card image to boost social CTR and backlink attraction.",
      "Target transactional keywords with dedicated comparison and feature-specific landing pages.",
    ],
    pages: pagesList,
    keywords: keywordsList,
    metaTags: metaTagsList,
    featureImage,
    codeSnippets,
    competitors,
  };
}
