// ── API Configuration ──────────────────────────────────────────────────────────
export const M2_BASE = 'http://127.0.0.1:8000';   // Member 2 — AI backend
export const M1_BASE = 'https://payment-surfboard-think.ngrok-free.dev'; // Member 1 — metrics

const TIMEOUT = 12000;

async function get(url) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'ngrok-skip-browser-warning': 'true' },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
    return await res.json();
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

// ── Pods — use Member 2 (pulls from Member 1 internally) ──────────────────────
export async function fetchPods() {
  const data = await get(`${M2_BASE}/pods`);
  return Array.isArray(data) ? data : data?.pods || data?.items || [];
}

// ── Full AI analysis for a pod ─────────────────────────────────────────────────
export async function analyzePod(name) {
  const data = await get(`${M2_BASE}/analyze/${encodeURIComponent(name)}`);
  // Normalise field names so the UI always gets consistent keys
  return {
    health_score:    data.health_score   ?? 0,
    severity:        data.severity       ?? 'unknown',
    root_cause:      data.root_cause     ?? '',
    recommendation:  data.recommendation ?? '',
    ai_summary:      data.ai_summary     ?? '',
    estimated_cost:  data.estimated_cost ?? data.estimated_cost_usd ?? 0,
    cpu_usage:       data.agents?.cpu?.cpu_value       ?? 0,
    memory_usage:    data.agents?.memory?.memory_value ?? 0,
    agent_analysis: {
      cpu_agent:     data.agent_analysis?.cpu_agent     ?? data.agents?.cpu?.issue     ?? '',
      memory_agent:  data.agent_analysis?.memory_agent  ?? data.agents?.memory?.issue  ?? '',
      network_agent: data.agent_analysis?.network_agent ?? data.agents?.network?.issue ?? '',
      log_agent:     data.agent_analysis?.log_agent     ?? data.agents?.logs?.issue    ?? '',
    },
    _raw: data,
  };
}

// ── Blast radius ───────────────────────────────────────────────────────────────
export async function fetchBlastRadius(name) {
  const data = await get(`${M2_BASE}/blast-radius/${encodeURIComponent(name)}`);
  return {
    affected_services: data.affected_services ?? [],
    impact_level:      data.impact_level      ?? 'Low',
  };
}

// ── Metric history ─────────────────────────────────────────────────────────────
export async function fetchHistory(name) {
  const data = await get(`${M2_BASE}/history/${encodeURIComponent(name)}`);
  const raw  = Array.isArray(data) ? data : data?.history ?? data?.data ?? [];
  // Normalise field names for the chart
  return raw.map(pt => ({
    timestamp:    pt.timestamp,
    cpu_usage:    pt.cpu    ?? pt.cpu_usage    ?? 0,
    memory_usage: pt.memory ?? pt.memory_usage ?? 0,
    network_io:   pt.network_rx ?? pt.network_io ?? 0,
    disk_io:      pt.disk   ?? pt.disk_io      ?? 0,
  }));
}

// ── NLP chat ──────────────────────────────────────────────────────────────────
export async function askNLP(query) {
  const data = await get(`${M2_BASE}/ask?query=${encodeURIComponent(query)}`);
  return { response: data.answer ?? data.response ?? data.result ?? JSON.stringify(data) };
}

// ── Cost estimate ─────────────────────────────────────────────────────────────
export async function fetchCost(name) {
  const data = await get(`${M2_BASE}/cost/${encodeURIComponent(name)}`);
  return data.estimated_cost_usd ?? data.cost ?? 0;
}

// ── Member 1 direct endpoints ─────────────────────────────────────────────────
export async function fetchM1Pods() {
  return get(`${M1_BASE}/pods`);
}

export async function fetchM1Metrics(podName) {
  return get(`${M1_BASE}/metrics/${encodeURIComponent(podName)}`);
}

export async function fetchM1Logs(podName) {
  return get(`${M1_BASE}/logs/${encodeURIComponent(podName)}`);
}

export async function fetchM1Snapshots() {
  return get(`${M1_BASE}/snapshots`);
}
