// Hourly Calculator API
// POST /.netlify/functions/calculate
//
// Pure-JS port of the rate formula in src/HourlyCalculator.tsx. This is the
// canonical implementation — keep in sync with the React component.
//
// Request body (all fields optional except as noted):
// {
//   "ias": 537.13,                 // defaults to 2026 IAS
//   "factor": 2.2214,              // defaults to π/√2 (2026 base factor)
//   "age": 30,                     // required for seniority bonus
//   "isFormerChair": false,
//   "isIntern": false,             // only applied when internalMode = true
//   "isMember": false,
//   "balance": 0,
//   "academicQualification": "none" | "bachelor" | "master" | "phd",
//   "workTier": "execution" | "guidance" | "advisory",
//   "internalMode": false,         // controls whether intern discount applies
//   "serviceType": "commercial" | "internal",
//   "clientCountry": "PT"          // VAT country code for commercial pricing
// }
//
// Response:
// {
//   inputs: {...},                 // echoed for traceability
//   steps: [...],                  // human-readable calculation trace
//   memberRate, internalRate,
//   commercial: { coopMargin, vat, clientPays, ... }
// }

const DEFAULT_IAS = 537.13;
const DEFAULT_FACTOR = Math.PI / Math.SQRT2;
const HOURS_PER_MONTH = 176;
const MAX_SENIORITY = 20;
const BASE_VAT = 0.23;
const COOP_MARGIN = Math.floor(BASE_VAT * 100 * 2 / 3) / 100;
const MIN_EFFECTIVE_FEE = Math.floor(COOP_MARGIN * 100 / 3) / 100;
const MEMBER_INTERNAL_DISCOUNT = COOP_MARGIN;

const CLIENT_VAT_RATES = {
  PT: 0.23, ES: 0.21, FR: 0.20, DE: 0.19, IT: 0.22,
  NL: 0.21, BE: 0.21, IE: 0.23, UK: 0.20,
  EU_RC: 0, NON_EU: 0,
};

const WORK_TIER_MULTIPLIERS = { execution: 1.0, guidance: 1.5, advisory: 2.0 };

function seniorityBonus(seniority, iash) {
  const s = Math.min(seniority, MAX_SENIORITY);
  const early = 4 * (1 - Math.exp(-0.15 * s));
  const mid = 0.08 * Math.max(0, s - 10) * Math.exp(-0.1 * Math.max(0, s - 10));
  const late = 0.02 * Math.max(0, s - 15);
  return iash * (early + mid + late);
}

export function calculate(input = {}) {
  const ias = Number(input.ias ?? DEFAULT_IAS);
  const factor = Number(input.factor ?? DEFAULT_FACTOR);
  const age = Number(input.age ?? 30);
  const isFormerChair = !!input.isFormerChair;
  const isIntern = !!input.isIntern;
  const isMember = !!input.isMember;
  const balance = Number(input.balance ?? 0);
  const academicQualification = (input.academicQualification ?? "none").toLowerCase();
  const workTier = (input.workTier ?? "execution").toLowerCase();
  const internalMode = !!input.internalMode;
  const serviceType = (input.serviceType ?? "commercial").toLowerCase();
  const clientCountry = (input.clientCountry ?? "PT").toUpperCase();

  const iash = ias / HOURS_PER_MONTH;
  const seniority = Math.max(0, age - 23);

  const steps = [];
  steps.push(`IASH = ${ias.toFixed(2)} / ${HOURS_PER_MONTH} = ${iash.toFixed(4)}`);
  steps.push(`seniority = max(0, ${age} - 23) = ${seniority}`);

  const baseHourly = iash * factor;
  steps.push(`baseHourly = ${iash.toFixed(4)} × ${factor.toFixed(4)} = ${baseHourly.toFixed(4)}`);

  const bonus = seniorityBonus(seniority, iash);
  steps.push(`seniorityBonus = ${bonus.toFixed(4)}`);

  let hourly = baseHourly + bonus;
  steps.push(`baseHourly + seniorityBonus = ${hourly.toFixed(4)}`);

  if (isFormerChair) { hourly *= 1.10; steps.push(`× 1.10 (formerChair) = ${hourly.toFixed(4)}`); }
  if (internalMode && isIntern) { hourly *= 0.60; steps.push(`× 0.60 (intern) = ${hourly.toFixed(4)}`); }
  if (isMember) { hourly *= 1.10; steps.push(`× 1.10 (member) = ${hourly.toFixed(4)}`); }

  if (balance > 0) {
    const boost = Math.min(0.50, (balance / 10000) * 0.50);
    hourly *= (1 + boost);
    steps.push(`× ${(1 + boost).toFixed(4)} (balance boost ${(boost * 100).toFixed(2)}%) = ${hourly.toFixed(4)}`);
  }

  if (academicQualification === "phd") { hourly *= 1.35; steps.push(`× 1.35 (PhD) = ${hourly.toFixed(4)}`); }
  else if (academicQualification === "master") { hourly *= 1.20; steps.push(`× 1.20 (Master) = ${hourly.toFixed(4)}`); }
  else if (academicQualification === "bachelor") { hourly *= 1.12; steps.push(`× 1.12 (Bachelor) = ${hourly.toFixed(4)}`); }

  const preRound = hourly;
  hourly = Math.round(hourly * 4) / 4;
  steps.push(`round to nearest 0.25 = ${preRound.toFixed(4)} → ${hourly.toFixed(2)}`);

  const tierMultiplier = WORK_TIER_MULTIPLIERS[workTier] ?? 1.0;
  const memberRate = hourly * tierMultiplier;
  if (tierMultiplier !== 1.0)
    steps.push(`× ${tierMultiplier} (${workTier}) = ${memberRate.toFixed(4)}`);

  const clientVat = CLIENT_VAT_RATES[clientCountry] ?? 0;
  const vatRecovery = Math.floor(clientVat * 100 / 3) / 100;
  const effectiveMargin = Math.max(MIN_EFFECTIVE_FEE, COOP_MARGIN - vatRecovery);
  const coopMarginAmount = memberRate * effectiveMargin;
  const clientBeforeVAT = memberRate + coopMarginAmount;
  const vatAmount = clientBeforeVAT * clientVat;
  const clientTotal = clientBeforeVAT + vatAmount;
  const internalRate = memberRate * (1 - MEMBER_INTERNAL_DISCOUNT);

  return {
    inputs: {
      ias, factor, iash, age, seniority, isFormerChair, isIntern, isMember,
      balance, academicQualification, workTier, internalMode, serviceType, clientCountry
    },
    steps,
    hourlyPreRound: preRound,
    hourly,
    tierMultiplier,
    memberRate,
    internalRate,
    commercial: {
      coopMarginRate: effectiveMargin,
      coopMarginAmount,
      vatRate: clientVat,
      vatAmount,
      clientBeforeVAT,
      clientPays: clientTotal,
    },
    primary: serviceType === "internal" ? internalRate : clientTotal,
    constants: {
      DEFAULT_IAS, DEFAULT_FACTOR, HOURS_PER_MONTH, MAX_SENIORITY,
      BASE_VAT, COOP_MARGIN, MIN_EFFECTIVE_FEE, MEMBER_INTERNAL_DISCOUNT,
    },
    version: "1.0",
  };
}

export const handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS")
    return { statusCode: 204, headers: cors, body: "" };

  let input = {};
  if (event.httpMethod === "GET") {
    input = event.queryStringParameters ?? {};
    // Coerce booleans from string query
    for (const k of ["isFormerChair", "isIntern", "isMember", "internalMode"])
      if (input[k] !== undefined) input[k] = input[k] === "true" || input[k] === "1";
  } else if (event.httpMethod === "POST") {
    try {
      input = event.body ? JSON.parse(event.body) : {};
    } catch (e) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Invalid JSON body" }) };
    }
  } else {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const result = calculate(input);
    return { statusCode: 200, headers: cors, body: JSON.stringify(result) };
  } catch (e) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) };
  }
};
