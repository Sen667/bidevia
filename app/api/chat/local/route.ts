import { NextResponse } from 'next/server';
import {
  getCatastropheNaturelles,
  getDegatsDesEaux,
  getIncendiesRaw,
  getInondations,
} from '@/lib/postgres';

type ChatRole = 'system' | 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type LmStudioChoice = {
  message?: {
    role?: string;
    content?: string;
  };
};

type LmStudioResponse = {
  choices?: LmStudioChoice[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  model?: string;
  error?: {
    message?: string;
  };
};

type IncidentLike = {
  id?: string;
  category?: string;
  city?: string;
  ville?: string;
  title?: string;
  summary?: string;
  resume?: string;
  severity_index?: number;
  gravite?: number;
  incident_date?: string;
  publication_date?: string;
  created_at?: string;
  date?: string;
};

type OperationalSnapshot = {
  windowHours: number;
  totalInWindow: number;
  highlights: string[];
  contextText: string;
};

const ALLOWED_ROLES: ChatRole[] = ['system', 'user', 'assistant'];

function parseIncidentTimestamp(incident: IncidentLike): number {
  const rawDate =
    incident.incident_date || incident.publication_date || incident.created_at || incident.date || '';
  if (!rawDate) return 0;

  const timestamp = new Date(rawDate).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function toSeverity(incident: IncidentLike): number {
  return Number(incident.severity_index ?? incident.gravite ?? 0) || 0;
}

function summarizeIncident(incident: IncidentLike): string {
  const severity = toSeverity(incident);
  const city = incident.city || incident.ville || 'Ville inconnue';
  const category = incident.category || 'incident';
  const title = (incident.title || incident.summary || incident.resume || 'Sans titre').slice(0, 160);
  const dateRaw = incident.incident_date || incident.publication_date || incident.created_at || incident.date || '';
  const date = dateRaw ? new Date(dateRaw).toLocaleString('fr-FR') : 'Date inconnue';
  return `- [${category}] gravite ${severity} | ${city} | ${date} | ${title}`;
}

async function buildOperationalSnapshot(windowHours: number): Promise<OperationalSnapshot> {
  const safeWindowHours = Number.isFinite(windowHours)
    ? Math.min(Math.max(Math.floor(windowHours), 1), 24 * 14)
    : 24;

  try {
    const [incendies, catastrophes, inondations, degats] = await Promise.all([
      getIncendiesRaw(),
      getCatastropheNaturelles(),
      getInondations(),
      getDegatsDesEaux(),
    ]);

    const allIncidents = [
      ...(incendies as IncidentLike[]),
      ...(catastrophes as IncidentLike[]),
      ...(inondations as IncidentLike[]),
      ...(degats as IncidentLike[]),
    ];

    const now = Date.now();
    const threshold = now - safeWindowHours * 60 * 60 * 1000;

    const incidentsInWindow = allIncidents
      .map((incident) => ({
        ...incident,
        _ts: parseIncidentTimestamp(incident),
      }))
      .filter((incident) => incident._ts > 0 && incident._ts >= threshold)
      .sort((a, b) => b._ts - a._ts);

    const highlights = incidentsInWindow.slice(0, 12).map((incident) => summarizeIncident(incident));
    const contextText = [
      `Horodatage serveur: ${new Date(now).toLocaleString('fr-FR')}`,
      `Incidents (tous types) sur ${safeWindowHours}h: ${incidentsInWindow.length}`,
      highlights.length > 0
        ? `Top incidents recents:\n${highlights.join('\n')}`
        : `Top incidents recents: aucun incident detecte sur les ${safeWindowHours} dernieres heures.`,
    ].join('\n');

    return {
      windowHours: safeWindowHours,
      totalInWindow: incidentsInWindow.length,
      highlights,
      contextText,
    };
  } catch {
    return {
      windowHours: safeWindowHours,
      totalInWindow: 0,
      highlights: [],
      contextText: 'Contexte operationnel indisponible: impossible de charger les incidents depuis la base.',
    };
  }
}

function buildDirect24hSummary(snapshot: OperationalSnapshot): string {
  if (snapshot.totalInWindow === 0) {
    return [
      `Synthese ${snapshot.windowHours}h: aucun incident detecte sur les ${snapshot.windowHours} dernieres heures.`,
      'Action: verifier la pipeline de collecte et l arrivee des flux si vous attendiez des evenements.',
    ].join('\n');
  }

  return [
    `Synthese ${snapshot.windowHours}h: ${snapshot.totalInWindow} incident(s) detecte(s).`,
    'Principaux incidents recents:',
    ...snapshot.highlights.slice(0, 8),
    'Action: prioriser les incidents les plus recents et confirmer les moyens engages pour ceux en cours.',
  ].join('\n');
}

function extractRequestedHours(question: string): number | null {
  const normalized = question.toLowerCase();
  const patterns = [/\b(\d{1,3})\s*h\b/, /\b(\d{1,3})\s*heures?\b/, /\bdernier(?:e|es)?\s+(\d{1,3})\b/];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (!match) continue;
    const value = Number.parseInt(match[1], 10);
    if (Number.isFinite(value) && value > 0) {
      return Math.min(value, 24 * 14);
    }
  }

  return null;
}

function shouldUseDirect24hSummary(question: string): boolean {
  const normalized = question.toLowerCase();
  const asksSummary = /resume|synthese|point de situation|briefing|situation operationnel/.test(normalized);
  const asksIncidents = /incident|incendie|inondation|sinistre|catastrophe|operationnel/.test(normalized);
  const asksWindow = extractRequestedHours(normalized) !== null;
  return asksSummary || (asksIncidents && asksWindow);
}

function sanitizeMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message): message is ChatMessage => {
      if (!message || typeof message !== 'object') return false;
      const role = (message as ChatMessage).role;
      const content = (message as ChatMessage).content;
      return ALLOWED_ROLES.includes(role) && typeof content === 'string';
    })
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-20);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userMessages = sanitizeMessages(body?.messages);

    if (userMessages.length === 0) {
      return NextResponse.json(
        { error: 'Aucun message valide fourni.' },
        { status: 400 }
      );
    }

    const latestUserMessage = [...userMessages].reverse().find((message) => message.role === 'user');
    const requestedHours = latestUserMessage ? extractRequestedHours(latestUserMessage.content) || 24 : 24;

    if (latestUserMessage && shouldUseDirect24hSummary(latestUserMessage.content)) {
      const snapshot = await buildOperationalSnapshot(requestedHours);
      return NextResponse.json({
        reply: buildDirect24hSummary(snapshot),
        model: 'server-direct-summary',
        usage: null,
      });
    }

    const lmStudioBaseUrl = process.env.LM_STUDIO_BASE_URL || 'http://127.0.0.1:1234';
    const model = process.env.LM_STUDIO_MODEL || 'openai/gpt-oss-20b';
    const temperature = Number(process.env.LM_STUDIO_TEMPERATURE || '0.4');
    const maxTokens = Number(process.env.LM_STUDIO_MAX_TOKENS || '600');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);

    const snapshot = await buildOperationalSnapshot(requestedHours);
    const operationalContext = snapshot.contextText;

    const systemPrompt: ChatMessage = {
      role: 'system',
      content:
        "Tu es l'assistant IA local de JDEWATCH. Réponds en français, de manière concise, utile et orientée opérationnel. N'invente pas de données. Utilise d'abord le contexte opérationnel interne ci-dessous. Si le contexte contient des données, ne dis pas que tu n'y as pas accès. Si aucune donnée critique n'est disponible, propose une synthèse courte et actionnable.",
    };

    const contextPrompt: ChatMessage = {
      role: 'system',
      content: `Contexte operationnel interne (source: PostgreSQL JDEWATCH):\n${operationalContext}`,
    };

    const response = await fetch(`${lmStudioBaseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [systemPrompt, contextPrompt, ...userMessages],
        temperature,
        max_tokens: maxTokens,
        stream: false,
      }),
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeout);

    const payload = (await response.json().catch(() => ({}))) as LmStudioResponse;

    if (!response.ok) {
      const errorMessage = payload?.error?.message || 'LM Studio a renvoyé une erreur.';
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const reply = payload?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json(
        { error: "Réponse vide reçue depuis LM Studio." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      reply,
      model: payload.model || model,
      usage: payload.usage || null,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'Timeout: LM Studio ne répond pas. Vérifiez que le serveur local est démarré.'
        : 'Impossible de contacter LM Studio local.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
