import path from "path";

const INTENT_KEYWORDS = {
  greeting: ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"],
  product_interest: ["interesse", "quero saber", "mostrar", "produto"],
  price_question: ["preço", "preco", "valor", "quanto custa", "tarifa"],
  appointment_request: ["agendar", "agenda", "horário", "reunião", "reuniao", "marcar"],
  support_request: ["suporte", "ajuda", "erro", "dúvida técnica", "duvida tecnica", "problema"],
  negotiation: ["negociar", "negociação", "negociacao", "condição", "condicao"],
  purchase_intent: ["comprar", "fechar", "contratar", "assinatura"],
};

const INTENT_PRIORITY = [
  "appointment_request",
  "price_question",
  "purchase_intent",
  "support_request",
  "negotiation",
  "product_interest",
  "greeting",
];

const HUMAN_KEYWORDS = ["humano", "atendente", "vendedor", "assistente"].map((s) =>
  s.toLowerCase(),
);

export function classifyIntent(text = "") {
  const normalized = text.toLowerCase();
  for (const intent of INTENT_PRIORITY) {
    const keywords = INTENT_KEYWORDS[intent] || [];
    if (keywords.some((kw) => normalized.includes(kw))) {
      return intent;
    }
  }
  if (normalized.trim().length === 0) return "general_question";
  return "general_question";
}

export function classifyTemperature({ intent, text = "" }) {
  const normalized = text.toLowerCase();
  if (intent === "price_question" || intent === "purchase_intent") return "QUENTE";
  if (intent === "negotiation" || intent === "appointment_request") return "MORNO";
  if (normalized.includes("proposta")) return "QUENTE";
  if (normalized.includes("interesse")) return "MORNO";
  return "FRIO";
}

export function chooseAgent(intent, wantsHuman, leadState = "") {
  if (wantsHuman)
    return {
      selected_agent: "HUMAN",
      action: "delegate_human",
      notes: "Cliente pediu humano",
    };
  switch (intent) {
    case "price_question":
    case "negotiation":
    case "purchase_intent":
      return {
        selected_agent: "SALES_AGENT",
        action: "present_product",
        notes: "Negociação / preço",
      };
    case "appointment_request":
      return {
        selected_agent: "SCHEDULER_AGENT",
        action: "schedule_meeting",
        notes: "Pedido de reunião",
      };
    case "support_request":
      return {
        selected_agent: "SUPPORT_AGENT",
        action: "support_answer",
        notes: "Suporte",
      };
    case "product_interest":
      return {
        selected_agent: "SDR_AGENT",
        action: "present_product",
        notes: "Interesse",
      };
    case "greeting":
    case "general_question":
    default:
      return {
        selected_agent: "SDR_AGENT",
        action: "respond",
        notes: "Qualificação",
      };
  }
}

function buildConversationSummary(messages = []) {
  return messages
    .slice(-5)
    .map((msg) => `${msg.role === "assistant" ? "IA" : "Cliente"}: ${msg.content || "..."}`)
    .join(" | ");
}

export async function orchestrateConversation({
  pool,
  log,
  organizationId,
  agentId,
  remoteJid,
  messages = [],
  lastIntent,
  leadStage,
}) {
  const phone = remoteJid.split("@")[0];
  const leadRes = await pool.query(
    "SELECT id FROM leads WHERE organization_id = $1 AND phone LIKE $2 ORDER BY created_at DESC LIMIT 1",
    [organizationId, `%${phone}%`],
  );
  const leadId = leadRes.rows[0]?.id || null;

  const companyProfileRes = await pool.query(
    "SELECT company_name, main_product, product_price, agent_objective, desired_revenue FROM ia_configs WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1",
    [organizationId],
  );
  const companyProfile = companyProfileRes.rows[0] || {};

  const memRes = leadId
    ? await pool.query("SELECT * FROM lead_memory WHERE organization_id = $1 AND lead_id = $2", [
        organizationId,
        leadId,
      ])
    : null;
  const leadMemory = memRes?.rows[0] || {};

  const recentMessagesRes = await pool.query(
    "SELECT role, content, created_at FROM chat_messages WHERE agent_id = $1 AND remote_jid = $2 ORDER BY created_at DESC LIMIT 8",
    [agentId, remoteJid],
  );
  const recentMessages = recentMessagesRes.rows.reverse();

  const summarizedMessages = buildConversationSummary(recentMessages);
  const intentText = messages.map((m) => m.content).join(" ") || summarizedMessages;
  const intent = classifyIntent(intentText);
  const leadTemperature = classifyTemperature({ intent, text: intentText });

  const wantsHuman = HUMAN_KEYWORDS.some((keyword) => intentText.includes(keyword));
  const { selected_agent, action, notes } = chooseAgent(intent, wantsHuman, leadStage);

  const decision = {
    intent,
    lead_temperature: leadTemperature,
    selected_agent,
    action,
    notes,
    lead_id: leadId,
    organization_id: organizationId,
    metadata: {
      company_profile: companyProfile,
      recent_messages: recentMessages,
      conversation_summary: summarizedMessages,
      lead_memory: leadMemory,
      last_intent: lastIntent,
      lead_stage: leadStage,
    },
    created_at: new Date(),
  };

  await pool.query(
    `INSERT INTO conversation_decisions (organization_id, lead_id, intent, lead_temperature, agent_key, action, notes, metadata, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      decision.organization_id,
      decision.lead_id,
      decision.intent,
      decision.lead_temperature,
      decision.selected_agent,
      decision.action,
      decision.notes,
      JSON.stringify(decision.metadata),
      decision.created_at,
    ],
  );

  if (leadId) {
    const params = [organizationId, leadId];
    const setClauses = [
      `last_intent = $${params.length + 1}`,
      `last_temperature = $${params.length + 2}`,
      `last_agent_decision = $${params.length + 3}`,
    ];
    params.push(decision.intent, decision.lead_temperature, decision.selected_agent);
    await pool.query(
      `UPDATE lead_memory SET ${setClauses.join(", ")}, updated_at = NOW() WHERE organization_id = $1 AND lead_id = $2`,
      params,
    );
  }

  log(
    `[ORCHESTRATOR] intent=${decision.intent} temp=${decision.lead_temperature} agent=${decision.selected_agent} action=${decision.action}`,
  );

  return decision;
}

export async function ensureConversationDecisionsTable(pool, log) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversation_decisions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id TEXT NOT NULL,
        lead_id TEXT,
        intent TEXT NOT NULL,
        lead_temperature TEXT NOT NULL,
        agent_key TEXT NOT NULL,
        action TEXT NOT NULL,
        notes TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_convdec_org ON conversation_decisions(organization_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_convdec_lead ON conversation_decisions(lead_id)`);
  } catch (err) {
    log(`[ORCHESTRATOR] ensureConversationDecisionsTable error: ${err.message}`);
  }
}

export async function ensureProfessorInsightsTable(pool, log) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales_professor_insights (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id TEXT NOT NULL,
        metric_date DATE NOT NULL,
        metric_type TEXT NOT NULL,
        payload JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (organization_id, metric_date, metric_type)
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_prof_insights_org ON sales_professor_insights(organization_id)`);
  } catch (err) {
    log(`[ORCHESTRATOR] ensureProfessorInsightsTable error: ${err.message}`);
  }
}

export async function computeProfessorInsights(pool, log) {
  try {
    const orgs = await pool.query("SELECT id FROM organizations");
    const today = new Date();
    const metricDate = today.toISOString().split("T")[0];
    for (const org of orgs.rows) {
      const hotLeadsRes = await pool.query(
        `SELECT COUNT(*)::int as count FROM lead_memory WHERE organization_id = $1 AND lead_urgent = TRUE AND updated_at < NOW() - INTERVAL '2 hours'`,
        [org.id],
      );
      const hotIgnored = hotLeadsRes.rows[0]?.count || 0;

      const responseRes = await pool.query(
        `SELECT AVG(EXTRACT(EPOCH FROM (assistant.created_at - user.created_at))) as avg_response
           FROM chat_messages user
           JOIN chat_messages assistant ON assistant.agent_id = user.agent_id
             AND assistant.remote_jid = user.remote_jid
             AND assistant.role = 'assistant'
             AND assistant.created_at > user.created_at
           WHERE user.organization_id = $1 AND user.role = 'user'`,
        [org.id],
      );
      const avgResponse = Number(responseRes.rows[0]?.avg_response || 0);

      const lostRes = await pool.query(
        `SELECT COUNT(*)::int as count FROM leads WHERE organization_id = $1 AND LOWER(status) = 'perdido' AND NOW() - created_at > INTERVAL '7 days'`,
        [org.id],
      );
      const lostLeads = lostRes.rows[0]?.count || 0;

      await pool.query(
        `INSERT INTO sales_professor_insights (organization_id, metric_date, metric_type, payload)
           VALUES ($1, $2, 'daily', $3)
           ON CONFLICT (organization_id, metric_date, metric_type)
           DO UPDATE SET payload = EXCLUDED.payload, created_at = NOW()`,
        [
          org.id,
          metricDate,
          JSON.stringify({ hot_leads_ignored: hotIgnored, avg_response_seconds: avgResponse, lost_leads_older_than_7d: lostLeads }),
        ],
      );
    }
    log("[PROFESSOR] Insights refreshed");
  } catch (err) {
    log(`[PROFESSOR] computeProfessorInsights error: ${err.message}`);
  }
}

export async function fetchProfessorInsights(pool, organizationId) {
  const res = await pool.query(
    `SELECT payload, metric_date FROM sales_professor_insights WHERE organization_id = $1 ORDER BY metric_date DESC LIMIT 1`,
    [organizationId],
  );
  return res.rows[0] || { payload: {}, metric_date: null };
}
