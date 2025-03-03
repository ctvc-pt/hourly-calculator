import React, { useState, useEffect, useRef } from 'react';

// Default Constants
const DEFAULT_IAS = 480.43; // Current "Indexante dos Apoios Sociais" for Portugal (2023)
const BASE_HOURLY_FACTOR = 1.85; // Factor chosen to make base hourly approximately 5€
const MAX_SENIORITY = 20; // Maximum seniority years that count (after age 43)
const VAT_RATE = 0.23; // VAT rate in Portugal (23%)

const HourlyCalculator = () => {
  // State for IAS value and derived IASH
  const [IAS, setIAS] = useState(DEFAULT_IAS);
  const [editingIAS, setEditingIAS] = useState(false);
  const [tempIAS, setTempIAS] = useState(DEFAULT_IAS.toString());
  const IASH = IAS / 176; // IAS Hourly - Approximate hourly equivalent (average work hours per month)
  
  // State for input values
  const [age, setAge] = useState(30);
  const [isExPresident, setIsExPresident] = useState(false);
  const [isIntern, setIsIntern] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [balance, setBalance] = useState(0);
  const [academicQualification, setAcademicQualification] = useState("none");
  const [formulaStyle, setFormulaStyle] = useState("mathjax"); // "ascii" or "mathjax"
  
  // State for additional pricing tiers
  const [serviceType, setServiceType] = useState("internal"); // "internal" or "commercial"
  const [isStrategic, setIsStrategic] = useState(false);
  const [includeVAT, setIncludeVAT] = useState(true); // Default to true
  
  // Effect to set VAT to true when commercial is selected
  useEffect(() => {
    if (serviceType === "commercial") {
      setIncludeVAT(true);
    }
  }, [serviceType]);
  
  // State for result
  const [hourlyRate, setHourlyRate] = useState(0);
  const [calculationSteps, setCalculationSteps] = useState([]);
  const [tierRates, setTierRates] = useState({
    base: 0,
    internal: 0,
    commercial: 0,
    commercialStrategic: 0,
    commercialVAT: 0,
    commercialStrategicVAT: 0
  });
  
  // Refs for MathJax
  const mathJaxRef = useRef(null);

  // Handle IAS value change
  const handleIASChange = (e) => {
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
  const calculateSeniorityBonus = (seniority) => {
    // Cap seniority at MAX_SENIORITY years
    const cappedSeniority = Math.min(seniority, MAX_SENIORITY);
    
    // Define the seniority function f(s) components
    const earlyCareerComponent = 4 * (1 - Math.exp(-0.15 * cappedSeniority));
    const midCareerComponent = 0.08 * Math.max(0, cappedSeniority - 10) * Math.exp(-0.1 * Math.max(0, cappedSeniority - 10));
    const lateCareerComponent = 0.02 * Math.max(0, cappedSeniority - 15);
    
    // Use a continuous function that approximates:
    // - First years: higher growth (approx 15% IASH per year)
    // - Middle years: medium growth (approx 8% IASH per year) 
    // - Later years: minimal growth (approx 2% IASH per year)
    return IASH * (
      earlyCareerComponent + midCareerComponent + lateCareerComponent
    );
  };

  // Calculate hourly rate and steps
  const calculateHourly = () => {
    const steps = [];
    
    // Calculate seniority (age - 23, minimum 0)
    const seniority = Math.max(0, age - 23);
    const cappedSeniority = Math.min(seniority, MAX_SENIORITY);
    
    if (seniority > MAX_SENIORITY) {
      steps.push(`Seniority: max(0, ${age} - 23) = ${seniority} years (capped at ${MAX_SENIORITY} years)`);
    } else {
      steps.push(`Seniority: max(0, ${age} - 23) = ${seniority} years`);
    }
    
    // Base hourly calculation - now based on IAS
    const baseHourly = IASH * BASE_HOURLY_FACTOR;
    steps.push(`Base hourly rate: (${IAS.toFixed(2)}€ ÷ 176) × ${BASE_HOURLY_FACTOR} = ${IASH.toFixed(2)}€ × ${BASE_HOURLY_FACTOR} = ${baseHourly.toFixed(2)}€`);
    steps.push(`Note: ${BASE_HOURLY_FACTOR} factor chosen to make base hourly approximately 5€`);
    
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
    if (isExPresident) {
      const oldHourly = hourly;
      hourly *= 1.10; // 10% boost
      steps.push(`Ex Board Chair bonus (10%): ${oldHourly.toFixed(2)}€ × 1.10 = ${hourly.toFixed(2)}€`);
    }
    
    if (isIntern) {
      const oldHourly = hourly;
      hourly *= 0.50; // 50% penalty
      steps.push(`Intern penalty (50%): ${oldHourly.toFixed(2)}€ × 0.50 = ${hourly.toFixed(2)}€`);
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
      steps.push(`Balance bonus (${(balanceBoost * 100).toFixed(2)}%): ${oldHourly.toFixed(2)}€ × ${(1 + balanceBoost).toFixed(2)} = ${hourly.toFixed(2)}€`);
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
    
    // Calculate additional tier rates
    const baseRate = hourly;
    const internalRate = baseRate;
    const commercialRate = baseRate * 1.5; // +50%
    const commercialStrategicRate = commercialRate * 0.75; // -25% of commercial
    const commercialVATRate = commercialRate * (1 + VAT_RATE);
    const commercialStrategicVATRate = commercialStrategicRate * (1 + VAT_RATE);
    
    setTierRates({
      base: baseRate,
      internal: internalRate,
      commercial: commercialRate,
      commercialStrategic: commercialStrategicRate,
      commercialVAT: commercialVATRate,
      commercialStrategicVAT: commercialStrategicVATRate
    });
    
    setHourlyRate(hourly);
    setCalculationSteps(steps);
    
    return hourly;
  };

  // Calculate whenever inputs change
  useEffect(() => {
    calculateHourly();
  }, [IAS, age, isExPresident, isIntern, isMember, balance, academicQualification]);

  // Effect to render MathJax after the component updates
  useEffect(() => {
    if (formulaStyle === 'mathjax' && window.MathJax && mathJaxRef.current) {
      window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, mathJaxRef.current]);
    }
  }, [formulaStyle, IAS]);

  // Generate data for age chart
  const ageRangeData = [];
  for (let a = 23; a <= 65; a += 5) {
    // Calculate seniority
    const seniority = Math.max(0, a - 23);
    
    // Base hourly calculation
    const baseHourly = IASH * BASE_HOURLY_FACTOR;
    
    // Apply seniority growth
    const seniorityBonus = calculateSeniorityBonus(seniority);
    
    // Calculate hourly rate
    let hourly = baseHourly + seniorityBonus;
    
    // Round to nearest quarter
    hourly = Math.round(hourly * 4) / 4;
    
    ageRangeData.push({ age: a, hourly: hourly });
  }
  
  // Generate chart data for seniority curve visualization
  const chartData = [];
  for (let i = 0; i <= MAX_SENIORITY + 10; i += 1) {
    chartData.push({
      seniority: i,
      bonus: calculateSeniorityBonus(i)
    });
  }
  
  // MathJax formula
  const mathJaxFormula = `
    <div class="p-4 bg-gray-50 rounded">
      <h4 class="font-bold mb-6 text-center text-xl">Unified Formula</h4>
      <div style="overflow-x: auto; padding: 10px;">
        $$
        \\begin{align}
        \\text{Hourly} &= \\mathbf{\\text{round}}\\left\\{\\left[\\left(\\frac{\\text{IAS}}{176} \\times ${BASE_HOURLY_FACTOR}\\right) + \\left(\\frac{\\text{IAS}}{176} \\times f(s)\\right)\\right] \\times M_S \\times M_B \\times M_Q \\times 4 \\right\\} \\div 4 \\\\[12pt]
        \\text{where:} \\\\[8pt]
        s &= \\min(\\max(0, \\text{age} - 23), ${MAX_SENIORITY}) \\\\[8pt]
        f(s) &= 4(1-e^{-0.15s}) + 0.08\\max(0,s-10)e^{-0.1\\max(0,s-10)} + 0.02\\max(0,s-15) \\\\[8pt]
        M_S &= \\prod_{i \\in \\text{Status}} k_i \\quad \\text{where} \\quad k_i = 
        \\begin{cases}
        1.10 & \\text{if Ex Board Chair} \\\\
        0.50 & \\text{if Intern} \\\\
        1.10 & \\text{if Member} \\\\
        1.00 & \\text{otherwise}
        \\end{cases} \\\\[8pt]
        M_B &= 1 + \\min\\left(0.50, \\frac{\\text{Balance}}{10,000} \\times 0.50\\right) \\\\[8pt]
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
    </div>
  `;
  
  // ASCII formula
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
BaseHourly = IASH * ${BASE_HOURLY_FACTOR} = ${(IASH * BASE_HOURLY_FACTOR).toFixed(2)}€

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
- Intern: x 0.50
- Member: x 1.10

6. BALANCE MULTIPLIER
-------------------
BalanceMultiplier = 1 + min(0.50, (Balance / 10000) * 0.50)

7. QUALIFICATION MULTIPLIER (highest only)
---------------------------------------
- PhD: x 1.35
- Master's: x 1.20
- Bachelor's: x 1.12
- None: x 1.00

8. FINAL CALCULATION
------------------
Hourly = round[(BaseHourly + SeniorityBonus(s)) * 
         StatusMultiplier * BalanceMultiplier * 
         QualificationMultiplier * 4] / 4
`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="border rounded-lg p-4 shadow-sm flex-1">
          <div className="border-b pb-2 mb-4">
            <h3 className="text-lg font-bold">Input Parameters</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold">IAS Value</label>
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
                    <span className="text-lg">{IAS.toFixed(2)}€</span> (Edit)
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500">"Indexante dos Apoios Sociais" for Portugal</p>
              <p className="text-sm text-gray-500">Hourly equivalent: IAS ÷ 176 = {IASH.toFixed(2)}€</p>
              <p className="text-sm text-gray-500">Base rate factor: {BASE_HOURLY_FACTOR} (creates a base hourly of ~5€)</p>
            </div>
            
            <div>
              <label className="font-bold block mb-1">Age: {age}</label>
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
                Seniority: {Math.max(0, age - 23)} years
                {age > 23 + MAX_SENIORITY && ` (capped at ${MAX_SENIORITY} for calculations)`}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="font-bold">Intern</label>
              <input
                type="checkbox"
                checked={isIntern}
                onChange={(e) => setIsIntern(e.target.checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="font-bold">Member</label>
              <input
                type="checkbox"
                checked={isMember}
                onChange={(e) => setIsMember(e.target.checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="font-bold">Ex Board Chair</label>
              <input
                type="checkbox"
                checked={isExPresident}
                onChange={(e) => setIsExPresident(e.target.checked)}
              />
            </div>
            
            <div>
              <label className="font-bold block mb-1">Balance: {balance}€</label>
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
                Balance boost: {balance > 0 ? Math.min(50, (balance / 10000) * 50).toFixed(1) + '%' : 'None'}
              </p>
            </div>
            
            <div>
              <label className="font-bold block mb-1">Academic Qualification</label>
              <select 
                className="w-full p-2 border rounded"
                value={academicQualification} 
                onChange={(e) => setAcademicQualification(e.target.value)}
              >
                <option value="none">None</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
                <option value="phd">PhD</option>
              </select>
            </div>
            
            <div>
              <label className="font-bold block mb-1">Formula Display</label>
              <select 
                className="w-full p-2 border rounded"
                value={formulaStyle} 
                onChange={(e) => setFormulaStyle(e.target.value)}
              >
                <option value="ascii">ASCII</option>
                <option value="mathjax">MathJax</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 shadow-sm flex-1">
          <div className="border-b pb-2 mb-4">
            <h3 className="text-lg font-bold">Calculation Result</h3>
          </div>
          <div>
            <div className="text-3xl font-bold text-center p-4 border rounded bg-gray-50">
              {hourlyRate.toFixed(2)}€ per hour
            </div>
            
            <div className="mt-6">
              <h4 className="text-lg font-bold mb-2">Calculation Steps:</h4>
              <div className="p-3 bg-gray-50 rounded">
                <ol className="list-decimal pl-5 space-y-1">
                  {calculationSteps.map((step, index) => (
                    <li key={index} className="text-sm">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-lg font-bold mb-2">Service Options:</h4>
              <div className="p-4 bg-gray-100 rounded border">
                <div className="mb-4">
                  <div className="font-bold mb-2">Service Type:</div>
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
                      Internal (0%)
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
                      Commercial (+50%)
                    </label>
                  </div>
                </div>
                
                {serviceType === "commercial" && (
                  <div className="mb-4 ml-6">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={isStrategic}
                        onChange={(e) => setIsStrategic(e.target.checked)}
                        className="mr-2"
                      />
                      <label>Strategic (-25% of commercial value)</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeVAT}
                        onChange={(e) => setIncludeVAT(e.target.checked)}
                        className="mr-2"
                      />
                      <label>Include VAT (23%)</label>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t">
                  <div className="font-bold mb-2">Final Value:</div>
                  <div className="text-2xl font-bold">
                    {(() => {
                      if (serviceType === "internal") {
                        return `${tierRates.internal.toFixed(2)}€`;
                      } else if (serviceType === "commercial") {
                        if (isStrategic) {
                          return includeVAT 
                            ? `${tierRates.commercialStrategicVAT.toFixed(2)}€ (with VAT)`
                            : `${tierRates.commercialStrategic.toFixed(2)}€`;
                        } else {
                          return includeVAT 
                            ? `${tierRates.commercialVAT.toFixed(2)}€ (with VAT)`
                            : `${tierRates.commercial.toFixed(2)}€`;
                        }
                      }
                    })()}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="font-bold mb-2">Value Range:</div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm">Minimum (Internal)</div>
                      <div className="font-bold">{tierRates.internal.toFixed(2)}€</div>
                    </div>
                    <div className="h-1 bg-gray-300 flex-1 mx-4 rounded-full"></div>
                    <div>
                      <div className="text-sm">Maximum (Commercial + VAT)</div>
                      <div className="font-bold">{tierRates.commercialVAT.toFixed(2)}€</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 shadow-sm">
        <div className="border-b pb-2 mb-4">
          <h3 className="text-lg font-bold">Seniority Bonus Growth Curve</h3>
          <p className="text-sm text-gray-500">Note: Seniority is capped at {MAX_SENIORITY} years (age {23 + MAX_SENIORITY})</p>
        </div>
        <div className="h-64 relative">
          {/* The chart container */}
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
                  title={`${point.seniority} years: ${point.bonus.toFixed(2)}€`}
                ></div>
              </div>
            ))}
          </div>
          
          {/* Y-axis label */}
          <div className="absolute top-2 left-2 text-sm text-gray-500">
            Seniority bonus value (€)
          </div>
          
          {/* X-axis labels - positioned separately */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
            <div className="text-xs">0y</div>
            <div className="text-xs">5y</div>
            <div className="text-xs">10y</div>
            <div className="text-xs">15y</div>
            <div className="text-xs">{MAX_SENIORITY}y (cap)</div>
            <div className="text-xs text-gray-400">{MAX_SENIORITY + 5}y</div>
            <div className="text-xs text-gray-400">{MAX_SENIORITY + 10}y</div>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 shadow-sm">
        <div className="border-b pb-2 mb-4">
          <h3 className="text-lg font-bold">Hourly Rate By Age (Base calculation, no bonuses)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {ageRangeData.map(item => (
                  <th key={item.age} className="p-2 border text-center">Age {item.age}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {ageRangeData.map(item => (
                  <td key={item.age} className={`p-2 border text-center ${item.age > 23 + MAX_SENIORITY ? 'bg-gray-100' : ''}`}>
                    {item.hourly.toFixed(2)}€
                    {item.age > 23 + MAX_SENIORITY && <span className="text-xs text-gray-500"> (capped)</span>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {formulaStyle === "mathjax" ? (
        <div className="border rounded-lg p-4 shadow-sm">
          <div className="border-b pb-2 mb-4">
            <h3 className="text-lg font-bold">Mathematical Formula</h3>
          </div>
          <div 
            ref={mathJaxRef}
            dangerouslySetInnerHTML={{ __html: mathJaxFormula }}
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4 shadow-sm">
          <div className="border-b pb-2 mb-4">
            <h3 className="text-lg font-bold">Formula (ASCII)</h3>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <pre className="whitespace-pre-wrap break-all font-mono text-sm">
              {asciiFormula}
            </pre>
          </div>
        </div>
      )}
      
      <div className="border rounded-lg p-4 shadow-sm">
        <div className="border-b pb-2 mb-4">
          <h3 className="text-lg font-bold">Detailed Explanation</h3>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-bold">Base Calculation</h4>
            <p>The hourly rate starts at {(IASH * BASE_HOURLY_FACTOR).toFixed(2)}€ for individuals with no seniority (age 23 or younger).</p>
            <p>This base rate is calculated as {BASE_HOURLY_FACTOR} times the hourly equivalent of the IAS ({IASH.toFixed(2)}€), ensuring the base value remains proportional to the current IAS.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold">Seniority Growth Function f(s)</h4>
            <p>Seniority is capped at {MAX_SENIORITY} years, meaning that after age {23 + MAX_SENIORITY}, additional years do not increase the hourly rate.</p>
            <p>The formula uses a continuous growth function with three components that together create a natural progression curve:</p>
            <ol className="list-decimal pl-5 space-y-1 mt-2">
              <li><strong>Early Career Component:</strong> <code>4 × (1 - e<sup>-0.15s</sup>)</code><br/>
                This creates rapid initial growth that gradually slows, providing most of the increase during the first 10 years.</li>
              <li><strong>Mid-Career Component:</strong> <code>0.08 × max(0, s-10) × e<sup>-0.1×max(0,s-10)</sup></code><br/>
                This adds moderate growth that kicks in after 10 years but naturally tapers off over time.</li>
              <li><strong>Late Career Component:</strong> <code>0.02 × max(0, s-15)</code><br/>
                This adds minimal linear growth after 15 years, until the cap at {MAX_SENIORITY} years.</li>
            </ol>
            <p className="mt-3">Together, these components form the function f(s) in the unified formula, which is multiplied by IAS/176 to determine the seniority bonus.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold">Status Modifiers</h4>
            <ul className="list-disc pl-5">
              <li>Ex Board Chair: +10%</li>
              <li>Intern: -50%</li>
              <li>Member: +10%</li>
            </ul>
            <p>These modifiers are multiplicative if multiple apply to the same person.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold">Balance Modifier</h4>
            <p>For balances above 0€, a bonus of up to 50% is applied, scaling linearly up to 10,000€.</p>
            <p>Bonus percentage = min(50%, (balance / 10,000) × 50%)</p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold">Academic Qualification Bonus (non-cumulative)</h4>
            <ul className="list-disc pl-5">
              <li>Bachelor's Degree: +12%</li>
              <li>Master's Degree: +20%</li>
              <li>PhD: +35%</li>
            </ul>
            <p>Only the highest qualification bonus applies.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold">Final Adjustment</h4>
            <p>The result is rounded to the nearest quarter of a euro (0.25€).</p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold">Service Types</h4>
            <ul className="list-disc pl-5">
              <li><strong>Internal:</strong> For services between members, within the cooperative ecosystem. Reference value without change (0%).</li>
              <li><strong>Commercial:</strong> For services to third parties, invoiced through the cooperative. Additional fee of 50% on the reference value.</li>
              <li><strong>Strategic:</strong> (Option for commercial services) For non-profit initiatives, local or of strategic interest. 25% reduction on the commercial value.</li>
              <li><strong>VAT:</strong> Option to include Value Added Tax (23%) in the final calculation.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HourlyCalculator;
