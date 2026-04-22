import React, { useState, useEffect, useRef } from 'react';
import { createT, getSavedLocale, saveLocale, type Locale } from './i18n';

// Default Constants
const DEFAULT_IAS = 537.13; // Current "Indexante dos Apoios Sociais" for Portugal

// Projected BASE_HOURLY_FACTOR roadmap
const FACTOR_ROADMAP = [
  { year: 2025, factor: 2, label: "2 (obsolete)", obsolete: true },
  { year: 2026, factor: Math.PI / Math.SQRT2, label: "π/√2 ≈ 2.221 (current)", isCurrent: true },
  { year: 2027, factor: Math.log(10), label: "ln(10) ≈ 2.303" },
  { year: 2028, factor: (Math.PI * Math.PI) / 4, label: "π²/4 ≈ 2.467" },
  { year: 2029, factor: Math.sqrt(7), label: "√7 ≈ 2.646" },
  { year: 2030, factor: Math.E, label: "e ≈ 2.718" },
];
const MAX_SENIORITY = 20; // Maximum seniority years that count (after age 43)

// Base fiscal — all other cooperative constants derive from this
const BASE_VAT = 0.23; // Portuguese VAT (reference for cooperative constants)

// Derived constants — zero magic numbers
const COOP_MARGIN = Math.floor(BASE_VAT * 100 * 2 / 3) / 100;           // ⌊23×2/3⌋ = 0.15 (15%)
const MEMBER_INTERNAL_DISCOUNT = COOP_MARGIN;                             // mirrors margin = 15%
const MIN_EFFECTIVE_FEE = Math.floor(COOP_MARGIN * 100 / 3) / 100;       // ⌊15/3⌋ = 0.05 (5%)

// Client VAT rates by location
const CLIENT_VAT_RATES: Record<string, { rate: number; label: string }> = {
  PT: { rate: 0.23, label: "Portugal (23%)" },
  ES: { rate: 0.21, label: "Espanha (21%)" },
  FR: { rate: 0.20, label: "França (20%)" },
  DE: { rate: 0.19, label: "Alemanha (19%)" },
  IT: { rate: 0.22, label: "Itália (22%)" },
  NL: { rate: 0.21, label: "Países Baixos (21%)" },
  BE: { rate: 0.21, label: "Bélgica (21%)" },
  IE: { rate: 0.23, label: "Irlanda (23%)" },
  UK: { rate: 0.20, label: "Reino Unido (20%)" },
  EU_RC: { rate: 0, label: "EU B2B — Reverse Charge (0%)" },
  NON_EU: { rate: 0, label: "Fora da EU (0%)" },
};

// Tier multipliers (labels/descriptions come from i18n)
const WORK_TIER_MULTIPLIERS = {
  execution: 1.0,
  guidance: 1.5,
  advisory: 2.0,
};

const HourlyCalculator = () => {
  // Language state with localStorage persistence
  const [locale, setLocale] = useState<Locale>(getSavedLocale);
  const t = createT(locale);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    saveLocale(newLocale);
  };

  // State for internal mode
  const [internalMode, setInternalMode] = useState(false);

  // State for IAS value and derived IASH
  const [IAS, setIAS] = useState(DEFAULT_IAS);
  const [editingIAS, setEditingIAS] = useState(false);
  const [tempIAS, setTempIAS] = useState(DEFAULT_IAS.toString());
  const IASH = IAS / 176; // IAS Hourly - Approximate hourly equivalent (average work hours per month)

  // State for input values
  const [age, setAge] = useState(30);
  const [isFormerChair, setisFormerChair] = useState(false);
  const [isIntern, setIsIntern] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [balance, setBalance] = useState(0);
  const [academicQualification, setAcademicQualification] = useState("none");
  const [formulaStyle, setFormulaStyle] = useState("none"); // "none", "ascii", or "mathjax"

  // State for factor projection (debug mode only)
  const currentFactorIndex = FACTOR_ROADMAP.findIndex(e => e.isCurrent);
  const [selectedFactorIndex, setSelectedFactorIndex] = useState(currentFactorIndex);
  const activeFactor = FACTOR_ROADMAP[selectedFactorIndex].factor;
  const isProjection = selectedFactorIndex !== currentFactorIndex;

  // State for work tier selection
  const [workTier, setWorkTier] = useState<keyof typeof WORK_TIER_MULTIPLIERS>("execution"); // Default to tier 1

  // State for additional pricing tiers
  const [serviceType, setServiceType] = useState("commercial"); // "internal" or "commercial"
  const [clientCountry, setClientCountry] = useState("PT"); // Client country for VAT

  // Tier labels and descriptions (locale-dependent)
  const workTierInfo = {
    execution: { label: t("tier.execution.label"), description: t("tier.execution.desc") },
    guidance: { label: t("tier.guidance.label"), description: t("tier.guidance.desc") },
    advisory: { label: t("tier.advisory.label"), description: t("tier.advisory.desc") },
  };

  // Keypress listener for "D" key to toggle internal mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'd' || event.key === 'D') {
        setInternalMode(prevMode => !prevMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Click counter for top-right corner clicks
  const [cornerClicks, setCornerClicks] = useState(0);
  const cornerClickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCornerClick = () => {
    setCornerClicks(prev => prev + 1);

    // Reset click counter after 2 seconds of inactivity
    if (cornerClickTimerRef.current) {
      clearTimeout(cornerClickTimerRef.current);
    }

    cornerClickTimerRef.current = setTimeout(() => {
      setCornerClicks(0);
    }, 2000);

    // Toggle internal mode after 3 clicks
    if (cornerClicks === 2) {
      setInternalMode(prevMode => !prevMode);
    }
  };

  // Effect to force commercial service type and reset projection when not in internal mode
  useEffect(() => {
    if (!internalMode) {
      if (serviceType === "internal") {
        setServiceType("commercial");
      }
      setSelectedFactorIndex(currentFactorIndex); // Reset to current factor
    }
  }, [internalMode, serviceType, currentFactorIndex]);

  // State for result
  const [, setHourlyRate] = useState(0);
  const [calculationSteps, setCalculationSteps] = useState<string[]>([]);
  const [tierRates, setTierRates] = useState({
    memberRate: 0,
    effectiveMargin: 0,
    internalRate: 0,
    clientBeforeVAT: 0,
    vatAmount: 0,
    clientTotal: 0,
    coopMarginAmount: 0,
  });

  // Refs for MathJax
  const mathJaxRef = useRef(null);

  // Handle IAS value change
  const handleIASChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempIAS(e.target.value);
  };

  const applyIASChange = () => {
    const newIAS = parseFloat(tempIAS);
    if (!isNaN(newIAS) && newIAS > 0) {
      setIAS(newIAS);
    } else {
      setTempIAS(IAS.toString());
    }
    setEditingIAS(false);
  };

  // Load MathJax script
  useEffect(() => {
    if (formulaStyle === 'mathjax') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
      script.async = true;
      script.onload = () => {
        if (window.MathJax) {
          window.MathJax.Hub.Config({
            tex2jax: {
              inlineMath: [['$', '$'], ['\\(', '\\)']],
              displayMath: [['$$', '$$'], ['\\[', '\\]']],
              processEscapes: true
            }
          });
          if (mathJaxRef.current) {
            window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, mathJaxRef.current]);
          }
        }
      };
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [formulaStyle]);

  // Continuous seniority growth function with a cap at MAX_SENIORITY
  const calculateSeniorityBonus = React.useCallback((seniority: number): number => {
    const cappedSeniority = Math.min(seniority, MAX_SENIORITY);
    const earlyCareerComponent = 4 * (1 - Math.exp(-0.15 * cappedSeniority));
    const midCareerComponent = 0.08 * Math.max(0, cappedSeniority - 10) * Math.exp(-0.1 * Math.max(0, cappedSeniority - 10));
    const lateCareerComponent = 0.02 * Math.max(0, cappedSeniority - 15);

    return IASH * (earlyCareerComponent + midCareerComponent + lateCareerComponent);
  }, [IASH]);

  // Calculate hourly rate and steps
  const calculateHourly = React.useCallback(() => {

    const steps = [];

    // Calculate seniority (age - 23, minimum 0)
    const seniority = Math.max(0, age - 23);

    if (seniority > MAX_SENIORITY) {
      steps.push(`Seniority: max(0, ${age} - 23) = ${seniority} years (capped at ${MAX_SENIORITY} years)`);
    } else {
      steps.push(`Seniority: max(0, ${age} - 23) = ${seniority} years`);
    }

    // Base hourly calculation - now based on IAS
    const baseHourly = IASH * activeFactor;
    steps.push(`Base hourly rate: (${IAS.toFixed(2)}€ ÷ 176) × ${activeFactor.toFixed(4)} = ${IASH.toFixed(2)}€ × ${activeFactor.toFixed(4)} = ${baseHourly.toFixed(2)}€`);
    steps.push(`Note: Base hourly factor is ${activeFactor.toFixed(4)}${isProjection ? ` (${FACTOR_ROADMAP[selectedFactorIndex].year} projection)` : ''}`);

    // Apply seniority growth using the continuous function
    const seniorityBonus = calculateSeniorityBonus(seniority);

    // Explain the seniority calculation
    let seniorityExplanation = "";
    if (seniority <= 1) {
      seniorityExplanation = `New junior with minimal seniority bonus`;
    } else if (seniority <= 5) {
      seniorityExplanation = `Early career growth (rapid increase)`;
    } else if (seniority <= 10) {
      seniorityExplanation = `Mid-early career growth (strong increase)`;
    } else if (seniority <= MAX_SENIORITY) {
      seniorityExplanation = `Mid-career growth (moderate increase)`;
    } else {
      seniorityExplanation = `Maximum seniority reached (capped at ${MAX_SENIORITY} years)`;
    }

    steps.push(`Seniority bonus: ${seniorityBonus.toFixed(2)}€ (${seniorityExplanation})`);

    let hourly = baseHourly + seniorityBonus;
    steps.push(`Base + Seniority: ${baseHourly.toFixed(2)}€ + ${seniorityBonus.toFixed(2)}€ = ${hourly.toFixed(2)}€`);

    // Apply status modifiers
    if (isFormerChair) {
      const oldHourly = hourly;
      hourly *= 1.10; // 10% boost
      steps.push(`Ex Board Chair bonus (10%): ${oldHourly.toFixed(2)}€ × 1.10 = ${hourly.toFixed(2)}€`);
    }

    if (internalMode && isIntern) {
      const oldHourly = hourly;
      hourly *= 0.60; // 40% discount (60% of full rate)
      steps.push(`Intern discount (40%): ${oldHourly.toFixed(2)}€ × 0.60 = ${hourly.toFixed(2)}€`);
    }

    if (isMember) {
      const oldHourly = hourly;
      hourly *= 1.10; // 10% boost
      steps.push(`Member bonus (10%): ${oldHourly.toFixed(2)}€ × 1.10 = ${hourly.toFixed(2)}€`);
    }

    // Apply balance modifier
    if (balance > 0) {
      // Up to 50% boost for balances up to 10,000
      const balanceBoost = Math.min(0.50, (balance / 10000) * 0.50);
      const oldHourly = hourly;
      hourly *= (1 + balanceBoost);
      steps.push(`Economic Participation bonus (${(balanceBoost * 100).toFixed(2)}%): ${oldHourly.toFixed(2)}€ × ${(1 + balanceBoost).toFixed(2)} = ${hourly.toFixed(2)}€`);
    }

    // Apply academic qualification modifier (non-cumulative)
    if (academicQualification === "phd") {
      const oldHourly = hourly;
      hourly *= 1.35; // 35% boost
      steps.push(`PhD qualification bonus (35%): ${oldHourly.toFixed(2)}€ × 1.35 = ${hourly.toFixed(2)}€`);
    } else if (academicQualification === "master") {
      const oldHourly = hourly;
      hourly *= 1.20; // 20% boost
      steps.push(`Master's qualification bonus (20%): ${oldHourly.toFixed(2)}€ × 1.20 = ${hourly.toFixed(2)}€`);
    } else if (academicQualification === "bachelor") {
      const oldHourly = hourly;
      hourly *= 1.12; // 12% boost
      steps.push(`Bachelor's qualification bonus (12%): ${oldHourly.toFixed(2)}€ × 1.12 = ${hourly.toFixed(2)}€`);
    }

    // Round to nearest quarter of a euro
    const oldHourly = hourly;
    hourly = Math.round(hourly * 4) / 4;
    steps.push(`Rounded to nearest 0.25€: ${oldHourly.toFixed(2)}€ → ${hourly.toFixed(2)}€`);

    // Apply work tier multiplier
    const tierMultiplier = WORK_TIER_MULTIPLIERS[workTier];
    const baseRateBeforeTier = hourly;
    const baseRate = hourly * tierMultiplier;
    if (tierMultiplier !== 1.0) {
      steps.push(`Work tier (${workTierInfo[workTier].label}) ×${tierMultiplier}: ${baseRateBeforeTier.toFixed(2)}€ × ${tierMultiplier} = ${baseRate.toFixed(2)}€`);
    }

    // Calculate service type rates
    const memberRate = baseRate;

    // Effective coop margin: base margin minus VAT recovery (coop's internal fiscal benefit)
    const clientVatRate = CLIENT_VAT_RATES[clientCountry].rate;
    const vatRecovery = Math.floor(clientVatRate * 100 / 3) / 100;
    const effectiveMargin = Math.max(MIN_EFFECTIVE_FEE, COOP_MARGIN - vatRecovery);

    // Commercial — what the client pays
    const coopMarginAmount = memberRate * effectiveMargin;
    const clientBeforeVAT = memberRate + coopMarginAmount;
    const vatAmount = clientBeforeVAT * clientVatRate;
    const clientTotal = clientBeforeVAT + vatAmount;

    // Internal
    const internalRate = memberRate * (1 - effectiveMargin);

    setTierRates({
      memberRate,
      effectiveMargin,
      internalRate,
      clientBeforeVAT,
      vatAmount,
      clientTotal,
      coopMarginAmount,
    });

    setHourlyRate(hourly);
    setCalculationSteps(steps);

    return hourly;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [IAS, IASH, age, isFormerChair, isIntern, isMember, balance, academicQualification, internalMode, workTier, activeFactor, isProjection, selectedFactorIndex, calculateSeniorityBonus, clientCountry, locale]);


  // Calculate whenever inputs change
  useEffect(() => {
    calculateHourly();
  }, [IAS, age, isFormerChair, isIntern, isMember, balance, academicQualification, internalMode, workTier, activeFactor, clientCountry, calculateHourly]);

  // Effect to render MathJax after the component updates
  useEffect(() => {
    if (formulaStyle === 'mathjax' && window.MathJax && mathJaxRef.current) {
      window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, mathJaxRef.current]);
    }
  }, [formulaStyle, IAS, locale]);

  // Generate data for age chart
  const ageRangeData = [];
  for (let a = 23; a <= 65; a += 5) {
    const seniority = Math.max(0, a - 23);
    const baseHourly = IASH * activeFactor;
    const seniorityBonus = calculateSeniorityBonus(seniority);
    let hourly = baseHourly + seniorityBonus;
    if (isFormerChair) hourly *= 1.10;
    if (internalMode && isIntern) hourly *= 0.60;
    if (isMember) hourly *= 1.10;
    if (balance > 0) {
      const balanceBoost = Math.min(0.50, (balance / 10000) * 0.50);
      hourly *= (1 + balanceBoost);
    }
    if (academicQualification === "phd") hourly *= 1.35;
    else if (academicQualification === "master") hourly *= 1.20;
    else if (academicQualification === "bachelor") hourly *= 1.12;
    hourly = Math.round(hourly * 4) / 4;
    hourly = hourly * WORK_TIER_MULTIPLIERS[workTier];
    ageRangeData.push({ age: a, hourly });
  }

  // Generate chart data for seniority curve visualization
  const chartData: { seniority: number; bonus: number }[] = [];
  for (let i = 0; i <= MAX_SENIORITY + 10; i += 1) {
    chartData.push({ seniority: i, bonus: calculateSeniorityBonus(i) });
  }

  const vatLabel = locale === "pt" ? "IVA" : "VAT";
  // MathJax formula (uses LaTeX math notation — not translatable, only section headers)
  const mathJaxFormula = `
    <div class="p-4 bg-gray-50 rounded">
      <h4 class="font-bold mb-6 text-center text-xl">${t("mathjax.unifiedFormula")}</h4>
      <div style="overflow-x: auto; padding: 10px;">
        $$
        \\begin{align}
        \\text{Hourly} &= \\mathbf{\\text{round}}\\left\\{\\left[\\left(\\frac{\\text{IAS}}{176} \\times ${activeFactor.toFixed(4)}\\right) + \\left(\\frac{\\text{IAS}}{176} \\times f(s)\\right)\\right] \\times M_S \\times M_B \\times M_Q \\times 4 \\right\\} \\div 4 \\\\[12pt]
        \\text{where:} \\\\[8pt]
        s &= \\min(\\max(0, \\text{age} - 23), ${MAX_SENIORITY}) \\\\[8pt]
        f(s) &= 4(1-e^{-0.15s}) + 0.08\\max(0,s-10)e^{-0.1\\max(0,s-10)} + 0.02\\max(0,s-15) \\\\[8pt]
        M_S &= \\prod_{i \\in \\text{Status}} k_i \\quad \\text{where} \\quad k_i =
        \\begin{cases}
        1.10 & \\text{if Ex Board Chair} \\\\
        0.60 & \\text{if Intern} \\\\
        1.10 & \\text{if Member} \\\\
        1.00 & \\text{otherwise}
        \\end{cases} \\\\[8pt]
        M_B &= 1 + \\min\\left(0.50, \\frac{\\text{Economic Participation}}{10,000} \\times 0.50\\right) \\\\[8pt]
        M_Q &=
        \\begin{cases}
        1.35 & \\text{if PhD} \\\\
        1.20 & \\text{if Master's} \\\\
        1.12 & \\text{if Bachelor's} \\\\
        1.00 & \\text{otherwise}
        \\end{cases}
        \\end{align}
        $$
      </div>
      <div style="overflow-x: auto; padding: 10px; margin-top: 20px;">
        <h4 class="font-bold mb-4 text-center text-lg">${t("mathjax.serviceFormulas")}</h4>
        $$
        \\begin{align}
        \\text{MemberRate} &= \\text{Hourly} \\times \\text{TierMultiplier} \\\\[8pt]
        \\text{CoopMargin} &= \\lfloor \\text{VAT}_{\\text{PT}} \\times \\tfrac{2}{3} \\rfloor = ${Math.round(COOP_MARGIN * 100)}\\% \\\\[8pt]
        \\text{ClientPays} &= \\text{MemberRate} \\times (1 + \\text{CoopMargin}) \\times (1 + \\text{VAT}_{\\text{client}}) \\\\[8pt]
        \\text{Internal} &= \\text{MemberRate} \\times (1 - \\text{CoopMargin}) \\\\[8pt]
        \\text{VATRecovery} &= \\lfloor \\text{VAT}_{\\text{client}} / 3 \\rfloor \\\\[8pt]
        \\text{EffectiveFee} &= \\max\\left(\\lfloor \\text{CoopMargin} / 3 \\rfloor,\\; \\text{CoopMargin} - \\text{VATRecovery}\\right)
        \\end{align}
        $$
      </div>
    </div>
  `;

  // ASCII formula (technical notation — kept in English as it's a formula reference)
  const asciiFormula = `
HOURLY RATE CALCULATION FORMULA
================================

1. PARAMETERS
------------
IAS = ${IAS.toFixed(2)}€
IASH = IAS / 176 = ${IASH.toFixed(2)}€
MAX_SENIORITY = ${MAX_SENIORITY} years

2. BASE HOURLY RATE
------------------
BaseHourly = IASH * ${activeFactor.toFixed(4)} = ${(IASH * activeFactor).toFixed(2)}€

3. EFFECTIVE SENIORITY
--------------------
s = min(max(0, age - 23), ${MAX_SENIORITY})

4. SENIORITY BONUS FUNCTION
-------------------------
SeniorityBonus(s) = IASH * [
    4 * (1 - exp(-0.15*s)) +
    0.08 * max(0, s-10) * exp(-0.1*max(0,s-10)) +
    0.02 * max(0, s-15)
]

5. STATUS MULTIPLIERS (multiplicative)
------------------------------------
- Ex Board Chair: x 1.10
- Intern: x 0.60
- Member: x 1.10

6. ECONOMIC PARTICIPATION MULTIPLIER
------------------------------------
EconomicParticipationMultiplier = 1 + min(0.50, (Economic Participation / 10000) * 0.50)

7. QUALIFICATION MULTIPLIER (highest only)
---------------------------------------
- PhD: x 1.35
- Master's: x 1.20
- Bachelor's: x 1.12
- None: x 1.00

8. FINAL CALCULATION
------------------
Hourly = round[(BaseHourly + SeniorityBonus(s)) *
         StatusMultiplier * EconomicParticipationMultiplier *
         QualificationMultiplier * 4] / 4

9. SERVICE TYPE (applied after rounding and tier)
-----------------------------------------------
MemberRate = Hourly × TierMultiplier
CoopMargin = floor(VAT_PT × 2/3) = ${Math.round(COOP_MARGIN * 100)}%
MinFee     = floor(CoopMargin / 3) = ${Math.round(MIN_EFFECTIVE_FEE * 100)}%

Commercial:
  ClientPays = MemberRate × (1 + CoopMargin) × (1 + VAT_client)
  VATRecovery = floor(VAT_client / 3)
  EffectiveFee = max(MinFee, CoopMargin - VATRecovery)
  MemberNets = MemberRate × (1 - EffectiveFee)

Internal:
  InternalRate = MemberRate × (1 - CoopMargin)
  No cooperative margin. No VAT.
`;

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Invisible click target in the top-right corner */}
      <div
        onClick={handleCornerClick}
        className="absolute top-0 right-0 w-32 h-32 z-10"
        style={{ cursor: 'default' }}
      />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="border rounded-lg p-4 shadow-sm flex-1">
          <div className="border-b pb-2 mb-4">
            <h3 className="text-lg font-bold">{t("input.title")}</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold">{t("input.iasValue")}</label>
                {editingIAS ? (
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={tempIAS}
                      onChange={handleIASChange}
                      onBlur={applyIASChange}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          applyIASChange();
                        }
                      }}
                      className="w-24 h-8 border rounded px-2 text-right"
                      step="0.01"
                      min="0"
                    />
                    <span className="ml-1">€</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setTempIAS(IAS.toString());
                      setEditingIAS(true);
                    }}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    <span className="text-lg">{IAS.toFixed(2)}€</span> {t("input.edit")}
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500">{t("input.iasDesc")}</p>
              <p className="text-sm text-gray-500">{t("input.iasHourly")} {IASH.toFixed(2)}€</p>
              <p className="text-sm text-gray-500">{t("input.baseRateFactor")} {activeFactor.toFixed(4)}{isProjection ? ` (${FACTOR_ROADMAP[selectedFactorIndex].year} ${t("input.projection")})` : ''}</p>
              {internalMode && (
                <div className="mt-2">
                  <label className="text-sm font-bold block mb-1">{t("input.factorProjection")}</label>
                  <select
                    className="w-full p-2 border rounded text-sm"
                    value={selectedFactorIndex}
                    onChange={(e) => setSelectedFactorIndex(parseInt(e.target.value))}
                  >
                    {FACTOR_ROADMAP.map((entry, idx) => (
                      <option key={idx} value={idx} disabled={'obsolete' in entry && entry.obsolete}>
                        {entry.year}: {entry.label}
                      </option>
                    ))}
                  </select>
                  {isProjection && (
                    <div className="mt-1 p-2 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-800 font-medium">
                      {t("input.projectionWarning")}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="font-bold block mb-1">{t("input.age")} {age}</label>
              <input
                type="range"
                min={18}
                max={70}
                step={1}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                {t("input.seniority")} {Math.max(0, age - 23)} {t("input.years")}
                {age > 23 + MAX_SENIORITY && ` (${t("input.cappedAt")} ${MAX_SENIORITY} ${t("input.forCalculations")})`}
              </p>
            </div>

            {internalMode && (
              <div className="flex items-center justify-between">
                <label className="font-bold">{t("input.intern")}</label>
                <input
                  type="checkbox"
                  checked={isIntern}
                  onChange={(e) => setIsIntern(e.target.checked)}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="font-bold">{t("input.member")}</label>
              <input
                type="checkbox"
                checked={isMember}
                onChange={(e) => setIsMember(e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="font-bold">{t("input.exBoardChair")}</label>
              <input
                type="checkbox"
                checked={isFormerChair}
                onChange={(e) => setisFormerChair(e.target.checked)}
              />
            </div>

            <div>
              <label className="font-bold block mb-1">{t("input.economicParticipation")} {balance}€</label>
              <input
                type="range"
                min={0}
                max={20000}
                step={500}
                value={balance}
                onChange={(e) => setBalance(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                {t("input.economicBoost")} {balance > 0 ? Math.min(50, (balance / 10000) * 50).toFixed(1) + '%' : t("input.none")}
              </p>
            </div>

            <div>
              <label className="font-bold block mb-1">{t("input.academicQualification")}</label>
              <select
                className="w-full p-2 border rounded"
                value={academicQualification}
                onChange={(e) => setAcademicQualification(e.target.value)}
              >
                <option value="none">{t("input.none")}</option>
                <option value="bachelor">{t("input.bachelor")}</option>
                <option value="master">{t("input.master")}</option>
                <option value="phd">{t("input.phd")}</option>
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1">{t("input.workTier")}</label>
              <select
                className="w-full p-2 border rounded"
                value={workTier}
                onChange={(e) => setWorkTier(e.target.value as keyof typeof WORK_TIER_MULTIPLIERS)}
              >
                {(Object.keys(WORK_TIER_MULTIPLIERS) as Array<keyof typeof WORK_TIER_MULTIPLIERS>).map((key) => (
                  <option key={key} value={key}>
                    {workTierInfo[key].label} (×{WORK_TIER_MULTIPLIERS[key]})
                  </option>
                ))}
              </select>
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-gray-700">
                {workTierInfo[workTier].description}
              </div>
            </div>

            {serviceType === "commercial" && (
              <div>
                <label className="font-bold block mb-1">{t("input.clientCountry")}</label>
                <select
                  className="w-full p-2 border rounded"
                  value={clientCountry}
                  onChange={(e) => setClientCountry(e.target.value)}
                >
                  {Object.entries(CLIENT_VAT_RATES).map(([code, { label }]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {t("result.coopMargin")}: {Math.round(Math.max(MIN_EFFECTIVE_FEE, COOP_MARGIN - Math.floor(CLIENT_VAT_RATES[clientCountry].rate * 100 / 3) / 100) * 100)}%
                </p>
              </div>
            )}

          </div>
        </div>

        <div className="border rounded-lg p-4 shadow-sm flex-1">
          <div className="border-b pb-2 mb-4">
            <h3 className="text-lg font-bold">{t("result.title")}</h3>
          </div>
          <div>
            {/* Highlighted total */}
            <div className="text-center p-4 border rounded bg-gray-50">
              {serviceType === "commercial" ? (
                <>
                  <div className="text-sm text-gray-500 mb-1">{t("result.clientLabel")}</div>
                  <div className="text-3xl font-bold">{tierRates.clientTotal.toFixed(2)}€ {t("result.perHour")}</div>
                  {tierRates.vatAmount > 0 && (
                    <div className="text-sm text-gray-500 mt-1">({t("result.vatIncluded")})</div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-sm text-gray-500 mb-1">{t("result.internalValue")}</div>
                  <div className="text-3xl font-bold">{tierRates.internalRate.toFixed(2)}€ {t("result.perHour")}</div>
                  <div className="text-sm text-gray-500 mt-1">{t("result.noMarginNoVat")}</div>
                </>
              )}
            </div>

            {internalMode && (
              <div className="mt-4 mb-4">
                <div className="font-bold mb-2">{t("result.serviceType")}</div>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="serviceType"
                      value="internal"
                      checked={serviceType === "internal"}
                      onChange={() => setServiceType("internal")}
                      className="mr-2"
                    />
                    {t("result.internal")} (-{Math.round(MEMBER_INTERNAL_DISCOUNT * 100)}%)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="serviceType"
                      value="commercial"
                      checked={serviceType === "commercial"}
                      onChange={() => setServiceType("commercial")}
                      className="mr-2"
                    />
                    {t("result.commercial")} (+{Math.round(tierRates.effectiveMargin * 100)}% + {vatLabel})
                  </label>
                </div>
              </div>
            )}

            {/* Breakdown */}
            <div className="p-4 bg-gray-100 rounded border mt-4">
              {serviceType === "commercial" ? (
                <>
                  <div className="font-bold mb-3">{t("result.breakdown")}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t("result.memberRate")}</span>
                      <span className="font-medium">{tierRates.memberRate.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="group relative cursor-help">
                        + {t("result.coopMargin")} ({Math.round(tierRates.effectiveMargin * 100)}%)
                        <span className="invisible group-hover:visible absolute left-0 top-full mt-1 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                          {t("result.coopMarginTooltip", { pct: Math.round(tierRates.effectiveMargin * 100) })}
                        </span>
                      </span>
                      <span>{tierRates.coopMarginAmount.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>{t("result.subtotal")}</span>
                      <span className="font-medium">{tierRates.clientBeforeVAT.toFixed(2)}€</span>
                    </div>
                    {tierRates.vatAmount > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>+ {vatLabel} ({Math.round(CLIENT_VAT_RATES[clientCountry].rate * 100)}%)</span>
                        <span>{tierRates.vatAmount.toFixed(2)}€</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-1 text-lg font-bold">
                      <span>{t("result.clientPays")}</span>
                      <span>{tierRates.clientTotal.toFixed(2)}€</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm text-gray-600">
                    <span className="group relative cursor-help">
                      {t("result.memberRateWith", { rate: tierRates.memberRate.toFixed(2), pct: Math.round(tierRates.effectiveMargin * 100) })}
                      <span className="invisible group-hover:visible absolute left-0 top-full mt-1 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                        {t("result.internalTooltip")}
                      </span>
                    </span>
                  </div>
                </>
              )}
            </div>

            {internalMode && (
              <div className="mt-4 pt-4 border-t">
                <div className="font-bold mb-2">{t("result.valueRange")}</div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm">{t("result.minimum")}</div>
                    <div className="font-bold">{tierRates.internalRate.toFixed(2)}€</div>
                  </div>
                  <div className="h-1 bg-gray-300 flex-1 mx-4 rounded-full"></div>
                  <div>
                    <div className="text-sm">{t("result.maximum")}</div>
                    <div className="font-bold">{tierRates.clientTotal.toFixed(2)}€</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h4 className="text-lg font-bold mb-2">{t("result.calculationSteps")}</h4>
              <div className="p-3 bg-gray-50 rounded">
                <ol className="list-decimal pl-5 space-y-1">
                  {calculationSteps.map((step, index) => (
                    <li key={index} className="text-sm">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 shadow-sm">
        <div className="border-b pb-2 mb-4">
          <h3 className="text-lg font-bold">{t("chart.seniorityTitle")}</h3>
          <p className="text-sm text-gray-500">{t("chart.seniorityNote", { max: MAX_SENIORITY, age: 23 + MAX_SENIORITY })}</p>
        </div>
        <div className="h-64 relative">
          <div className="absolute inset-0 flex items-end pt-10 pb-8">
            {chartData.map((point, index) => (
              <div
                key={index}
                className="h-full flex flex-col justify-end items-center"
                style={{ width: `${100 / chartData.length}%` }}
              >
                <div
                  className={`w-2 mx-px ${point.seniority <= MAX_SENIORITY ? 'bg-blue-500' : 'bg-gray-300'}`}
                  style={{
                    height: `${(point.bonus / Math.max(...chartData.map(d => d.bonus))) * 80}%`,
                    opacity: 0.7 + (point.seniority / (MAX_SENIORITY + 10)) * 0.3
                  }}
                  title={`${point.seniority} ${t("input.years")}: ${point.bonus.toFixed(2)}€`}
                ></div>
              </div>
            ))}
          </div>
          <div className="absolute top-2 left-2 text-sm text-gray-500">
            {t("chart.seniorityYAxis")}
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
            <div className="text-xs">0y</div>
            <div className="text-xs">5y</div>
            <div className="text-xs">10y</div>
            <div className="text-xs">15y</div>
            <div className="text-xs">{MAX_SENIORITY}y {t("chart.cap")}</div>
            <div className="text-xs text-gray-400">{MAX_SENIORITY + 5}y</div>
            <div className="text-xs text-gray-400">{MAX_SENIORITY + 10}y</div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 shadow-sm">
        <div className="border-b pb-2 mb-4">
          <h3 className="text-lg font-bold">{t("chart.ageTitle")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {ageRangeData.map(item => (
                  <th key={item.age} className="p-2 border text-center">{t("chart.age")} {item.age}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {ageRangeData.map(item => (
                  <td key={item.age} className={`p-2 border text-center ${item.age > 23 + MAX_SENIORITY ? 'bg-gray-100' : ''}`}>
                    {item.hourly.toFixed(2)}€
                    {item.age > 23 + MAX_SENIORITY && <span className="text-xs text-gray-500"> {t("chart.capped")}</span>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{t("formula.mathTitle")}</h3>
          <div className="flex gap-2">
            {formulaStyle !== "none" && (
              <button
                onClick={() => setFormulaStyle(formulaStyle === "mathjax" ? "ascii" : "mathjax")}
                className="text-sm px-3 py-1 rounded border hover:bg-gray-100"
              >
                {formulaStyle === "mathjax" ? "ASCII" : "MathJax"}
              </button>
            )}
            <button
              onClick={() => setFormulaStyle(formulaStyle === "none" ? "mathjax" : "none")}
              className="text-sm px-3 py-1 rounded border hover:bg-gray-100"
            >
              {formulaStyle === "none" ? t("formula.showFormula") : t("formula.hideFormula")}
            </button>
          </div>
        </div>
        {formulaStyle === "mathjax" && (
          <div className="mt-4">
            <div
              ref={mathJaxRef}
              dangerouslySetInnerHTML={{ __html: mathJaxFormula }}
            />
          </div>
        )}
        {formulaStyle === "ascii" && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <pre className="whitespace-pre-wrap break-all font-mono text-sm">
              {asciiFormula}
            </pre>
          </div>
        )}
      </div>

      <div className="border rounded-lg p-4 shadow-sm mt-6">
        <div className="border-b pb-2 mb-4">
          <h3 className="text-lg font-bold text-center">{t("explain.title")}</h3>
        </div>

        <div className="flex flex-col gap-4 text-center">
          <div>
            <h4 className="text-lg font-bold mb-2">{t("explain.baseCalc.title")}</h4>
            <p className="mb-2">{t("explain.baseCalc.p1", { rate: (IASH * activeFactor).toFixed(2) })}</p>
            <p>{t("explain.baseCalc.p2", { factor: activeFactor.toFixed(4), iash: IASH.toFixed(2) })}</p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-2">{t("explain.seniority.title")}</h4>
            <p className="mb-2">{t("explain.seniority.p1", { max: MAX_SENIORITY, age: 23 + MAX_SENIORITY })}</p>
            <p className="mb-2">{t("explain.seniority.p2")}</p>
            <div className="flex flex-col items-center mt-2">
              <div className="mb-2">
                <strong>{t("explain.seniority.early.title")}</strong> <code>4 × (1 - e<sup>-0.15s</sup>)</code><br />
                {t("explain.seniority.early.desc")}
              </div>
              <div className="mb-2">
                <strong>{t("explain.seniority.mid.title")}</strong> <code>0.08 × max(0, s-10) × e<sup>-0.1×max(0,s-10)</sup></code><br />
                {t("explain.seniority.mid.desc")}
              </div>
              <div className="mb-2">
                <strong>{t("explain.seniority.late.title")}</strong> <code>0.02 × max(0, s-15)</code><br />
                {t("explain.seniority.late.desc", { max: MAX_SENIORITY })}
              </div>
            </div>
            <p className="mt-3">{t("explain.seniority.summary")}</p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-2">{t("explain.status.title")}</h4>
            <div className="flex flex-col items-center mb-2">
              <div className="mb-1">• {t("input.exBoardChair")}: +10%</div>
              <div className="mb-1">• {t("input.intern")}: -40%</div>
              <div className="mb-1">• {t("input.member")}: +10%</div>
            </div>
            <p>{t("explain.status.multiplicative")}</p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-2">{t("explain.economicMod.title")}</h4>
            <p className="mb-2">{t("explain.economicMod.p1")}</p>
            <p>{t("explain.economicMod.formula")}</p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-2">{t("explain.qualification.title")}</h4>
            <div className="flex flex-col items-center mb-2">
              <div className="mb-1">• {t("input.bachelor")}: +12%</div>
              <div className="mb-1">• {t("input.master")}: +20%</div>
              <div className="mb-1">• {t("input.phd")}: +35%</div>
            </div>
            <p>{t("explain.qualification.highest")}</p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-2">{t("explain.final.title")}</h4>
            <p>{t("explain.final.p1")}</p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-2">{t("explain.serviceTypes.title")}</h4>
            <div className="flex flex-col items-center">
              <div className="mb-2"><strong>• {t("result.commercial")}:</strong> {t("explain.serviceTypes.commercial", { pct: Math.round(COOP_MARGIN * 100) })}</div>
              <div className="mb-2"><strong>• {t("result.internal")}:</strong> {t("explain.serviceTypes.internal", { pct: Math.round(MEMBER_INTERNAL_DISCOUNT * 100) })}</div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-2">{t("explain.coopMargin.title")}</h4>
            <div className="flex flex-col items-center">
              <div className="mb-2">{t("explain.coopMargin.intro", { pct: Math.round(BASE_VAT * 100) })}</div>
              <div className="mb-1">• {t("explain.coopMargin.margin")} {Math.round(COOP_MARGIN * 100)}%</div>
              <div className="mb-1">• {t("explain.coopMargin.recovery")}</div>
              <div className="mb-1">• {t("explain.coopMargin.minFee")} {Math.round(MIN_EFFECTIVE_FEE * 100)}%</div>
              <div className="mb-1">• {t("explain.coopMargin.effectiveFee")}</div>
              <div className="mt-2">{t("explain.coopMargin.ptExample")}</div>
              <div className="mb-2">{t("explain.coopMargin.euExample")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with language selector */}
      <div className="border-t pt-4 mt-2 flex justify-center items-center gap-2 text-sm text-gray-500">
        <span>{t("footer.language")}</span>
        <button
          onClick={() => handleLocaleChange("pt")}
          className={`px-2 py-1 rounded ${locale === "pt" ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100"}`}
        >
          PT
        </button>
        <button
          onClick={() => handleLocaleChange("en")}
          className={`px-2 py-1 rounded ${locale === "en" ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100"}`}
        >
          EN
        </button>
      </div>
    </div>
  );
};

export default HourlyCalculator;
