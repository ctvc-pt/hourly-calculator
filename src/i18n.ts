export type Locale = "en" | "pt";

const translations = {
  // Input Parameters
  "input.title": { en: "Input Parameters", pt: "Parâmetros de Entrada" },
  "input.iasValue": { en: "IAS Value", pt: "Valor do IAS" },
  "input.iasDesc": { en: '"Indexante dos Apoios Sociais" for Portugal', pt: '"Indexante dos Apoios Sociais" em Portugal' },
  "input.iasHourly": { en: "Hourly equivalent: IAS ÷ 176 =", pt: "Equivalente horário: IAS ÷ 176 =" },
  "input.baseRateFactor": { en: "Base rate factor:", pt: "Fator base:" },
  "input.projection": { en: "projection", pt: "projeção" },
  "input.edit": { en: "(Edit)", pt: "(Editar)" },
  "input.factorProjection": { en: "Factor Projection", pt: "Projeção do Fator" },
  "input.projectionWarning": { en: "Projection — not the current formula", pt: "Projeção — não é a fórmula atual" },
  "input.age": { en: "Age:", pt: "Idade:" },
  "input.seniority": { en: "Seniority:", pt: "Senioridade:" },
  "input.years": { en: "years", pt: "anos" },
  "input.cappedAt": { en: "capped at", pt: "limitado a" },
  "input.forCalculations": { en: "for calculations", pt: "para cálculos" },
  "input.intern": { en: "Intern", pt: "Estagiário" },
  "input.member": { en: "Member", pt: "Membro" },
  "input.exBoardChair": { en: "Ex Board Chair", pt: "Ex-Presidente da Mesa" },
  "input.economicParticipation": { en: "Economic Participation:", pt: "Participação Económica:" },
  "input.economicBoost": { en: "Economic Participation boost:", pt: "Bónus de Participação Económica:" },
  "input.none": { en: "None", pt: "Nenhum" },
  "input.academicQualification": { en: "Academic Qualification", pt: "Qualificação Académica" },
  "input.bachelor": { en: "Bachelor's Degree", pt: "Licenciatura" },
  "input.master": { en: "Master's Degree", pt: "Mestrado" },
  "input.phd": { en: "PhD", pt: "Doutoramento" },
  "input.workTier": { en: "Work Tier", pt: "Nível de Trabalho" },
  "input.clientCountry": { en: "Client Country", pt: "País do Cliente" },
  "input.vatRecovery": { en: "VAT recovery:", pt: "Recuperação de IVA:" },
  "input.effectiveMemberFee": { en: "Effective member fee:", pt: "Fee efetiva do membro:" },
  "input.formulaDisplay": { en: "Formula Display", pt: "Formato da Fórmula" },

  // Work Tiers
  "tier.execution.label": { en: "Execution", pt: "Execução" },
  "tier.execution.desc": {
    en: "Hands-on creation and delivery. The professional directly produces the work themselves — whether that's designing, building, writing, researching, or implementing. The focus is on delivering concrete outputs. The client provides goals; the professional delivers the artefacts. Responsibility is on the professional for the quality of the work, not the broader process or strategy.",
    pt: "Criação e entrega direta. O profissional produz o trabalho diretamente — seja design, construção, escrita, investigação ou implementação. O foco está na entrega de resultados concretos. O cliente define os objetivos; o profissional entrega os artefactos. A responsabilidade é do profissional pela qualidade do trabalho, não pelo processo ou estratégia."
  },
  "tier.guidance.label": { en: "Guidance & Audit", pt: "Orientação & Auditoria" },
  "tier.guidance.desc": {
    en: "Expert direction, feedback, and quality assurance. The professional is not executing the tasks. Instead, they guide the team on how to do the work effectively, review what is produced, identify gaps, and ensure quality and alignment. This tier covers mentoring, critique, audits, design/architecture direction, and elevating the team's execution. The client owns the hands-on work; the professional owns the clarity and standards.",
    pt: "Direção especializada, feedback e garantia de qualidade. O profissional não executa as tarefas. Em vez disso, orienta a equipa sobre como trabalhar eficazmente, revê o que é produzido, identifica lacunas e assegura qualidade e alinhamento. Este nível cobre mentoria, crítica, auditorias, direção de design/arquitetura e elevação da execução da equipa. O cliente é responsável pela execução; o profissional pela clareza e standards."
  },
  "tier.advisory.label": { en: "Advisory", pt: "Consultoria" },
  "tier.advisory.desc": {
    en: "Strategic partnership with accountability. At this level, the professional acts as an advisor who helps steer decisions, priorities, and direction. The team checks in with them, not for task updates, but for alignment with broader goals — whether strategic, organisational, design, or product-related. Their role is to bring pattern-recognition, experience, and judgment, helping the client avoid mistakes and move with intention. This is the highest-leverage tier: the client remains in control of execution, but the professional holds them accountable to the direction they define together.",
    pt: "Parceria estratégica com responsabilização. Neste nível, o profissional atua como consultor que ajuda a orientar decisões, prioridades e direção. A equipa consulta-o não para atualizações de tarefas, mas para alinhamento com objetivos mais amplos — estratégicos, organizacionais, de design ou de produto. O seu papel é trazer reconhecimento de padrões, experiência e julgamento, ajudando o cliente a evitar erros e a agir com intenção. Este é o nível de maior alavancagem: o cliente mantém o controlo da execução, mas o profissional responsabiliza-o pela direção que definem em conjunto."
  },
  "tier.baseRate": { en: "Base rate applied", pt: "Taxa base aplicada" },
  "tier.guidance50": { en: "+50% multiplier applied", pt: "Multiplicador de +50% aplicado" },
  "tier.advisory100": { en: "+100% multiplier applied (×2)", pt: "Multiplicador de +100% aplicado (×2)" },

  // Results
  "result.title": { en: "Calculation Result", pt: "Resultado do Cálculo" },
  "result.perHour": { en: "per hour", pt: "por hora" },
  "result.internalRate": { en: "Internal rate (member rate with", pt: "Taxa interna (taxa do membro com" },
  "result.discount": { en: "discount)", pt: "de desconto)" },
  "result.clientPaysInclusion": { en: "Client pays (incl. margin + VAT)", pt: "Cliente paga (incl. margem + IVA)" },
  "result.memberEarns": { en: "Member earns:", pt: "O membro ganha:" },
  "result.calculationSteps": { en: "Calculation Steps:", pt: "Passos do Cálculo:" },
  "result.serviceOptions": { en: "Service Options:", pt: "Opções de Serviço:" },
  "result.selectedWorkTier": { en: "Selected Work Tier:", pt: "Nível de Trabalho Selecionado:" },
  "result.serviceType": { en: "Service Type:", pt: "Tipo de Serviço:" },
  "result.internal": { en: "Internal", pt: "Interno" },
  "result.commercial": { en: "Commercial", pt: "Comercial" },
  "result.margin": { en: "margin", pt: "margem" },
  "result.breakdown": { en: "Breakdown:", pt: "Decomposição:" },
  "result.memberRate": { en: "Member rate", pt: "Taxa do membro" },
  "result.coopMargin": { en: "Cooperative margin", pt: "Margem cooperativa" },
  "result.coopMarginTooltip": {
    en: "The cooperative retains {pct}% on the member's rate for operational costs and sustainability. This margin varies by client country.",
    pt: "A cooperativa retém {pct}% sobre a taxa do membro para custos operacionais e sustentabilidade. Esta margem varia conforme o país do cliente."
  },
  "result.subtotal": { en: "Subtotal", pt: "Subtotal" },
  "result.clientPays": { en: "Client pays", pt: "Cliente paga" },
  "result.effectiveFee": { en: "Effective fee:", pt: "Fee efetiva:" },
  "result.afterVatRecovery": { en: "(after VAT recovery)", pt: "(após recuperação de IVA)" },
  "result.effectiveFeeTooltip": {
    en: "The coop charges {margin}% to the client, but recovers {recovery}% from VAT. So the member's effective fee is only {fee}% — the coop already earns from VAT recovery.",
    pt: "A cooperativa cobra {margin}% ao cliente, mas recupera {recovery}% do IVA. Assim, a fee efetiva do membro é apenas {fee}% — a cooperativa já ganha com a recuperação de IVA."
  },
  "result.netAfterFee": { en: "Net after fee:", pt: "Líquido após fee:" },
  "result.internalValue": { en: "Internal Value:", pt: "Valor Interno:" },
  "result.memberRateWith": { en: "Member rate ({rate}€) with {pct}% discount", pt: "Taxa do membro ({rate}€) com {pct}% de desconto" },
  "result.internalTooltip": {
    en: '"Internal" applies when the client is: a non-profit cooperative project (workshops), a project the coop supports (Sigo), an exchange between members, or an exchange with an associated startup. Rule: if the cooperative invoices, it is NOT internal. No cooperative margin. No VAT.',
    pt: '"Interno" aplica-se quando o cliente é: um projeto non-profit da cooperativa (workshops), um projeto que a cooperativa apoia (Sigo), uma troca entre membros, ou uma troca com uma startup associada. Regra: se a cooperativa fatura, NÃO é interno. Sem margem cooperativa. Sem IVA.'
  },
  "result.noMarginNoVat": { en: "No cooperative margin. No VAT.", pt: "Sem margem cooperativa. Sem IVA." },
  "result.valueRange": { en: "Value Range:", pt: "Intervalo de Valores:" },
  "result.minimum": { en: "Minimum (Internal)", pt: "Mínimo (Interno)" },
  "result.maximum": { en: "Maximum (Client + VAT)", pt: "Máximo (Cliente + IVA)" },

  // Charts
  "chart.seniorityTitle": { en: "Seniority Bonus Growth Curve", pt: "Curva de Crescimento do Bónus de Senioridade" },
  "chart.seniorityNote": { en: "Note: Seniority is capped at {max} years (age {age})", pt: "Nota: A senioridade é limitada a {max} anos (idade {age})" },
  "chart.seniorityYAxis": { en: "Seniority bonus value (€)", pt: "Valor do bónus de senioridade (€)" },
  "chart.cap": { en: "(cap)", pt: "(limite)" },
  "chart.ageTitle": { en: "Hourly Rate By Age (with current settings)", pt: "Taxa Horária por Idade (com definições atuais)" },
  "chart.age": { en: "Age", pt: "Idade" },
  "chart.capped": { en: "(capped)", pt: "(limitado)" },

  // Formula
  "formula.mathTitle": { en: "Mathematical Formula", pt: "Fórmula Matemática" },
  "formula.asciiTitle": { en: "Formula (ASCII)", pt: "Fórmula (ASCII)" },

  // Detailed Explanation
  "explain.title": { en: "Detailed Explanation", pt: "Explicação Detalhada" },
  "explain.baseCalc.title": { en: "Base Calculation", pt: "Cálculo Base" },
  "explain.baseCalc.p1": {
    en: "The hourly rate starts at {rate}€ for individuals with no seniority (age 23 or younger).",
    pt: "A taxa horária começa em {rate}€ para indivíduos sem senioridade (idade 23 ou inferior)."
  },
  "explain.baseCalc.p2": {
    en: "This base rate is calculated as {factor} times the hourly equivalent of the IAS ({iash}€), ensuring the base value remains proportional to the current IAS.",
    pt: "Esta taxa base é calculada como {factor} vezes o equivalente horário do IAS ({iash}€), garantindo que o valor base permanece proporcional ao IAS atual."
  },
  "explain.seniority.title": { en: "Seniority Growth Function f(s)", pt: "Função de Crescimento de Senioridade f(s)" },
  "explain.seniority.p1": {
    en: "Seniority is capped at {max} years, meaning that after age {age}, additional years do not increase the hourly rate.",
    pt: "A senioridade é limitada a {max} anos, significando que após a idade {age}, anos adicionais não aumentam a taxa horária."
  },
  "explain.seniority.p2": {
    en: "The formula uses a continuous growth function with three components that together create a natural progression curve:",
    pt: "A fórmula usa uma função de crescimento contínuo com três componentes que juntos criam uma curva de progressão natural:"
  },
  "explain.seniority.early.title": { en: "1. Early Career Component:", pt: "1. Componente de Início de Carreira:" },
  "explain.seniority.early.desc": {
    en: "This creates rapid initial growth that gradually slows, providing most of the increase during the first 10 years.",
    pt: "Isto cria um crescimento inicial rápido que gradualmente abranda, proporcionando a maior parte do aumento durante os primeiros 10 anos."
  },
  "explain.seniority.mid.title": { en: "2. Mid-Career Component:", pt: "2. Componente de Meio de Carreira:" },
  "explain.seniority.mid.desc": {
    en: "This adds moderate growth that kicks in after 10 years but naturally tapers off over time.",
    pt: "Isto adiciona crescimento moderado que começa após 10 anos mas naturalmente diminui ao longo do tempo."
  },
  "explain.seniority.late.title": { en: "3. Late Career Component:", pt: "3. Componente de Fim de Carreira:" },
  "explain.seniority.late.desc": {
    en: "This adds minimal linear growth after 15 years, until the cap at {max} years.",
    pt: "Isto adiciona crescimento linear mínimo após 15 anos, até ao limite de {max} anos."
  },
  "explain.seniority.summary": {
    en: "Together, these components form the function f(s) in the unified formula, which is multiplied by IAS/176 to determine the seniority bonus.",
    pt: "Juntos, estes componentes formam a função f(s) na fórmula unificada, que é multiplicada por IAS/176 para determinar o bónus de senioridade."
  },
  "explain.status.title": { en: "Status Modifiers", pt: "Modificadores de Estatuto" },
  "explain.status.multiplicative": {
    en: "These modifiers are multiplicative if multiple apply to the same person.",
    pt: "Estes modificadores são multiplicativos se vários se aplicarem à mesma pessoa."
  },
  "explain.economicMod.title": { en: "Economic Participation Modifier", pt: "Modificador de Participação Económica" },
  "explain.economicMod.p1": {
    en: "For economic participation above 0€, a bonus of up to 50% is applied, scaling linearly up to 10,000€.",
    pt: "Para participação económica acima de 0€, um bónus de até 50% é aplicado, escalando linearmente até 10.000€."
  },
  "explain.economicMod.formula": {
    en: "Bonus percentage = min(50%, (economic participation / 10,000) × 50%)",
    pt: "Percentagem de bónus = min(50%, (participação económica / 10.000) × 50%)"
  },
  "explain.qualification.title": { en: "Academic Qualification Bonus (non-cumulative)", pt: "Bónus de Qualificação Académica (não-cumulativo)" },
  "explain.qualification.highest": {
    en: "Only the highest qualification bonus applies.",
    pt: "Apenas o bónus da qualificação mais elevada se aplica."
  },
  "explain.final.title": { en: "Final Adjustment", pt: "Ajuste Final" },
  "explain.final.p1": {
    en: "The result is rounded to the nearest quarter of a euro (0.25€).",
    pt: "O resultado é arredondado ao quarto de euro mais próximo (0,25€)."
  },
  "explain.serviceTypes.title": { en: "Service Types", pt: "Tipos de Serviço" },
  "explain.serviceTypes.commercial": {
    en: "For services to third parties, invoiced through the cooperative. The cooperative adds a {pct}% margin (= floor(VAT x 2/3)) on the member's rate, plus VAT based on the client's country. The member's effective fee is reduced when VAT is charged, as the cooperative recovers approximately half of the VAT through input deductions.",
    pt: "Para serviços a terceiros, faturados através da cooperativa. A cooperativa adiciona uma margem de {pct}% (= floor(IVA x 2/3)) sobre a taxa do membro, mais IVA conforme o país do cliente. A fee efetiva do membro é reduzida quando há IVA, pois a cooperativa recupera aproximadamente metade do IVA através de deduções."
  },
  "explain.serviceTypes.internal": {
    en: "For non-profit cooperative projects (workshops), projects the cooperative supports (Sigo), exchanges between members, or exchanges with associated startups. The member gives a {pct}% discount (equal to the cooperative margin). No cooperative margin is applied. No VAT. Rule: if the cooperative invoices the client, it is NOT internal.",
    pt: "Para projetos non-profit da cooperativa (workshops), projetos que a cooperativa apoia (Sigo), trocas entre membros, ou trocas com startups associadas. O membro dá um desconto de {pct}% (igual à margem cooperativa). Sem margem cooperativa. Sem IVA. Regra: se a cooperativa fatura ao cliente, NÃO é interno."
  },
  "explain.coopMargin.title": { en: "Cooperative Margin & VAT Recovery", pt: "Margem Cooperativa & Recuperação de IVA" },
  "explain.coopMargin.intro": {
    en: "All constants derive from the Portuguese VAT rate ({pct}%) through simple fractions:",
    pt: "Todas as constantes derivam da taxa de IVA portuguesa ({pct}%) através de frações simples:"
  },
  "explain.coopMargin.margin": { en: "Cooperative margin: floor(VAT x 2/3) =", pt: "Margem cooperativa: floor(IVA x 2/3) =" },
  "explain.coopMargin.recovery": { en: "VAT recovery: floor(clientVAT / 2)", pt: "Recuperação de IVA: floor(IVA_cliente / 2)" },
  "explain.coopMargin.minFee": { en: "Minimum fee: floor(margin / 3) =", pt: "Fee mínima: floor(margem / 3) =" },
  "explain.coopMargin.effectiveFee": { en: "Effective member fee: max(minFee, margin - recovery)", pt: "Fee efetiva do membro: max(feeMin, margem - recuperação)" },
  "explain.coopMargin.ptExample": {
    en: "For Portuguese clients (23% VAT): recovery = 11%, effective fee = max(5%, 15%-11%) = 5%",
    pt: "Para clientes portugueses (23% IVA): recuperação = 11%, fee efetiva = max(5%, 15%-11%) = 5%"
  },
  "explain.coopMargin.euExample": {
    en: "For EU B2B / non-EU (0% VAT): recovery = 0%, effective fee = 15%",
    pt: "Para EU B2B / fora da EU (0% IVA): recuperação = 0%, fee efetiva = 15%"
  },

  // MathJax section headers (these are inside HTML strings so handled separately)
  "mathjax.unifiedFormula": { en: "Unified Formula", pt: "Fórmula Unificada" },
  "mathjax.serviceFormulas": { en: "Service Type Formulas", pt: "Fórmulas de Tipo de Serviço" },

  // Footer
  "footer.language": { en: "Language:", pt: "Idioma:" },
} as const;

export type TranslationKey = keyof typeof translations;

export function createT(locale: Locale) {
  return function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    const entry = translations[key];
    let text: string = entry[locale] || entry.en;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  };
}

const LOCALE_KEY = "ctvc-calculator-locale";

export function getSavedLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved === "en" || saved === "pt") return saved;
  } catch {}
  return "pt";
}

export function saveLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {}
}
