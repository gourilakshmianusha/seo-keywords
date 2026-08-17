import React, { useState } from "react";
import {
  Search,
  Globe,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  ShoppingBag,
  Stethoscope,
  Building2,
  Scale,
  Wrench,
  Plane,
  Coins,
  GraduationCap,
  Palette,
  Newspaper,
  Dumbbell,
  Utensils,
  Car,
  HeartHandshake,
  Factory,
  Moon,
  ClipboardPaste,
  Check,
} from "lucide-react";

interface DomainInputFormProps {
  onAnalyze: (domain: string, niche: string, targetAudience: string, country: string) => Promise<void>;
  isLoading: boolean;
  activeDomain: string;
}

export interface IndustryDefinition {
  id: string;
  name: string;
  category: string;
  sampleDomain: string;
  sampleAudience: string;
  icon: any;
  defaultPages: string[];
  keyIntent: string;
  schemaRecommendation: string;
}

export const ALL_INDUSTRIES: IndustryDefinition[] = [
  {
    id: "saas",
    name: "SaaS & Cloud Software",
    category: "Technology",
    sampleDomain: "stripe.com",
    sampleAudience: "Tech founders, engineers, and digital businesses",
    icon: Briefcase,
    defaultPages: ["/", "/pricing", "/features", "/solutions", "/integrations", "/docs", "/blog", "/security"],
    keyIntent: "High-intent trials & feature comparisons",
    schemaRecommendation: "SoftwareApplication / Organization",
  },
  {
    id: "ecommerce",
    name: "E-Commerce & DTC Retail",
    category: "Retail",
    sampleDomain: "allbirds.com",
    sampleAudience: "Online shoppers, conscious consumers, and retail buyers",
    icon: ShoppingBag,
    defaultPages: ["/", "/collections/all", "/products/bestsellers", "/reviews", "/size-guide", "/shipping", "/about"],
    keyIntent: "Transactional buyer queries & discount searches",
    schemaRecommendation: "Product / ItemList / AggregateRating",
  },
  {
    id: "healthcare",
    name: "Healthcare, Clinics & Telehealth",
    category: "Health",
    sampleDomain: "onemedical.com",
    sampleAudience: "Patients, families, and healthcare seekers",
    icon: Stethoscope,
    defaultPages: ["/", "/services", "/doctors-providers", "/book-appointment", "/insurance-pricing", "/locations", "/patient-portal"],
    keyIntent: "Local doctor searches & medical symptom inquiries",
    schemaRecommendation: "MedicalBusiness / Physician / FAQPage",
  },
  {
    id: "realestate",
    name: "Real Estate & Property Management",
    category: "Property",
    sampleDomain: "redfin.com",
    sampleAudience: "Home buyers, property sellers, and real estate investors",
    icon: Building2,
    defaultPages: ["/", "/homes-for-sale", "/sell-my-home", "/neighborhood-guides", "/mortgage-calculator", "/agents", "/contact"],
    keyIntent: "Geo-targeted property searches & market reports",
    schemaRecommendation: "RealEstateAgent / SingleFamilyResidence",
  },
  {
    id: "legal",
    name: "Legal Services & Law Firms",
    category: "Professional Services",
    sampleDomain: "morganmorgan.com",
    sampleAudience: "Individuals seeking legal counsel, accident victims & corporate clients",
    icon: Scale,
    defaultPages: ["/", "/practice-areas", "/personal-injury", "/attorney-profiles", "/free-consultation", "/case-results", "/contact"],
    keyIntent: "High-CPC legal advice & local attorney queries",
    schemaRecommendation: "LegalService / Attorney / Review",
  },
  {
    id: "local_services",
    name: "Local Services & Home Trades",
    category: "Trades",
    sampleDomain: "rotorooter.com",
    sampleAudience: "Homeowners, landlords, and commercial facility managers",
    icon: Wrench,
    defaultPages: ["/", "/plumbing-services", "/emergency-repair", "/service-areas", "/pricing-estimates", "/reviews", "/book-now"],
    keyIntent: "High-urgency emergency & near-me search terms",
    schemaRecommendation: "HomeAndConstructionBusiness / LocalBusiness",
  },
  {
    id: "travel",
    name: "Travel, Hospitality & Hotels",
    category: "Hospitality",
    sampleDomain: "airbnb.com",
    sampleAudience: "Vacationers, business travelers, and adventure seekers",
    icon: Plane,
    defaultPages: ["/", "/destinations", "/luxury-stays", "/experiences", "/special-offers", "/reviews", "/reservations"],
    keyIntent: "Destination booking & seasonal vacation queries",
    schemaRecommendation: "Hotel / LodgingBusiness / TouristAttraction",
  },
  {
    id: "fintech",
    name: "Fintech, Banking & Wealth",
    category: "Finance",
    sampleDomain: "robinhood.com",
    sampleAudience: "Investors, high-net-worth individuals, and banking customers",
    icon: Coins,
    defaultPages: ["/", "/investing", "/crypto", "/retirement-accounts", "/pricing-fees", "/security-insurance", "/learn"],
    keyIntent: "Financial returns, fee comparisons & trust signals",
    schemaRecommendation: "FinancialProduct / BankOrCreditUnion",
  },
  {
    id: "edtech",
    name: "EdTech & Online Courses",
    category: "Education",
    sampleDomain: "coursera.org",
    sampleAudience: "Students, career-switchers, and corporate upskilling teams",
    icon: GraduationCap,
    defaultPages: ["/", "/courses", "/degrees", "/certificates", "/pricing-financial-aid", "/for-enterprise", "/student-reviews"],
    keyIntent: "Course syllabus searches & skill accreditation",
    schemaRecommendation: "Course / EducationalOrganization",
  },
  {
    id: "agency",
    name: "Digital Agencies & Creative Studios",
    category: "Marketing",
    sampleDomain: "hugeinc.com",
    sampleAudience: "Brand marketing directors, CMOs, and enterprise leaders",
    icon: Palette,
    defaultPages: ["/", "/services/seo", "/case-studies", "/our-work", "/about-team", "/client-testimonials", "/request-proposal"],
    keyIntent: "Agency RFP proposals & marketing services",
    schemaRecommendation: "ProfessionalService / Organization",
  },
  {
    id: "media",
    name: "Media, News & Publishing",
    category: "Publishing",
    sampleDomain: "techcrunch.com",
    sampleAudience: "Industry readers, tech enthusiasts, and newsletter subscribers",
    icon: Newspaper,
    defaultPages: ["/", "/news/latest", "/category/startups", "/podcasts", "/events", "/newsletter", "/advertise"],
    keyIntent: "Breaking news topics, trending events & editorial",
    schemaRecommendation: "NewsArticle / Periodical / WebSite",
  },
  {
    id: "fitness",
    name: "Fitness, Gyms & Wellness",
    category: "Wellness",
    sampleDomain: "equinox.com",
    sampleAudience: "Fitness enthusiasts, gym members, and personal training clients",
    icon: Dumbbell,
    defaultPages: ["/", "/membership-plans", "/classes-schedule", "/personal-training", "/locations-clubs", "/virtual-workouts", "/free-trial"],
    keyIntent: "Local gym memberships & fitness classes near me",
    schemaRecommendation: "ExerciseGym / SportsClub",
  },
  {
    id: "restaurant",
    name: "Restaurants & Food Hospitality",
    category: "Food",
    sampleDomain: "sweetgreen.com",
    sampleAudience: "Diners, foodies, and online ordering customers",
    icon: Utensils,
    defaultPages: ["/", "/menu", "/order-online", "/catering", "/locations-hours", "/nutrition-allergens", "/rewards"],
    keyIntent: "Menu items, dietary options & order online queries",
    schemaRecommendation: "Restaurant / FoodEstablishment / Menu",
  },
  {
    id: "automotive",
    name: "Automotive & Dealerships",
    category: "Automotive",
    sampleDomain: "carvana.com",
    sampleAudience: "Car buyers, vehicle sellers, and auto service seekers",
    icon: Car,
    defaultPages: ["/", "/inventory/used-cars", "/sell-trade-in", "/financing-calculator", "/service-repair", "/reviews", "/contact"],
    keyIntent: "Vehicle make/model pricing & trade-in valuations",
    schemaRecommendation: "AutoDealer / AutoRepair",
  },
  {
    id: "nonprofit",
    name: "Non-Profit & Charitable NGOs",
    category: "Philanthropy",
    sampleDomain: "charitywater.org",
    sampleAudience: "Donors, grant foundations, volunteers, and supporters",
    icon: HeartHandshake,
    defaultPages: ["/", "/our-mission", "/projects-impact", "/ways-to-give", "/annual-reports", "/volunteer", "/contact"],
    keyIntent: "Charitable donation tax deductions & impact stories",
    schemaRecommendation: "NGO / DonateAction",
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Industrial B2B",
    category: "Manufacturing",
    sampleDomain: "fastenal.com",
    sampleAudience: "Procurement managers, engineers, and supply chain directors",
    icon: Factory,
    defaultPages: ["/", "/product-catalog", "/custom-manufacturing", "/request-quote-rfq", "/certifications-iso", "/case-studies", "/contact"],
    keyIntent: "B2B wholesale pricing, RFQs & technical specs",
    schemaRecommendation: "GeneralContractor / Organization",
  },
  {
    id: "astrology",
    name: "Astrology, Horoscopes & Zodiac",
    category: "Spirituality & Wellness",
    sampleDomain: "astrology.com",
    sampleAudience: "Astrology enthusiasts, daily horoscope readers, natal chart seekers, and spiritual consultation clients",
    icon: Moon,
    defaultPages: ["/", "/daily-horoscope", "/birth-chart-calculator", "/zodiac-signs/compatibility", "/tarot-readings", "/astrologer-consultations", "/blog/lunar-cycles", "/contact"],
    keyIntent: "High-volume daily horoscopes, natal chart calculations, zodiac love compatibility & tarot readings",
    schemaRecommendation: "Service / WebSite / FAQPage / Person",
  },
];

const TARGET_COUNTRIES = [
  { code: "US", name: "United States (Global English)" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany / Europe" },
  { code: "IN", name: "India / APAC" },
  { code: "GLOBAL", name: "Worldwide (Global Audience)" },
];

export function DomainInputForm({ onAnalyze, isLoading, activeDomain }: DomainInputFormProps) {
  const [domainInput, setDomainInput] = useState(activeDomain || "stripe.com");
  const [selectedIndustryId, setSelectedIndustryId] = useState("saas");
  const [niche, setNiche] = useState("SaaS & Cloud Software");
  const [targetAudience, setTargetAudience] = useState("Tech founders, engineers, and digital businesses");
  const [country, setCountry] = useState("US");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [pastedFeedback, setPastedFeedback] = useState(false);

  const cleanAndSetDomain = (raw: string) => {
    let text = raw.trim();
    if (!text) {
      setDomainInput("");
      return;
    }
    // Automatically extract hostname if full URL is pasted
    if (text.startsWith("http://") || text.startsWith("https://")) {
      try {
        const url = new URL(text);
        text = url.hostname;
      } catch {
        text = text.replace(/^https?:\/\//i, "");
      }
    }
    text = text.replace(/^www\./i, "");
    // If it has trailing paths, clean them but keep domain
    if (text.includes("/")) {
      text = text.split("/")[0];
    }
    setDomainInput(text.toLowerCase());
  };

  const handlePasteDomain = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          cleanAndSetDomain(text);
          setPastedFeedback(true);
          setTimeout(() => setPastedFeedback(false), 2000);
        }
      }
    } catch (err) {
      console.warn("Clipboard access not granted or unavailable", err);
    }
  };

  // Cycle animated progress steps during load
  React.useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Sync if parent updates domain
  React.useEffect(() => {
    if (activeDomain && activeDomain !== domainInput) {
      setDomainInput(activeDomain);
    }
  }, [activeDomain]);

  const handleSelectIndustry = (ind: IndustryDefinition) => {
    setSelectedIndustryId(ind.id);
    setNiche(ind.name);
    setTargetAudience(ind.sampleAudience);
  };

  const handleApplySampleDomain = (ind: IndustryDefinition) => {
    handleSelectIndustry(ind);
    setDomainInput(ind.sampleDomain);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim() || isLoading) return;
    onAnalyze(domainInput, niche, targetAudience, country);
  };

  const loadingMessages = [
    "Connecting & crawling domain architecture across all pages...",
    "Extracting industry-tailored search intent, KD scores & keyword volume...",
    "Engineering high-CTR Meta Titles & Meta Descriptions for each page...",
    "Generating OpenGraph Feature Image (1200x630) design specs...",
    "Compiling production code snippets for Next.js, WordPress, Vite & Astro...",
  ];

  const currentIndustry = ALL_INDUSTRIES.find((i) => i.id === selectedIndustryId) || ALL_INDUSTRIES[0];

  return (
    <div className="w-full rounded-2xl bg-white border border-slate-200/90 shadow-sm p-5 sm:p-7 relative overflow-hidden space-y-6">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-5">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Universal SEO & Keyword Engine for Every Industry & Page
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analyze Any Domain Across Every Industry
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1.5 max-w-2xl mx-auto">
            Generate customized keywords, meta tags, and structured schemas tailored for <strong>every existing page</strong> in any business vertical.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-inner focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <div className="relative flex-1 flex items-center pl-3 pr-2">
              <Globe className="h-5 w-5 text-slate-400 shrink-0 mr-2.5" />
              <input
                id="input-domain-name"
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onPaste={(e) => {
                  const pastedText = e.clipboardData?.getData("text");
                  if (pastedText) {
                    e.preventDefault();
                    cleanAndSetDomain(pastedText);
                    setPastedFeedback(true);
                    setTimeout(() => setPastedFeedback(false), 2000);
                  }
                }}
                placeholder="Enter domain or paste URL (e.g. stripe.com, https://allbirds.com, clinic.org)"
                disabled={isLoading}
                className="w-full bg-transparent text-slate-900 font-medium placeholder:text-slate-400 focus:outline-hidden text-sm sm:text-base py-2"
                required
              />

              {/* Quick Paste Button */}
              <button
                type="button"
                onClick={handlePasteDomain}
                disabled={isLoading}
                title="Paste from clipboard"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 transition-colors shrink-0 ml-1.5"
              >
                {pastedFeedback ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Pasted!</span>
                  </>
                ) : (
                  <>
                    <ClipboardPaste className="h-3.5 w-3.5" />
                    <span>Paste</span>
                  </>
                )}
              </button>

              {domainInput && (
                <button
                  type="button"
                  onClick={() => setDomainInput("")}
                  disabled={isLoading}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 ml-1"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              id="btn-run-seo-analysis"
              type="submit"
              disabled={isLoading || !domainInput.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-all focus:outline-hidden"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Auditing Domain...</span>
                </>
              ) : (
                <>
                  <span>Audit Domain & Pages</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Industry Vertical Selector Bar */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                Select Industry Vertical ({ALL_INDUSTRIES.length} Supported Verticals):
              </span>
              <span className="text-[11px] text-blue-600 font-semibold hidden sm:inline">
                Click any industry to customize SEO rules
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {ALL_INDUSTRIES.map((ind) => {
                const Icon = ind.icon;
                const isSelected = selectedIndustryId === ind.id;
                return (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => handleSelectIndustry(ind)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{ind.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Industry Intel Card */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                {React.createElement(currentIndustry.icon, { className: "h-5 w-5" })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{currentIndustry.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-100/70 text-blue-800">
                    {currentIndustry.schemaRecommendation}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Core Pages Mapped: {currentIndustry.defaultPages.join(", ")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleApplySampleDomain(currentIndustry)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-semibold text-xs transition-all shrink-0"
            >
              <span>Test with {currentIndustry.sampleDomain}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Advanced Parameters Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>{showAdvanced ? "Hide" : "Customize"} Target Market & Audience Parameters</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specific Niche / Sub-category
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-hidden focus:border-blue-500"
                    placeholder="e.g. B2B Telehealth or Luxury Real Estate"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Customer Persona
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-hidden focus:border-blue-500"
                    placeholder="e.g. Small business owners & CTOs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Search Region
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    {TARGET_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Loading Progress State Indicator */}
        {isLoading && (
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-center space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-center gap-2 text-blue-800 text-xs font-bold">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span>Step {loadingStep + 1} of 5: {loadingMessages[loadingStep]}</span>
            </div>
            <div className="w-full max-w-md mx-auto bg-blue-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((loadingStep + 1) / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
