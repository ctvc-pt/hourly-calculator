# Hourly Calculator

A calculator for determining hourly rates based on various factors including age, qualifications, and status.

## Production URL
https://dainty-alfajores-fd4057.netlify.app/

## API

The same formula the React UI uses is exposed as a Netlify Function so other systems (e.g. SIGO) can verify their math against the canonical implementation.

### Endpoint

- `POST /.netlify/functions/calculate`
- `POST /api/calculate` (friendlier alias, same handler)
- `GET  /.netlify/functions/calculate?age=30&isMember=true&workTier=guidance`

### Request

All fields optional. Defaults match the React UI's defaults (2026 IAS, π/√2 factor).

```json
{
  "ias": 537.13,
  "factor": 2.2214,
  "age": 30,
  "isFormerChair": false,
  "isIntern": false,
  "isMember": false,
  "balance": 0,
  "academicQualification": "none",
  "workTier": "execution",
  "internalMode": false,
  "serviceType": "commercial",
  "clientCountry": "PT"
}
```

- `academicQualification`: `"none" | "bachelor" | "master" | "phd"`
- `workTier`: `"execution" | "guidance"` (×1.0 / ×1.5)
- `serviceType`: `"commercial" | "internal"` (which figure to use as `primary`)
- `clientCountry`: VAT country (`PT`, `ES`, `FR`, `DE`, `IT`, `NL`, `BE`, `IE`, `UK`, `EU_RC`, `NON_EU`)
- `internalMode` gates the intern discount; outside internal mode the discount does not apply.

### Response

```json
{
  "inputs": { "...": "..." },
  "steps": ["IASH = ...", "..."],
  "hourly": 19.50,
  "tierMultiplier": 1.5,
  "memberRate": 29.25,
  "internalRate": 24.86,
  "commercial": {
    "coopMarginRate": 0.15,
    "coopMarginAmount": 4.39,
    "vatRate": 0.23,
    "vatAmount": 7.74,
    "clientBeforeVAT": 33.64,
    "clientPays": 41.38
  },
  "primary": 41.38,
  "version": "1.0"
}
```

`memberRate` is what SIGO's timebank uses (post-rounding, post-tier, pre-commercial-margin).
