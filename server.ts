import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

function cleanDomainString(rawDomain: string): string {
  return extractDomainAndPath(rawDomain).cleanDomain;
}

function extractDomainAndPath(rawDomain: string): { cleanDomain: string; detectedPath: string | null } {
  let text = rawDomain.trim();
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

function deriveSiteName(domain: string): string {
  const parts = domain.split(".");
  const name = parts[0] || "Website";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Fallback generator for reliability and offline testability
function generateSmartFallbackReport(domain: string, nicheInput?: string): any {
  const { cleanDomain, detectedPath } = extractDomainAndPath(domain);
  const siteName = deriveSiteName(cleanDomain);
  const niche = nicheInput || "SaaS & Cloud Software";
  const isEcom = /shop|store|retail|cloth|shoe|fashion|commerce/i.test(niche + " " + cleanDomain);
  const isHealth = /health|clinic|doctor|dental|care|patient|medical/i.test(niche + " " + cleanDomain);
  const isRealEstate = /real|estate|property|home|house|realtor/i.test(niche + " " + cleanDomain);
  const isLegal = /legal|law|attorney|lawyer|injury|counsel/i.test(niche + " " + cleanDomain);
  const isLocal = /plumb|roof|hvac|clean|repair|electric|local/i.test(niche + " " + cleanDomain);
  const isAstrology = /astro|horoscope|zodiac|tarot|natal|birth.*chart|psychic|spiritual|mystic|constellation/i.test(niche + " " + cleanDomain);

  const primaryKw = isAstrology
    ? `${siteName.toLowerCase()} daily horoscope`
    : `${siteName.toLowerCase()} ${isEcom ? "online shop" : isHealth ? "health clinic" : isRealEstate ? "homes for sale" : isLegal ? "attorneys" : isLocal ? "services near me" : "platform"}`;
  const secKw1 = isAstrology ? "free birth chart calculator" : `best ${siteName.toLowerCase()} alternative`;
  const secKw2 = isAstrology ? "zodiac signs love compatibility" : `top rated ${niche.split(" ")[0].toLowerCase()} solutions`;
  const secKw3 = isAstrology ? "daily tarot reading online" : `${siteName.toLowerCase()} pricing and reviews`;

  // Industry-tailored pages breakdown
  let pagesList = [];

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
        h1: `Accurate Daily Horoscopes & Cosmic Insights at ${siteName}`,
        h2s: [
          "Today's Horoscopes for All 12 Zodiac Signs",
          "Free Interactive Natal Birth Chart Calculator",
          "Zodiac Love & Relationship Compatibility",
          "Planetary Transits & Upcoming Full Moon Cycles",
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
        path: "/zodiac-signs/compatibility",
        pageType: "Compatibility",
        title: `Zodiac Sign Love Compatibility & Relationship Match | ${siteName}`,
        metaDescription: `Discover your romantic chemistry with our in-depth zodiac compatibility match. Compare elements, modalities, and synastry between any two signs.`,
        primaryKeyword: "zodiac love compatibility test",
        secondaryKeywords: ["astrology love match", "relationship synastry", "zodiac sign elements"],
        h1: "Zodiac Signs Love & Relationship Compatibility Guide",
        h2s: ["Select Two Zodiac Signs to Compare", "Emotional & Sexual Chemistry Breakdown", "Communication Strengths and Potential Pitfalls"],
        searchIntent: "Commercial",
        schemaType: "Article / FAQPage",
        canonicalUrl: `https://${cleanDomain}/zodiac-signs/compatibility`,
        priorityScore: 93,
        implementationSnippet: `export const metadata = {\n  title: "Zodiac Sign Love Compatibility & Relationship Match | ${siteName}",\n  description: "Discover romantic chemistry with in-depth zodiac compatibility match.",\n  alternates: { canonical: "https://${cleanDomain}/zodiac-signs/compatibility" }\n};`,
      },
      {
        id: "p-tarot",
        path: "/tarot-readings",
        pageType: "Tarot Readings",
        title: `Free Online Tarot Card Reading (3-Card Spread) | ${siteName}`,
        metaDescription: `Pick your cards for a free 3-card Past, Present, Future tarot spread. Receive clear spiritual guidance for love, career, and personal destiny.`,
        primaryKeyword: "free daily tarot card reading",
        secondaryKeywords: ["three card tarot spread", "love tarot reading", "major arcana meanings"],
        h1: "Daily Tarot Card Readings & Card Interpretations",
        h2s: ["Draw Your 3 Daily Tarot Cards", "Major & Minor Arcana Meaning Directory", "Celtic Cross & Love Spreads"],
        searchIntent: "Transactional",
        schemaType: "Service / FAQPage",
        canonicalUrl: `https://${cleanDomain}/tarot-readings`,
        priorityScore: 90,
        implementationSnippet: `export const metadata = {\n  title: "Free Online Tarot Card Reading (3-Card Spread) | ${siteName}",\n  description: "Pick your cards for a free 3-card Past, Present, Future tarot spread.",\n  alternates: { canonical: "https://${cleanDomain}/tarot-readings" }\n};`,
      },
      {
        id: "p-consultations",
        path: "/astrologers",
        pageType: "Astrologers",
        title: `Book Certified Astrologers & Psychic Live Readings | ${siteName}`,
        metaDescription: `Connect with verified professional astrologers, Vedic readers, and psychic advisors for personalized 1-on-1 audio/video consultations.`,
        primaryKeyword: "book professional astrologer online",
        secondaryKeywords: ["live psychic consultation", "vedic astrology reading", "natal chart specialist"],
        h1: "1-on-1 Live Consultations with Verified Astrologers",
        h2s: ["Top-Rated Verified Cosmic Advisors", "Transparent Per-Minute & Flat-Rate Pricing", "Real Client Reviews and Ratings"],
        searchIntent: "Commercial",
        schemaType: "Service / ProfessionalService",
        canonicalUrl: `https://${cleanDomain}/astrologers`,
        priorityScore: 89,
        implementationSnippet: `export const metadata = {\n  title: "Book Certified Astrologers & Psychic Live Readings | ${siteName}",\n  description: "Connect with verified professional astrologers for personalized readings.",\n  alternates: { canonical: "https://${cleanDomain}/astrologers" }\n};`,
      },
      {
        id: "p-lunar",
        path: "/blog/lunar-cycles",
        pageType: "Lunar Transits",
        title: `2026 Lunar Calendar, Full Moon Rituals & Transits | ${siteName}`,
        metaDescription: `Explore the complete 2026 moon phases calendar, retrograde alerts, eclipse dates, and manifesting rituals curated by senior astrologers.`,
        primaryKeyword: "lunar calendar and full moon rituals 2026",
        secondaryKeywords: ["mercury retrograde dates", "new moon manifesting guide", "planetary transits"],
        h1: "Cosmic Transit Calendar & Moon Phase Manifesting Guides",
        h2s: ["Upcoming Full Moon & New Moon Dates", "Mercury Retrograde Survival Guide", "Manifesting & Crystal Rituals"],
        searchIntent: "Informational",
        schemaType: "BlogPosting / Event",
        canonicalUrl: `https://${cleanDomain}/blog/lunar-cycles`,
        priorityScore: 87,
        implementationSnippet: `export const metadata = {\n  title: "2026 Lunar Calendar, Full Moon Rituals & Transits | ${siteName}",\n  description: "Explore the complete 2026 moon phases calendar and retrograde alerts.",\n  alternates: { canonical: "https://${cleanDomain}/blog/lunar-cycles" }\n};`,
      },
    ];
  } else if (isHealth) {
    pagesList = [
      {
        id: "p-home",
        path: "/",
        pageType: "Homepage",
        title: `${siteName} — Compassionate Healthcare & Medical Clinic`,
        metaDescription: `Discover quality healthcare at ${siteName}. Expert physicians, telehealth appointments, preventative wellness, and modern clinic facilities.`,
        primaryKeyword: `${siteName.toLowerCase()} medical clinic`,
        secondaryKeywords: ["find a doctor", "book appointment", "telehealth care"],
        h1: `Comprehensive Healthcare & Medical Services at ${siteName}`,
        h2s: ["Our Medical Specialties & Care Areas", "Meet Our Board-Certified Doctors", "Schedule an In-Person or Telehealth Visit", "Accepted Insurance & Transparent Pricing"],
        searchIntent: "Commercial",
        schemaType: "MedicalBusiness / Physician",
        canonicalUrl: `https://${cleanDomain}/`,
        priorityScore: 99,
        implementationSnippet: `export const metadata = {\n  title: "${siteName} — Compassionate Healthcare & Medical Clinic",\n  description: "Discover quality healthcare at ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/" }\n};`,
      },
      {
        id: "p-services",
        path: "/services",
        pageType: "Clinical Services",
        title: `Medical Specialties & Clinical Services | ${siteName}`,
        metaDescription: `Explore primary care, urgent care, pediatrics, cardiology, preventative screenings, and specialized treatments at ${siteName}.`,
        primaryKeyword: "medical services and clinical specialties",
        secondaryKeywords: ["primary care doctors", "urgent care walk-in", "preventative health screening"],
        h1: "Our Complete Clinical Services & Healthcare Programs",
        h2s: ["Primary Care & Family Medicine", "Urgent Care & Diagnostics", "Chronic Condition Management", "Specialist Referrals"],
        searchIntent: "Commercial",
        schemaType: "MedicalProcedure / Service",
        canonicalUrl: `https://${cleanDomain}/services`,
        priorityScore: 96,
        implementationSnippet: `export const metadata = {\n  title: "Medical Specialties & Clinical Services | ${siteName}",\n  description: "Explore primary care, urgent care, and specialized treatments at ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/services" }\n};`,
      },
      {
        id: "p-doctors",
        path: "/doctors",
        pageType: "Find Doctors",
        title: `Find Board-Certified Doctors & Specialists | ${siteName}`,
        metaDescription: `Search verified doctors, specialists, and nurse practitioners at ${siteName}. View credentials, reviews, languages spoken, and available times.`,
        primaryKeyword: "find board certified doctors online",
        secondaryKeywords: ["physician directory", "top rated doctors near me", "pediatrician appointments"],
        h1: "Meet Our Team of Board-Certified Physicians",
        h2s: ["Filter Doctors by Specialty & Location", "Physician Credentials & Medical Backgrounds", "Verified Patient Testimonials"],
        searchIntent: "Transactional",
        schemaType: "Physician / MedicalOrganization",
        canonicalUrl: `https://${cleanDomain}/doctors`,
        priorityScore: 94,
        implementationSnippet: `export const metadata = {\n  title: "Find Board-Certified Doctors & Specialists | ${siteName}",\n  description: "Search verified doctors and specialists at ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/doctors" }\n};`,
      },
      {
        id: "p-book",
        path: "/book-appointment",
        pageType: "Book Appointment",
        title: `Book Doctor Appointment Online & Telehealth | ${siteName}`,
        metaDescription: `Schedule your next doctor visit online in seconds. Choose in-clinic or secure video telehealth consultations with ${siteName}.`,
        primaryKeyword: "schedule doctor appointment online",
        secondaryKeywords: ["book telehealth consultation", "same day clinic appointment", "new patient registration"],
        h1: "Book Your Medical Appointment Online",
        h2s: ["Select In-Person or Telehealth Visit", "Choose Your Preferred Date & Time", "Insurance Verification & Patient Intake"],
        searchIntent: "Transactional",
        schemaType: "ScheduleAction / MedicalBusiness",
        canonicalUrl: `https://${cleanDomain}/book-appointment`,
        priorityScore: 97,
        implementationSnippet: `export const metadata = {\n  title: "Book Doctor Appointment Online & Telehealth | ${siteName}",\n  description: "Schedule your next doctor visit online in seconds with ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/book-appointment" }\n};`,
      },
      {
        id: "p-insurance",
        path: "/insurance-pricing",
        pageType: "Insurance & Pricing",
        title: `Accepted Health Insurance & Pricing | ${siteName}`,
        metaDescription: `Review accepted health insurance providers, Medicare/Medicaid plans, and transparent out-of-pocket pricing at ${siteName}.`,
        primaryKeyword: "accepted health insurance and medical fees",
        secondaryKeywords: ["in-network insurance plans", "self-pay medical pricing", "copay policy"],
        h1: "Health Insurance Coverage & Self-Pay Pricing",
        h2s: ["Major In-Network Insurance Providers", "Transparent Self-Pay Rates for Common Procedures", "Billing FAQs & Financial Assistance"],
        searchIntent: "Commercial",
        schemaType: "PriceSpecification / FAQPage",
        canonicalUrl: `https://${cleanDomain}/insurance-pricing`,
        priorityScore: 90,
        implementationSnippet: `export const metadata = {\n  title: "Accepted Health Insurance & Pricing | ${siteName}",\n  description: "Review accepted insurance and self-pay pricing at ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/insurance-pricing" }\n};`,
      },
      {
        id: "p-portal",
        path: "/patient-portal",
        pageType: "Patient Portal",
        title: `Patient Portal Login & Lab Results | ${siteName}`,
        metaDescription: `Log in to the secure patient portal to view test results, message your care team, request prescription refills, and review visit summaries.`,
        primaryKeyword: "patient portal login test results",
        secondaryKeywords: ["prescription refill online", "message my doctor", "medical records access"],
        h1: "Secure Patient Portal & Health Records",
        h2s: ["Access Lab & Diagnostic Results", "Secure Doctor Messaging", "Prescription Refill Requests"],
        searchIntent: "Navigational",
        schemaType: "WebPage / MedicalOrganization",
        canonicalUrl: `https://${cleanDomain}/patient-portal`,
        priorityScore: 85,
        implementationSnippet: `export const metadata = {\n  title: "Patient Portal Login & Lab Results | ${siteName}",\n  description: "Log in to the secure patient portal at ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/patient-portal" }\n};`,
      },
    ];
  } else if (isRealEstate) {
    pagesList = [
      {
        id: "p-home",
        path: "/",
        pageType: "Homepage",
        title: `${siteName} — Homes for Sale, Real Estate & Local Listings`,
        metaDescription: `Search thousands of homes for sale, luxury estates, and rental properties with ${siteName}. Get real-time MLS listings and market values.`,
        primaryKeyword: `${siteName.toLowerCase()} homes for sale`,
        secondaryKeywords: ["real estate listings", "buy a house", "local MLS properties"],
        h1: `Find Your Dream Home with ${siteName}`,
        h2s: ["Featured Homes for Sale & New Listings", "Explore Top Neighborhoods & School Districts", "What Is Your Home Worth? Instant Valuation", "Top-Rated Local Real Estate Agents"],
        searchIntent: "Commercial",
        schemaType: "RealEstateAgent / SingleFamilyResidence",
        canonicalUrl: `https://${cleanDomain}/`,
        priorityScore: 99,
        implementationSnippet: `export const metadata = {\n  title: "${siteName} — Homes for Sale, Real Estate & Local Listings",\n  description: "Search homes for sale and rental properties with ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/" }\n};`,
      },
      {
        id: "p-homes",
        path: "/homes-for-sale",
        pageType: "Homes for Sale",
        title: `Browse Homes for Sale & MLS Property Listings | ${siteName}`,
        metaDescription: `Explore single family homes, condos, townhouses, and open houses. Filter by price, bedrooms, square footage, and school rating.`,
        primaryKeyword: "homes for sale and MLS property listings",
        secondaryKeywords: ["houses with swimming pool", "condos for sale", "upcoming open houses"],
        h1: "Search MLS Homes for Sale & Luxury Properties",
        h2s: ["Interactive Map Search", "Filter by Price, Beds & Property Type", "Recently Price-Dropped Listings"],
        searchIntent: "Commercial",
        schemaType: "ItemList / RealEstateListing",
        canonicalUrl: `https://${cleanDomain}/homes-for-sale`,
        priorityScore: 96,
        implementationSnippet: `export const metadata = {\n  title: "Browse Homes for Sale & MLS Property Listings | ${siteName}",\n  description: "Explore homes for sale and MLS listings with ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/homes-for-sale" }\n};`,
      },
      {
        id: "p-sell",
        path: "/sell-my-home",
        pageType: "Sell Property",
        title: `Sell Your Home Fast for Top Dollar | ${siteName}`,
        metaDescription: `Get a free home valuation and learn how ${siteName} expert marketing, HDR photography, and local market reach sells homes faster.`,
        primaryKeyword: "sell my home for top dollar",
        secondaryKeywords: ["home value estimator", "real estate listing agent", "selling property guide"],
        h1: "Sell Your Property with Proven Local Real Estate Experts",
        h2s: ["Instant Comparative Market Analysis (CMA)", "Our High-Impact Marketing Strategy", "Recent Neighborhood Sales & Comps"],
        searchIntent: "Transactional",
        schemaType: "Service / RealEstateAgent",
        canonicalUrl: `https://${cleanDomain}/sell-my-home`,
        priorityScore: 93,
        implementationSnippet: `export const metadata = {\n  title: "Sell Your Home Fast for Top Dollar | ${siteName}",\n  description: "Get a free home valuation with ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/sell-my-home" }\n};`,
      },
      {
        id: "p-mortgage",
        path: "/mortgage-calculator",
        pageType: "Mortgage Calculator",
        title: `Free Mortgage Calculator with Taxes & Insurance | ${siteName}`,
        metaDescription: `Calculate monthly mortgage payments, interest rates, property taxes, PMI, and amortization schedule with ${siteName} free tool.`,
        primaryKeyword: "mortgage payment calculator with taxes",
        secondaryKeywords: ["home loan interest calculator", "amortization schedule tool", "how much house can I afford"],
        h1: "Free Interactive Mortgage & Home Affordability Calculator",
        h2s: ["Calculate Principal, Interest, Taxes & Insurance", "Current Average Mortgage Interest Rates", "Down Payment & Loan Term Scenarios"],
        searchIntent: "Informational",
        schemaType: "SoftwareApplication / FAQPage",
        canonicalUrl: `https://${cleanDomain}/mortgage-calculator`,
        priorityScore: 91,
        implementationSnippet: `export const metadata = {\n  title: "Free Mortgage Calculator with Taxes & Insurance | ${siteName}",\n  description: "Calculate monthly mortgage payments with ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/mortgage-calculator" }\n};`,
      },
      {
        id: "p-agents",
        path: "/agents",
        pageType: "Local Agents",
        title: `Meet Our Top Local Real Estate Agents | ${siteName}`,
        metaDescription: `Connect with licensed local realtors at ${siteName}. View agent track records, recent sales, client reviews, and neighborhood specializations.`,
        primaryKeyword: "top local real estate agents near me",
        secondaryKeywords: ["licensed realtors", "buyer agent directory", "seller agent reviews"],
        h1: "Licensed Real Estate Agents Dedicated to Your Goals",
        h2s: ["Find an Agent by Neighborhood", "Recent Closed Transactions & Accolades", "Schedule a One-on-One Buyer Consultation"],
        searchIntent: "Transactional",
        schemaType: "RealEstateAgent / Organization",
        canonicalUrl: `https://${cleanDomain}/agents`,
        priorityScore: 88,
        implementationSnippet: `export const metadata = {\n  title: "Meet Our Top Local Real Estate Agents | ${siteName}",\n  description: "Connect with licensed real estate agents at ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/agents" }\n};`,
      },
    ];
  } else if (isLegal) {
    pagesList = [
      {
        id: "p-home",
        path: "/",
        pageType: "Homepage",
        title: `${siteName} — Experienced Trial Lawyers & Legal Counsel`,
        metaDescription: `Get trusted legal representation from ${siteName}. Dedicated attorneys fighting for your rights in personal injury, corporate, and civil litigation.`,
        primaryKeyword: `${siteName.toLowerCase()} law firm`,
        secondaryKeywords: ["experienced trial lawyers", "free legal consultation", "top rated attorneys"],
        h1: `Fierce Legal Representation & Counsel at ${siteName}`,
        h2s: ["Our Core Practice Areas", "Millions Recovered for Our Clients", "Meet Our Experienced Attorneys", "Free, Confidential Case Review"],
        searchIntent: "Commercial",
        schemaType: "LegalService / Attorney",
        canonicalUrl: `https://${cleanDomain}/`,
        priorityScore: 99,
        implementationSnippet: `export const metadata = {\n  title: "${siteName} — Experienced Trial Lawyers & Legal Counsel",\n  description: "Get trusted legal representation from ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/" }\n};`,
      },
      {
        id: "p-practice",
        path: "/practice-areas",
        pageType: "Practice Areas",
        title: `Legal Practice Areas & Case Representation | ${siteName}`,
        metaDescription: `Explore our practice areas: Personal Injury, Car Accidents, Medical Malpractice, Business Litigation, Employment Law, and Criminal Defense.`,
        primaryKeyword: "legal practice areas attorney representation",
        secondaryKeywords: ["personal injury lawyer", "car accident settlement", "employment law claims"],
        h1: "Comprehensive Legal Practice Areas & Case Specializations",
        h2s: ["Personal Injury & Wrongful Death", "Motor Vehicle & Truck Accidents", "Commercial & Corporate Litigation", "Worker's Compensation"],
        searchIntent: "Commercial",
        schemaType: "LegalService",
        canonicalUrl: `https://${cleanDomain}/practice-areas`,
        priorityScore: 96,
        implementationSnippet: `export const metadata = {\n  title: "Legal Practice Areas & Case Representation | ${siteName}",\n  description: "Explore our practice areas at ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/practice-areas" }\n};`,
      },
      {
        id: "p-attorneys",
        path: "/attorneys",
        pageType: "Attorneys",
        title: `Our Attorneys & Legal Partners | ${siteName}`,
        metaDescription: `Meet the accomplished partners and associate attorneys at ${siteName}. Review bar admissions, court victories, and industry awards.`,
        primaryKeyword: "trial attorneys and law firm partners",
        secondaryKeywords: ["attorney biographies", "bar association certified lawyers", "law firm team"],
        h1: "Trial Lawyers with a Record of Tenacious Advocacy",
        h2s: ["Managing Partners & Senior Counsel", "Bar Admissions & Federal Court Experience", "Notable Case Verdicts & Settlements"],
        searchIntent: "Commercial",
        schemaType: "Attorney / Person",
        canonicalUrl: `https://${cleanDomain}/attorneys`,
        priorityScore: 92,
        implementationSnippet: `export const metadata = {\n  title: "Our Attorneys & Legal Partners | ${siteName}",\n  description: "Meet the accomplished attorneys at ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/attorneys" }\n};`,
      },
      {
        id: "p-case-results",
        path: "/case-results",
        pageType: "Case Verdicts",
        title: `Notable Case Results & Multi-Million Settlements | ${siteName}`,
        metaDescription: `Review our historic verdicts and settlements across personal injury and complex business lawsuits. Over $100M+ recovered for clients.`,
        primaryKeyword: "law firm case results and verdicts",
        secondaryKeywords: ["personal injury settlements", "court trial victories", "client case outcomes"],
        h1: "Proven Track Record: Multi-Million Dollar Verdicts",
        h2s: ["Recent Injury & Accident Settlements", "Commercial Arbitration Victories", "Client Case Studies & Testimonials"],
        searchIntent: "Transactional",
        schemaType: "Review / AggregateRating",
        canonicalUrl: `https://${cleanDomain}/case-results`,
        priorityScore: 93,
        implementationSnippet: `export const metadata = {\n  title: "Notable Case Results & Multi-Million Settlements | ${siteName}",\n  description: "Review our historic verdicts and settlements at ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/case-results" }\n};`,
      },
      {
        id: "p-consultation",
        path: "/free-consultation",
        pageType: "Free Consultation",
        title: `Free Confidential Case Evaluation 24/7 | ${siteName}`,
        metaDescription: `Contact our legal team for a free, confidential case evaluation. No fees unless we win your case. Available 24/7 by phone or online form.`,
        primaryKeyword: "free legal consultation case evaluation",
        secondaryKeywords: ["no win no fee lawyer", "24/7 attorney hotline", "contact law firm"],
        h1: "Request Your Free, Confidential Case Evaluation",
        h2s: ["Tell Us About Your Legal Issue", "Zero Upfront Costs: No Win No Fee Guarantee", "Direct Contact Info & Office Locations"],
        searchIntent: "Transactional",
        schemaType: "ContactPage / LegalService",
        canonicalUrl: `https://${cleanDomain}/free-consultation`,
        priorityScore: 98,
        implementationSnippet: `export const metadata = {\n  title: "Free Confidential Case Evaluation 24/7 | ${siteName}",\n  description: "Contact our legal team for a free case evaluation at ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/free-consultation" }\n};`,
      },
    ];
  } else if (isEcom) {
    pagesList = [
      {
        id: "p-home",
        path: "/",
        pageType: "Homepage",
        title: `${siteName} — Official Store | Shop Top Quality Products`,
        metaDescription: `Discover bestsellers, new arrivals, and exclusive collections at ${siteName}. Free shipping on orders over $50. Shop today!`,
        primaryKeyword: `${siteName.toLowerCase()} official store`,
        secondaryKeywords: ["buy online", "new collection", "bestselling products"],
        h1: `Shop Premium Collections at ${siteName}`,
        h2s: ["Featured Bestsellers", "Seasonal New Arrivals", "Customer Favorites & Verified Reviews", "Fast Worldwide Delivery"],
        searchIntent: "Transactional",
        schemaType: "Store / Organization",
        canonicalUrl: `https://${cleanDomain}/`,
        priorityScore: 99,
        implementationSnippet: `export const metadata = {\n  title: "${siteName} — Official Store | Shop Top Quality Products",\n  description: "Discover bestsellers and new arrivals at ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/" }\n};`,
      },
      {
        id: "p-collections",
        path: "/collections/all",
        pageType: "Product Catalog",
        title: `All Products & Catalog | ${siteName}`,
        metaDescription: `Browse the complete collection of trending products, accessories, and deals at ${siteName}. Fast delivery and 30-day returns.`,
        primaryKeyword: "all products catalog",
        secondaryKeywords: ["online shopping collection", "trending gear", "discount items"],
        h1: "Browse Our Complete Product Catalog",
        h2s: ["Filter by Category", "Top Rated by Customers", "On-Sale Items"],
        searchIntent: "Commercial",
        schemaType: "ItemList / CollectionPage",
        canonicalUrl: `https://${cleanDomain}/collections/all`,
        priorityScore: 94,
        implementationSnippet: `export const metadata = {\n  title: "All Products & Catalog | ${siteName}",\n  description: "Browse the complete collection of products at ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/collections/all" }\n};`,
      },
      {
        id: "p-reviews",
        path: "/reviews",
        pageType: "Customer Reviews",
        title: `Customer Reviews & Testimonials | ${siteName}`,
        metaDescription: `Read verified customer ratings and real product reviews for ${siteName}. See why 10,000+ happy shoppers trust our brand.`,
        primaryKeyword: `${siteName.toLowerCase()} customer reviews`,
        secondaryKeywords: ["verified buyer ratings", "is it legit", "product feedback"],
        h1: "Verified Customer Reviews & Feedback",
        h2s: ["Real Shopper Photos", "5-Star Rating Breakdown", "Verified Purchases"],
        searchIntent: "Commercial",
        schemaType: "AggregateRating / Review",
        canonicalUrl: `https://${cleanDomain}/reviews`,
        priorityScore: 89,
        implementationSnippet: `export const metadata = {\n  title: "Customer Reviews & Testimonials | ${siteName}",\n  description: "Read verified customer reviews for ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/reviews" }\n};`,
      },
      {
        id: "p-shipping",
        path: "/shipping-returns",
        pageType: "Shipping & Returns",
        title: `Shipping Rates & 30-Day Easy Returns | ${siteName}`,
        metaDescription: `Learn about ${siteName} worldwide shipping times, tracking your order, and our hassle-free 30-day return policy.`,
        primaryKeyword: `${siteName.toLowerCase()} shipping policy`,
        secondaryKeywords: ["delivery times", "free return label", "order tracking"],
        h1: "Shipping Information & Return Guidelines",
        h2s: ["Standard & Express Delivery Times", "Tracking Your Package", "Hassle-Free 30-Day Returns Policy"],
        searchIntent: "Informational",
        schemaType: "FAQPage",
        canonicalUrl: `https://${cleanDomain}/shipping-returns`,
        priorityScore: 82,
        implementationSnippet: `export const metadata = {\n  title: "Shipping Rates & 30-Day Easy Returns | ${siteName}",\n  description: "Learn about shipping times and returns at ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/shipping-returns" }\n};`,
      },
      {
        id: "p-about",
        path: "/about",
        pageType: "About Brand",
        title: `About ${siteName} — Our Brand Mission & Story`,
        metaDescription: `Discover the story behind ${siteName}, our sustainable manufacturing process, and our commitment to quality craftsmanship.`,
        primaryKeyword: `about ${siteName.toLowerCase()}`,
        secondaryKeywords: ["brand story", "our mission", "quality craftsmanship"],
        h1: `The Story and Mission of ${siteName}`,
        h2s: ["Sustainable Materials & Craft", "How We Got Started", "Giving Back to the Community"],
        searchIntent: "Informational",
        schemaType: "AboutPage / Organization",
        canonicalUrl: `https://${cleanDomain}/about`,
        priorityScore: 78,
        implementationSnippet: `export const metadata = {\n  title: "About ${siteName} — Our Brand Mission & Story",\n  description: "Discover the story behind ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/about" }\n};`,
      },
      {
        id: "p-contact",
        path: "/contact",
        pageType: "Customer Support",
        title: `Contact Customer Support & Help Center | ${siteName}`,
        metaDescription: `Need help with an order? Contact the ${siteName} customer care team via 24/7 live chat, email, or telephone.`,
        primaryKeyword: `${siteName.toLowerCase()} customer support`,
        secondaryKeywords: ["help center", "contact email", "order assistance"],
        h1: "Contact Customer Support",
        h2s: ["Live Chat & Help Desk", "Submit a Support Ticket", "Frequently Asked Questions"],
        searchIntent: "Navigational",
        schemaType: "ContactPage",
        canonicalUrl: `https://${cleanDomain}/contact`,
        priorityScore: 80,
        implementationSnippet: `export const metadata = {\n  title: "Contact Customer Support & Help Center | ${siteName}",\n  description: "Contact the ${siteName} support team.",\n  alternates: { canonical: "https://${cleanDomain}/contact" }\n};`,
      },
    ];
  } else {
    // Default SaaS / Tech / General Services
    pagesList = [
      {
        id: "p-home",
        path: "/",
        pageType: "Homepage",
        title: `${siteName} — The All-in-One Solution for ${niche.split(",")[0]}`,
        metaDescription: `Discover how ${siteName} helps you streamline workflows, boost efficiency, and scale seamlessly. Get started free in 2 minutes today.`,
        primaryKeyword: primaryKw,
        secondaryKeywords: [secKw1, secKw2, `${siteName.toLowerCase()} software`],
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
        h1: "Simple, Predictable Pricing for Teams of All Sizes",
        h2s: ["Choose the Plan That Fits Your Growth", "Feature Comparison Matrix", "Billing & Subscription FAQ"],
        searchIntent: "Transactional",
        schemaType: "PriceSpecification / FAQPage",
        canonicalUrl: `https://${cleanDomain}/pricing`,
        priorityScore: 95,
        implementationSnippet: `export const metadata = {\n  title: "Transparent Pricing Plans & Cost Calculator | ${siteName}",\n  description: "Explore flexible pricing plans for ${siteName}. Compare tiers.",\n  alternates: { canonical: "https://${cleanDomain}/pricing" }\n};`,
      },
      {
        id: "p-features",
        path: "/features",
        pageType: "Features",
        title: `Core Features & Technical Capabilities | ${siteName}`,
        metaDescription: `Dive into powerful automation, deep integrations, and real-time collaboration tools built inside ${siteName}. See live demo.`,
        primaryKeyword: `${siteName.toLowerCase()} features`,
        secondaryKeywords: ["capabilities overview", "software tools", "workflow automation"],
        h1: "Engineered for Performance, Built for Modern Teams",
        h2s: ["High-Speed Realtime Sync", "End-to-End Encryption & Security", "Zero-Config Third Party Integrations"],
        searchIntent: "Commercial",
        schemaType: "Service / Product",
        canonicalUrl: `https://${cleanDomain}/features`,
        priorityScore: 91,
        implementationSnippet: `export const metadata = {\n  title: "Core Features & Technical Capabilities | ${siteName}",\n  description: "Dive into powerful automation and tools inside ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/features" }\n};`,
      },
      {
        id: "p-solutions",
        path: "/solutions/enterprise",
        pageType: "Solutions",
        title: `Enterprise Solutions, Security & Compliance | ${siteName}`,
        metaDescription: `Scale your organization with enterprise-grade SOC2 compliance, custom SLA guarantees, dedicated account managers, and SSO.`,
        primaryKeyword: `${siteName.toLowerCase()} enterprise`,
        secondaryKeywords: ["SOC2 compliance", "SSO integration", "custom SLA"],
        h1: "Enterprise Scale with Uncompromising Security",
        h2s: ["Strict Security Standards & SOC2 Audits", "Custom Data Residency", "Dedicated 24/7 Account Management"],
        searchIntent: "Transactional",
        schemaType: "ProfessionalService",
        canonicalUrl: `https://${cleanDomain}/solutions/enterprise`,
        priorityScore: 88,
        implementationSnippet: `export const metadata = {\n  title: "Enterprise Solutions, Security & Compliance | ${siteName}",\n  description: "Scale your organization with enterprise-grade security and SLA.",\n  alternates: { canonical: "https://${cleanDomain}/solutions/enterprise" }\n};`,
      },
      {
        id: "p-docs",
        path: "/docs",
        pageType: "API & Docs",
        title: `Developer Documentation, API Reference & SDKs | ${siteName}`,
        metaDescription: `Quickstart guides, REST API documentation, SDKs, and code samples to integrate ${siteName} in under 5 minutes.`,
        primaryKeyword: `${siteName.toLowerCase()} api docs`,
        secondaryKeywords: ["developer quickstart", "REST endpoints", "typescript sdk"],
        h1: "Developer Documentation & API Quickstart",
        h2s: ["Authentication & API Keys", "Interactive Code Sandboxes", "Webhooks & Event Listeners"],
        searchIntent: "Informational",
        schemaType: "TechArticle / WebAPI",
        canonicalUrl: `https://${cleanDomain}/docs`,
        priorityScore: 86,
        implementationSnippet: `export const metadata = {\n  title: "Developer Documentation, API Reference & SDKs | ${siteName}",\n  description: "Quickstart guides and API reference for ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/docs" }\n};`,
      },
      {
        id: "p-blog",
        path: "/blog",
        pageType: "Blog & Guides",
        title: `Engineering, Growth & Industry Insights Blog | ${siteName}`,
        metaDescription: `Read expert tutorials, technical case studies, and industry trends written by the engineering and product team at ${siteName}.`,
        primaryKeyword: `${siteName.toLowerCase()} blog`,
        secondaryKeywords: ["industry trends", "how-to tutorials", "engineering case studies"],
        h1: "Insights, Tutorials & Engineering Deep Dives",
        h2s: ["Latest Articles", "Trending Case Studies", "Best Practices Guides"],
        searchIntent: "Informational",
        schemaType: "Blog / Periodical",
        canonicalUrl: `https://${cleanDomain}/blog`,
        priorityScore: 84,
        implementationSnippet: `export const metadata = {\n  title: "Engineering, Growth & Industry Insights Blog | ${siteName}",\n  description: "Read expert tutorials and industry insights at ${siteName}.",\n  alternates: { canonical: "https://${cleanDomain}/blog" }\n};`,
      },
      {
        id: "p-contact",
        path: "/contact",
        pageType: "Contact & Demo",
        title: `Book a Live Demo & Contact Sales | ${siteName}`,
        metaDescription: `Talk to our product specialists. Schedule a personalized 15-minute walkthrough of ${siteName} tailored to your business.`,
        primaryKeyword: `contact ${siteName.toLowerCase()} sales`,
        secondaryKeywords: ["book a demo", "talk to sales", "customer inquiry"],
        h1: "Talk to Our Solutions Specialists",
        h2s: ["Schedule Your Interactive Demo", "Global Office Locations", "Direct Sales Contact Details"],
        searchIntent: "Transactional",
        schemaType: "ContactPage",
        canonicalUrl: `https://${cleanDomain}/contact`,
        priorityScore: 87,
        implementationSnippet: `export const metadata = {\n  title: "Book a Live Demo & Contact Sales | ${siteName}",\n  description: "Talk to our product specialists and schedule a demo.",\n  alternates: { canonical: "https://${cleanDomain}/contact" }\n};`,
      },
    ];
  }

  return {
    domain: `https://${cleanDomain}`,
    cleanDomain,
    siteName,
    analyzedAt: new Date().toISOString(),
    niche: niche,
    targetAudience: "Business leaders, technical decision makers, practitioners, and customers looking for top-tier solutions.",
    seoHealthScore: 88,
    summary: `${siteName} (${cleanDomain}) has significant organic search expansion opportunities in ${niche}. By optimizing meta architecture, targeting high-intent long-tail keywords, and implementing schema structured data across all pages, the domain can capture high-converting organic search traffic.`,
    competitiveAngle: `Position ${siteName} as the modern, fast, and feature-rich leader in ${niche} with superior user experience, verified trust signals, and high-CTR page metadata.`,
    headingStructure: {
      h1: `${siteName} — The Modern Solution for ${niche}`,
      h2s: [
        `Why Leading Teams Choose ${siteName}`,
        "Core Features Built for Speed and Scalability",
        "Transparent Pricing and Comparison Matrix",
        "Frequently Asked Questions",
      ],
      h3s: [
        "Enterprise-grade Security & Compliance",
        "Instant One-Click Setup & Migration",
        "Seamless API & Tool Integrations",
      ],
    },
    topRecommendations: [
      `Implement dedicated SEO landing pages for each core service/product path targeting specific user search intent.`,
      `Add Schema.org JSON-LD structured data (Organization, WebSite with SearchAction, and FAQPage / Service schema) to earn Google SERP rich snippets.`,
      `Configure OpenGraph 1200x630 dynamic feature images for all core pages to boost social click-through rate (CTR) by 40%+.`,
      `Optimize page titles to strictly stay between 50-60 characters and meta descriptions between 145-155 characters with clear action verbs.`,
    ],
    pages: pagesList,
    keywords: isAstrology
      ? [
          {
            id: "kw-1",
            keyword: `${siteName.toLowerCase()} daily horoscope`,
            category: "primary",
            searchIntent: "Informational",
            searchVolume: "85.4K/mo",
            difficulty: 32,
            difficultyLabel: "Medium",
            cpc: "$1.40",
            priority: "High",
            relevanceScore: 99,
            contentOpportunity: "Daily Horoscope Hub & 12 Zodiac Sign Landing Pages",
            targetUrlSlug: "/daily-horoscope",
          },
          {
            id: "kw-2",
            keyword: "free birth chart calculator with houses",
            category: "primary",
            searchIntent: "Transactional",
            searchVolume: "62.1K/mo",
            difficulty: 40,
            difficultyLabel: "Medium",
            cpc: "$2.15",
            priority: "High",
            relevanceScore: 98,
            contentOpportunity: "Interactive Natal Chart tool with instant PDF report generator",
            targetUrlSlug: "/birth-chart-calculator",
          },
          {
            id: "kw-3",
            keyword: "zodiac signs love compatibility test",
            category: "secondary",
            searchIntent: "Commercial",
            searchVolume: "45.0K/mo",
            difficulty: 35,
            difficultyLabel: "Medium",
            cpc: "$1.85",
            priority: "High",
            relevanceScore: 95,
            contentOpportunity: "144 Zodiac Pairings Matrix with synastry percentage score",
            targetUrlSlug: "/zodiac-signs/compatibility",
          },
          {
            id: "kw-4",
            keyword: "free daily tarot reading 3 cards",
            category: "secondary",
            searchIntent: "Transactional",
            searchVolume: "38.2K/mo",
            difficulty: 28,
            difficultyLabel: "Easy",
            cpc: "$1.60",
            priority: "High",
            relevanceScore: 93,
            contentOpportunity: "Interactive 3D Tarot card deck animation tool",
            targetUrlSlug: "/tarot-readings",
          },
          {
            id: "kw-5",
            keyword: "what is my rising sign ascendant meaning",
            category: "question",
            searchIntent: "Informational",
            searchVolume: "29.7K/mo",
            difficulty: 22,
            difficultyLabel: "Easy",
            cpc: "$1.10",
            priority: "High",
            relevanceScore: 91,
            contentOpportunity: "Comprehensive Ascendant Sign Guide & Calculator FAQ",
            targetUrlSlug: "/blog/rising-sign-guide",
          },
          {
            id: "kw-6",
            keyword: "mercury retrograde dates 2026 effects",
            category: "longtail",
            searchIntent: "Informational",
            searchVolume: "24.6K/mo",
            difficulty: 18,
            difficultyLabel: "Easy",
            cpc: "$0.90",
            priority: "Medium",
            relevanceScore: 89,
            contentOpportunity: "Annual Planetary Retrograde Calendar & Survival Guide",
            targetUrlSlug: "/blog/lunar-cycles",
          },
          {
            id: "kw-7",
            keyword: "best astrologers for birth chart reading online",
            category: "longtail",
            searchIntent: "Commercial",
            searchVolume: "18.3K/mo",
            difficulty: 31,
            difficultyLabel: "Medium",
            cpc: "$3.80",
            priority: "High",
            relevanceScore: 92,
            contentOpportunity: "Verified Astrologer Directory with booking calendar",
            targetUrlSlug: "/astrologers",
          },
          {
            id: "kw-8",
            keyword: "full moon ritual for manifestation tonight",
            category: "question",
            searchIntent: "Informational",
            searchVolume: "15.8K/mo",
            difficulty: 16,
            difficultyLabel: "Easy",
            cpc: "$0.75",
            priority: "Medium",
            relevanceScore: 86,
            contentOpportunity: "Step-by-step Lunar Manifesting & Crystal Ritual Guide",
            targetUrlSlug: "/blog/lunar-cycles",
          },
        ]
      : [
          {
            id: "kw-1",
            keyword: primaryKw,
            category: "primary",
            searchIntent: "Commercial",
            searchVolume: "24.5K/mo",
            difficulty: 42,
            difficultyLabel: "Medium",
            cpc: "$3.85",
            priority: "High",
            relevanceScore: 98,
            contentOpportunity: "Homepage Hero Title & Main Landing Page H1",
            targetUrlSlug: "/",
          },
          {
            id: "kw-2",
            keyword: `${cleanDomain} pricing`,
            category: "primary",
            searchIntent: "Transactional",
            searchVolume: "14.2K/mo",
            difficulty: 28,
            difficultyLabel: "Easy",
            cpc: "$4.10",
            priority: "High",
            relevanceScore: 95,
            contentOpportunity: "Dedicated pricing matrix page with ROI calculator",
            targetUrlSlug: "/pricing",
          },
          {
            id: "kw-3",
            keyword: secKw1,
            category: "secondary",
            searchIntent: "Commercial",
            searchVolume: "8.9K/mo",
            difficulty: 38,
            difficultyLabel: "Medium",
            cpc: "$4.20",
            priority: "High",
            relevanceScore: 92,
            contentOpportunity: "Top alternatives & competitive comparison landing page",
            targetUrlSlug: "/compare",
          },
          {
            id: "kw-4",
            keyword: secKw2,
            category: "secondary",
            searchIntent: "Transactional",
            searchVolume: "6.4K/mo",
            difficulty: 45,
            difficultyLabel: "Medium",
            cpc: "$5.15",
            priority: "High",
            relevanceScore: 90,
            contentOpportunity: "Product features & solution showcase pillar page",
            targetUrlSlug: "/features",
          },
          {
            id: "kw-5",
            keyword: `how to choose the best ${niche.split(" ")[0].toLowerCase()} solution`,
            category: "longtail",
            searchIntent: "Informational",
            searchVolume: "4.1K/mo",
            difficulty: 22,
            difficultyLabel: "Easy",
            cpc: "$1.80",
            priority: "Medium",
            relevanceScore: 88,
            contentOpportunity: "Ultimate Buyer Guide pillar blog post with downloadable PDF",
            targetUrlSlug: "/blog/buyers-guide",
          },
          {
            id: "kw-6",
            keyword: `is ${siteName.toLowerCase()} legit and safe`,
            category: "question",
            searchIntent: "Informational",
            searchVolume: "3.2K/mo",
            difficulty: 15,
            difficultyLabel: "Easy",
            cpc: "$0.95",
            priority: "High",
            relevanceScore: 89,
            contentOpportunity: "Trust Center, Security, and Customer Review FAQ accordion",
            targetUrlSlug: "/security",
          },
          {
            id: "kw-7",
            keyword: `${siteName.toLowerCase()} vs top competitors review`,
            category: "longtail",
            searchIntent: "Commercial",
            searchVolume: "5.8K/mo",
            difficulty: 34,
            difficultyLabel: "Medium",
            cpc: "$3.90",
            priority: "High",
            relevanceScore: 91,
            contentOpportunity: "In-depth Head-to-Head Comparison Table & Feature Matrix",
            targetUrlSlug: "/compare/vs-market-leader",
          },
          {
            id: "kw-8",
            keyword: `what is the cost of ${niche.split(" ")[0].toLowerCase()}`,
            category: "question",
            searchIntent: "Informational",
            searchVolume: "2.9K/mo",
            difficulty: 20,
            difficultyLabel: "Easy",
            cpc: "$2.10",
            priority: "Medium",
            relevanceScore: 85,
            contentOpportunity: "Pricing transparency blog breakdown & ROI estimation tool",
            targetUrlSlug: "/blog/cost-guide",
          },
        ],
    metaTags: [
      {
        id: "meta-1",
        label: "Benefit-Driven (Simple & High CTR)",
        type: "Benefit-Driven",
        metaTitle: isAstrology
          ? `${siteName} — Free Daily Horoscopes & Birth Chart Calculator`
          : isHealth
          ? `${siteName} — Compassionate Healthcare & Doctor Appointments`
          : isRealEstate
          ? `${siteName} — Homes for Sale, Listings & Local Realtors`
          : isLegal
          ? `${siteName} — Experienced Attorneys & Free Legal Consultation`
          : `${siteName} — The Simple, Powerful Way to Manage Your ${niche.split(",")[0]}`,
        metaTitleLength: isAstrology ? 57 : 54,
        metaDescription: isAstrology
          ? `Read your free daily horoscope for all 12 zodiac signs, check love compatibility, and calculate your birth chart on ${siteName}. Start exploring today.`
          : isHealth
          ? `Find trusted doctors and book in-person or telehealth visits easily with ${siteName}. Friendly care and transparent pricing. Book your visit now.`
          : isRealEstate
          ? `Search homes for sale, explore local neighborhood guides, and calculate mortgage payments easily with ${siteName}. Find your dream home today.`
          : isLegal
          ? `Get dedicated legal help from experienced attorneys at ${siteName}. We handle injury claims and legal disputes. Request your free case review now.`
          : `See how ${siteName} helps you get work done faster and with less hassle. Simple tools, clear pricing, and no setup fees. Try it free today.`,
        metaDescriptionLength: 148,
        ogTitle: isAstrology ? `${siteName} | Daily Horoscopes & Astrology` : `${siteName} | Simple & Fast ${niche.split(",")[0]}`,
        ogDescription: isAstrology
          ? `Get free daily horoscopes, zodiac sign forecasts, and birth chart calculations at ${cleanDomain}.`
          : `Make your work simpler and faster with ${siteName}. Explore features and get started today.`,
        canonicalUrl: `https://${cleanDomain}/`,
        focusKeyword: primaryKw,
      },
      {
        id: "meta-2",
        label: "SEO-Optimized (Clear Keyword Focus)",
        type: "SEO-Optimized",
        metaTitle: isAstrology
          ? `Daily Horoscope, Zodiac Signs & Birth Charts | ${siteName}`
          : isHealth
          ? `Find Doctors & Book Medical Appointments Online | ${siteName}`
          : isRealEstate
          ? `Homes for Sale & MLS Real Estate Listings | ${siteName}`
          : isLegal
          ? `Top Trial Lawyers & Free Legal Case Reviews | ${siteName}`
          : `Best ${niche.split(",")[0]} Platform (2026) | ${siteName}`,
        metaTitleLength: 48,
        metaDescription: isAstrology
          ? `Looking for accurate horoscopes? Explore daily zodiac updates, birth chart calculators, and planetary transit guides on ${cleanDomain}. Free for all signs.`
          : isHealth
          ? `Search board-certified physicians, primary care clinics, and telehealth doctors near you on ${cleanDomain}. Schedule your appointment online today.`
          : isRealEstate
          ? `Browse new homes for sale, open house schedules, and local property values with ${siteName}. Connect with top local realtors on ${cleanDomain}.`
          : isLegal
          ? `Need an attorney? Compare top practice areas, view multi-million dollar case results, and get a free case evaluation at ${cleanDomain}.`
          : `Looking for top-rated ${niche.split(",")[0]} tools? Compare features, see straightforward pricing, and start your free trial on ${cleanDomain}.`,
        metaDescriptionLength: 152,
        ogTitle: isAstrology ? `Daily Horoscope & Birth Charts | ${siteName}` : `Best ${niche.split(",")[0]} Platform (2026) | ${siteName}`,
        ogDescription: isAstrology
          ? `Check your daily cosmic forecast and zodiac compatibility guides at ${cleanDomain}.`
          : `Explore simple features, live demos, and transparent pricing at ${cleanDomain}.`,
        canonicalUrl: `https://${cleanDomain}/`,
        focusKeyword: isAstrology ? "daily horoscope" : `best ${niche.split(",")[0]}`,
      },
      {
        id: "meta-3",
        label: "Brand-First (Friendly & Trustworthy)",
        type: "Brand-First",
        metaTitle: isAstrology
          ? `${siteName} — Your Friendly Daily Guide to the Stars`
          : isHealth
          ? `${siteName} — Dedicated Healthcare for You and Your Family`
          : isRealEstate
          ? `${siteName} — Helping You Find the Perfect Place to Live`
          : isLegal
          ? `${siteName} — Dedicated Legal Counsel Fighting for You`
          : `${siteName} — Simple, Reliable Tools for Modern Teams`,
        metaTitleLength: 46,
        metaDescription: isAstrology
          ? `Welcome to ${siteName}. We make astrology simple with daily horoscope readings, birth chart maps, and easy-to-understand zodiac advice.`
          : isHealth
          ? `Welcome to ${siteName}. We provide personal, compassionate healthcare with doctors who listen. Find care and book your visit online today.`
          : isRealEstate
          ? `Welcome to ${siteName}. We make buying and selling real estate simple and transparent. Explore active home listings with local experts today.`
          : isLegal
          ? `Welcome to ${siteName}. Trusted legal representation with a track record of winning results. Contact our friendly team for a free consultation.`
          : `Welcome to ${siteName}. We build simple, reliable tools that help people get more done every day. Join thousands of happy users today.`,
        metaDescriptionLength: 146,
        ogTitle: isAstrology ? `${siteName}: Daily Astrology Guide` : `${siteName}: Simple & Reliable`,
        ogDescription: isAstrology
          ? `Discover your zodiac sign meanings and daily horoscope predictions at ${cleanDomain}.`
          : `Discover simple tools built to make your everyday tasks easier with ${siteName}.`,
        canonicalUrl: `https://${cleanDomain}/`,
        focusKeyword: siteName,
      },
    ],
    featureImage: {
      headline: isAstrology ? `Unlock Your Cosmic Blueprint With ${siteName}` : `Scale Your Business With ${siteName}`,
      subheadline: isAstrology ? `Daily Horoscopes, Natal Charts & Love Compatibility` : `The Modern High-Performance Solution for ${niche.split(",")[0]}`,
      badge: isAstrology ? "✦ 100% FREE ACCURATE ASTROLOGY" : "★ TOP-RATED PLATFORM 2026",
      dimensions: "1200 x 630 px",
      aspectRatio: "1.91:1",
      altText: isAstrology
        ? `${siteName} celestial zodiac wheel showing 12 astrological signs and constellation chart preview`
        : `${siteName} platform preview showing real-time interface and key features`,
      aiPrompt: isAstrology
        ? `A celestial deep indigo midnight universe artwork with shimmering gold constellation lines, glowing zodiac wheel symbols for ${cleanDomain}, ethereal glowing nebula dust in violet and golden starlight, elegant typography stating '${siteName}', mystical luxury aesthetic, 8k resolution.`
        : `A high-end editorial 3D render showcasing a sleek glassmorphic dashboard interface for ${cleanDomain}, vibrant glowing gradients in deep sapphire and electric emerald, clean typography saying '${siteName}', ultra-sharp lighting, 8k resolution, modern tech aesthetic.`,
      colorPalette: isAstrology
        ? {
            primary: "#8B5CF6",
            secondary: "#F59E0B",
            background: "#0B0F19",
            text: "#FFFFFF",
            accent: "#C084FC",
          }
        : {
            primary: "#3B82F6",
            secondary: "#10B981",
            background: "#0F172A",
            text: "#FFFFFF",
            accent: "#60A5FA",
          },
      designTips: [
        "Keep text centered within the safe zone (leave 80px margin around all edges).",
        "Use high contrast between the background gradient and the white headline text.",
        "Ensure the image is saved under 300KB in WebP or PNG format for instant social crawler indexing.",
        "Include the logo or domain badge in the top-left or top-center for immediate brand recognition.",
      ],
    },
    codeSnippets: {
      nextjsAppRouter: `// app/layout.tsx (Next.js 14/15 App Router)
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://${cleanDomain}'),
  title: {
    default: '${siteName} — The All-in-One Solution for ${niche.split(",")[0]}',
    template: '%s | ${siteName}',
  },
  description: 'Discover how ${siteName} helps you streamline workflows, boost efficiency, and scale seamlessly. Get started free in 2 minutes.',
  keywords: ['${primaryKw}', '${secKw1}', '${secKw2}'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://${cleanDomain}',
    siteName: '${siteName}',
    title: '${siteName} | Fast, Scalable ${niche.split(",")[0]}',
    description: 'Automate workflows and scale faster with ${siteName}.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '${siteName} Preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '${siteName} — Modern Solution',
    description: 'Discover how ${siteName} helps you streamline workflows.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
      nextjsPagesRouter: `// pages/_app.tsx or pages/index.tsx (Next.js Pages Router)
import Head from 'next/head';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>${siteName} — The All-in-One Solution for ${niche.split(",")[0]}</title>
        <meta name="description" content="Discover how ${siteName} helps you streamline workflows and scale." />
        <link rel="canonical" href="https://${cleanDomain}/" />
        <meta property="og:title" content="${siteName} | Fast, Scalable ${niche.split(",")[0]}" />
        <meta property="og:image" content="https://${cleanDomain}/og-image.png" />
      </Head>
      <main><h1>${siteName}</h1></main>
    </>
  );
}`,
      wordpress: `<?php
/**
 * Add SEO Meta Tags to WordPress <head>
 * Place in your child theme functions.php
 */
function seopulse_custom_meta_tags() {
    if (is_front_page() || is_home()) {
        echo '<meta name="description" content="Discover how ' . esc_attr('${siteName}') . ' helps you streamline workflows and boost efficiency.">' . "\\n";
        echo '<meta property="og:title" content="' . esc_attr('${siteName} — The Modern Solution') . '">' . "\\n";
        echo '<meta property="og:image" content="' . esc_url('https://${cleanDomain}/og-image.png') . '">' . "\\n";
        echo '<meta name="twitter:card" content="summary_large_image">' . "\\n";
    }
}
add_action('wp_head', 'seopulse_custom_meta_tags', 1);
?>`,
      viteReact: `<!-- index.html (Vite + React) -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${siteName} — The All-in-One Solution</title>
    <meta name="description" content="Discover how ${siteName} helps you streamline workflows and scale." />
    <link rel="canonical" href="https://${cleanDomain}/" />
    <meta property="og:title" content="${siteName} | Fast, Scalable" />
    <meta property="og:image" content="https://${cleanDomain}/og-image.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
      astro: `---
// src/layouts/BaseLayout.astro
interface Props {
  title?: string;
  description?: string;
}
const { title = "${siteName} — Modern Platform", description = "Discover how ${siteName} helps you scale." } = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:image" content="/og-image.png" />
  </head>
  <body><slot /></body>
</html>`,
      nuxt: `<!-- app.vue (Nuxt 3) -->
<script setup lang="ts">
useSeoMeta({
  title: '${siteName} — The All-in-One Solution',
  description: 'Discover how ${siteName} helps you streamline workflows and scale.',
  ogImage: 'https://${cleanDomain}/og-image.png',
  twitterCard: 'summary_large_image',
})
</script>
<template><slot /></template>`,
      shopify: `{%- comment -%} snippets/seo-meta-tags.liquid {%- endcomment -%}
<title>{{ page_title }} | {{ shop.name }}</title>
<meta name="description" content="{{ page_description | escape }}">
<meta property="og:site_name" content="{{ shop.name }}">
<meta property="og:url" content="{{ canonical_url }}">`,
      html5: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${siteName} — Official Website</title>
  <meta name="description" content="Discover how ${siteName} helps you streamline workflows and scale.">
</head>
<body></body>
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
      "logo": "https://${cleanDomain}/logo.png"
    },
    {
      "@type": "WebSite",
      "@id": "https://${cleanDomain}/#website",
      "url": "https://${cleanDomain}",
      "name": "${siteName}",
      "publisher": { "@id": "https://${cleanDomain}/#organization" }
    }
  ]
}
</script>`,
    },
    competitors: [
      {
        competitorDomain: `competitor-${siteName.toLowerCase()}1.com`,
        strength: "High domain authority on generic category terms",
        gapOpportunity: `Target long-tail 'vs' comparisons and feature-specific integrations where competitor has thin content`,
        sharedKeywords: [primaryKw, secKw1],
      },
      {
        competitorDomain: `competitor-${siteName.toLowerCase()}2.io`,
        strength: "Established backlink profile and community forums",
        gapOpportunity: `Create interactive toolkits, calculators, and faster documentation pages for '${niche}'`,
        sharedKeywords: [secKw2, `software for ${niche}`],
      },
    ],
  };
}

// API Routes
app.post("/api/seo-analyze", async (req: Request, res: Response) => {
  try {
    const { domain, niche, targetAudience, country } = req.body;
    if (!domain || typeof domain !== "string") {
      res.status(400).json({ error: "Please provide a valid domain name" });
      return;
    }

    const cleanDomain = cleanDomainString(domain);
    const siteName = deriveSiteName(cleanDomain);

    // If no API key is set, return structured smart fallback
    if (!process.env.GEMINI_API_KEY) {
      const fallbackReport = generateSmartFallbackReport(cleanDomain, niche);
      res.json(fallbackReport);
      return;
    }

    const prompt = `You are a world-class Technical SEO Architect and Domain Relevance Specialist.
Perform an exhaustive, data-driven SEO & Keyword Intelligence Audit for the domain: "${cleanDomain}" (Site Name: "${siteName}").
Additional User Context:
- Specified Niche/Industry: ${niche || "Analyze domain name and infer primary industry"}
- Target Audience: ${targetAudience || "Target customer personas"}
- Target Geographic Market: ${country || "Global / US"}

CRITICAL RELEVANCE DIRECTIVE:
1. ONLY generate pages, keywords, schemas, and content that are STRICTLY RELEVANT to what "${cleanDomain}" actually is or does in its respective business vertical.
2. UNRELATED PAGES MUST NOT BE INCLUDED. For example:
   - If the domain is an Astrology/Horoscope site, ONLY output astrology pages (/daily-horoscope, /birth-chart-calculator, /zodiac-compatibility, /tarot-readings, /astrologers, /blog/lunar-cycles). DO NOT include unrelated pages like /software-sdk, /developer-api, /b2b-procurement, /product-catalog, or /medical-doctors.
   - If the domain is an E-Commerce/Retail shop, ONLY include e-commerce pages (/collections, /bestsellers, /cart-checkout, /size-guide, /shipping-returns, /reviews). DO NOT include SaaS trial or medical pages.
   - If the domain is a SaaS/Cloud Tech platform, ONLY include SaaS pages (/pricing, /features, /solutions, /integrations, /docs, /security, /api). DO NOT include horoscopes or physical trade pages.
   - If the domain is a Healthcare/Medical clinic, ONLY include healthcare pages (/doctors, /services, /book-appointment, /patient-portal, /insurance).
   - If the domain is a Restaurant/Food site, ONLY include food pages (/menu, /order-online, /catering, /locations-hours, /reservations).
   - If the domain is a Real Estate site, ONLY include property pages (/homes-for-sale, /sell-home, /neighborhoods, /mortgage-calculator).
   - If the domain is a Legal site, ONLY include law pages (/practice-areas, /attorneys, /free-consultation, /case-results).
3. Every generated page path, H1, H2, keyword, and schema MUST directly tie to the genuine real-world offerings of "${cleanDomain}".

CRITICAL SIMPLICITY & CLARITY DIRECTIVE FOR META DESCRIPTIONS:
1. Meta descriptions MUST be written in simple, plain, easy-to-understand everyday language that any ordinary human can grasp instantly.
2. Avoid confusing technical jargon, vague corporate buzzwords (like "synergy", "unleash", "cutting-edge paradigms"), or keyword stuffing.
3. Every meta description must follow this clear 3-part structure in 140-155 characters:
   - Plain statement: State clearly and simply what the page offers.
   - Visitor benefit: Explain the direct, helpful reason to visit.
   - Actionable invite: End with a simple, friendly call to action (e.g., "Explore guides today.", "Get started free in 2 minutes.", "Read today's horoscope now.").
4. Write with short, crisp sentences and high readability.

Analyze the domain and produce a comprehensive JSON output matching the schema:
{
  "domain": "https://${cleanDomain}",
  "cleanDomain": "${cleanDomain}",
  "siteName": "${siteName}",
  "analyzedAt": "${new Date().toISOString()}",
  "niche": "string (strictly matching the domain's real vertical)",
  "targetAudience": "string",
  "seoHealthScore": number (between 70 and 99),
  "summary": "detailed 2-3 sentence overview of this domain's organic positioning & growth trajectory strictly focused on its real domain identity",
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
    // Provide 6 to 8 core pages STRICTLY RELEVANT to this domain and industry. Do not output generic or mismatched page types.
    {
      "id": "p-1",
      "path": "string (e.g. / or /daily-horoscope or /pricing or /collections)",
      "pageType": "Homepage" | "Pricing" | "Features/Services" | "Solutions" | "Blog/Content" | "Docs/Resources" | "About/Company" | "Contact/Lead",
      "title": "string (50-60 chars meta title tailored to this specific page)",
      "metaDescription": "string (145-160 chars meta description)",
      "primaryKeyword": "string (core target keyword for this URL)",
      "secondaryKeywords": ["kw1", "kw2", "kw3"],
      "h1": "string (optimized H1 headline for this page)",
      "h2s": ["H2 1", "H2 2", "H2 3"],
      "searchIntent": "Transactional" | "Commercial" | "Informational" | "Navigational",
      "schemaType": "string (e.g. WebSite, SoftwareApplication, Product, MedicalBusiness, RealEstateAgent, LegalService, LocalBusiness, FAQPage, Service, etc.)",
      "canonicalUrl": "https://${cleanDomain}/path",
      "priorityScore": number (70-100),
      "implementationSnippet": "export const metadata = { title: '...', description: '...' };"
    }
  ],
  "keywords": [
    {
      "id": "kw-1",
      "keyword": "string (e.g. primary high-intent term)",
      "category": "primary" | "secondary" | "longtail" | "question" | "lsi",
      "searchIntent": "Transactional" | "Commercial" | "Informational" | "Navigational",
      "searchVolume": "string (e.g. 18.2K/mo)",
      "difficulty": number (0-100),
      "difficultyLabel": "Easy" | "Medium" | "Hard" | "Very Hard",
      "cpc": "string (e.g. $3.40)",
      "priority": "High" | "Medium" | "Low",
      "relevanceScore": number (1-100),
      "contentOpportunity": "specific page or content asset recommendation",
      "targetUrlSlug": "e.g. /features/speed"
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
    "badge": "e.g. #1 RATED PLATFORM 2026",
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
    const modelsToTry = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.1-pro-preview"];

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
          if (parsedData && parsedData.domain && parsedData.pages) {
            break; // Successfully obtained valid report
          }
        }
      } catch (err: any) {
        // Attempt next model in cascade silently to gracefully handle temporary demand spikes
        continue;
      }
    }

    if (!parsedData || !parsedData.domain || !parsedData.pages) {
      parsedData = generateSmartFallbackReport(cleanDomain, niche);
    }

    res.json(parsedData);
  } catch (err: any) {
    // Return fallback gracefully so the client never experiences an error
    const fallback = generateSmartFallbackReport(req.body?.domain || "example.com", req.body?.niche);
    res.json(fallback);
  }
});

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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SEO Intelligence Suite Server running on http://localhost:${PORT}`);
  });
}

startServer();
