// ── Mock data for demo / offline mode ─────────────────────────────────────────
export const MOCK_PODS = [
  { name: 'frontend-deployment-7d9f8b',  namespace: 'production',  status: 'Running', health_score: 88, node: 'node-1' },
  { name: 'api-gateway-5c6d7e8f',        namespace: 'production',  status: 'Running', health_score: 72, node: 'node-1' },
  { name: 'payment-service-3a4b5c',      namespace: 'production',  status: 'Running', health_score: 91, node: 'node-2' },
  { name: 'auth-service-9f8e7d',         namespace: 'production',  status: 'Running', health_score: 55, node: 'node-2' },
  { name: 'redis-cache-2b3c4d',          namespace: 'production',  status: 'Running', health_score: 95, node: 'node-1' },
  { name: 'postgres-db-6e7f8a',          namespace: 'production',  status: 'Running', health_score: 83, node: 'node-3' },
  { name: 'notification-svc-1a2b3c',     namespace: 'staging',     status: 'Pending', health_score: 42, node: 'node-2' },
  { name: 'ml-inference-4d5e6f',         namespace: 'staging',     status: 'Running', health_score: 67, node: 'node-3' },
  { name: 'log-aggregator-7g8h9i',       namespace: 'monitoring',  status: 'Running', health_score: 78, node: 'node-1' },
  { name: 'prometheus-0',                namespace: 'monitoring',  status: 'Running', health_score: 96, node: 'node-2' },
  { name: 'grafana-5f6g7h',              namespace: 'monitoring',  status: 'Running', health_score: 89, node: 'node-3' },
  { name: 'chaos-worker-8i9j0k',         namespace: 'testing',     status: 'Failed',  health_score: 18, node: 'node-1' },
  { name: 'stress-ng-test-2l3m4n',       namespace: 'testing',     status: 'Pending', health_score: 31, node: 'node-2' },
  { name: 'inventory-svc-5o6p7q',        namespace: 'production',  status: 'Running', health_score: 74, node: 'node-3' },
  { name: 'email-worker-8r9s0t',         namespace: 'production',  status: 'Running', health_score: 62, node: 'node-1' },
];

function randBetween(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

export function MOCK_ANALYSIS(podName) {
  const pod = MOCK_PODS.find(p => p.name === podName) || MOCK_PODS[0];
  const score = pod.health_score;
  const severity = score >= 75 ? 'Optimal' : score >= 45 ? 'Warning' : 'Critical';
  return {
    health_score: score,
    severity,
    root_cause: score < 45
      ? 'High memory pressure detected. OOMKilled events in last 15 minutes. Container restart loop initiated.'
      : score < 75
      ? 'CPU throttling observed. Request latency p99 elevated above SLA threshold.'
      : 'All systems operating within normal parameters.',
    recommendation: score < 45
      ? 'Increase memory limit to 512Mi. Consider horizontal pod autoscaling. Check for memory leaks in application code.'
      : score < 75
      ? 'Scale deployment to 3 replicas. Review CPU requests/limits ratio. Enable HPA with CPU target 70%.'
      : 'No action required. Continue monitoring.',
    ai_summary: `Pod ${podName} is currently in ${severity.toLowerCase()} state with a health score of ${score}/100. ${
      severity === 'Critical'
        ? 'Immediate intervention recommended. Multiple agent signals indicate resource exhaustion.'
        : severity === 'Warning'
        ? 'Proactive scaling recommended before degradation escalates to critical.'
        : 'All agent signals are green. Resource utilization is optimal.'
    }`,
    estimated_cost: randBetween(0.001, 0.12),
    cpu_usage: randBetween(10, 95),
    memory_usage: randBetween(20, 90),
    agent_analysis: {
      cpu_agent: `CPU utilization at ${randBetween(10,95).toFixed(1)}%. ${score < 60 ? 'Throttling detected on 3 of 4 cores. Burst limit exceeded.' : 'Within normal operating range. No throttling events.'}`,
      memory_agent: `Heap usage ${randBetween(100,480).toFixed(0)}Mi / 512Mi. ${score < 60 ? 'GC pressure high. OOM risk in ~8 minutes at current growth rate.' : 'Memory stable. No leak patterns detected.'}`,
      network_agent: `Ingress ${randBetween(1,50).toFixed(1)} MB/s · Egress ${randBetween(0.5,20).toFixed(1)} MB/s. ${score < 60 ? 'Packet retransmit rate elevated: 2.3%.' : 'Network I/O nominal.'}`,
      log_agent: `${score < 60 ? '47 ERROR entries in last 5 min. Pattern: "connection refused" to postgres-db. Possible DB overload.' : '2 WARN entries. No ERROR patterns. Log volume normal.'}`,
    },
  };
}

export function MOCK_BLAST_RADIUS(podName) {
  const downstream = {
    'api-gateway-5c6d7e8f':    ['frontend-deployment-7d9f8b', 'payment-service-3a4b5c', 'auth-service-9f8e7d'],
    'postgres-db-6e7f8a':      ['api-gateway-5c6d7e8f', 'payment-service-3a4b5c', 'inventory-svc-5o6p7q', 'auth-service-9f8e7d'],
    'redis-cache-2b3c4d':      ['api-gateway-5c6d7e8f', 'auth-service-9f8e7d', 'notification-svc-1a2b3c'],
    'auth-service-9f8e7d':     ['frontend-deployment-7d9f8b', 'api-gateway-5c6d7e8f'],
    'payment-service-3a4b5c':  ['frontend-deployment-7d9f8b', 'notification-svc-1a2b3c', 'email-worker-8r9s0t'],
    'chaos-worker-8i9j0k':     ['stress-ng-test-2l3m4n'],
  };
  const affected = downstream[podName] || ['log-aggregator-7g8h9i'];
  const impact = affected.length >= 3 ? 'Critical' : affected.length >= 2 ? 'High' : 'Medium';
  return { affected_services: affected, impact_level: impact };
}

export function MOCK_HISTORY(podName) {
  const pod = MOCK_PODS.find(p => p.name === podName) || MOCK_PODS[0];
  const base = pod.health_score;
  const now = Date.now();
  return Array.from({ length: 30 }, (_, i) => {
    const jitter = () => randBetween(-12, 12);
    return {
      timestamp: new Date(now - (29 - i) * 30000).toISOString(),
      cpu_usage:    Math.max(2,  Math.min(100, (100 - base) + 20 + jitter())),
      memory_usage: Math.max(5,  Math.min(100, (100 - base) + 15 + jitter())),
      network_io:   Math.max(0.1, randBetween(1, 40)),
      disk_io:      Math.max(0.1, randBetween(0.5, 15)),
    };
  });
}
