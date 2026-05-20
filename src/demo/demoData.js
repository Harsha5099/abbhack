// ── Demo Pod Definitions ───────────────────────────────────────────────────────
export const DEMO_PODS = [
  { name: 'frontend-759775d795-rjtdf',        namespace: 'production',  base: 'frontend' },
  { name: 'api-gateway-5c6d7e8f-x9k2m',       namespace: 'production',  base: 'api-gateway' },
  { name: 'payment-service-3a4b5c-p8n1q',     namespace: 'production',  base: 'payment-service' },
  { name: 'auth-service-9f8e7d-a3b2c',        namespace: 'production',  base: 'auth-service' },
  { name: 'redis-cache-2b3c4d-r7s6t',         namespace: 'production',  base: 'redis-cache' },
  { name: 'postgres-db-6e7f8a-d4e5f',         namespace: 'production',  base: 'postgres-db' },
  { name: 'notification-svc-1a2b3c-n9m8l',    namespace: 'staging',     base: 'notification-svc' },
  { name: 'ml-inference-4d5e6f-m2n3o',        namespace: 'staging',     base: 'ml-inference' },
  { name: 'prometheus-0',                      namespace: 'monitoring',  base: 'prometheus' },
  { name: 'grafana-5f6g7h-g1h2i',             namespace: 'monitoring',  base: 'grafana' },
  { name: 'chaos-worker-8i9j0k-c5d6e',        namespace: 'testing',     base: 'chaos-worker' },
];

// Blast radius map
export const BLAST_RADIUS = {
  'frontend':         ['api-gateway', 'auth-service', 'notification-svc'],
  'api-gateway':      ['payment-service', 'auth-service', 'ml-inference', 'notification-svc'],
  'postgres-db':      ['api-gateway', 'payment-service', 'auth-service', 'notification-svc'],
  'redis-cache':      ['api-gateway', 'auth-service', 'notification-svc'],
  'payment-service':  ['notification-svc'],
  'auth-service':     ['frontend', 'api-gateway'],
  'chaos-worker':     ['ml-inference'],
  'prometheus':       ['grafana'],
};

// AI summaries per scenario
export const AI_SUMMARIES = {
  healthy: (pod) =>
    `Pod ${pod} is operating within normal parameters. All agent signals are green. CPU utilization is stable, memory consumption is well within limits, and no error patterns have been detected in the log stream. No immediate action is required. Continue standard monitoring cadence.`,

  warning: (pod) =>
    `Pod ${pod} is showing early signs of resource pressure. CPU utilization has crossed the 70% threshold and memory is trending upward at approximately +3% per minute. The CPU Agent has flagged throttling on 2 of 4 cores. Recommend proactive scaling to 2 replicas and reviewing recent deployments for memory leaks. Monitor closely over the next 5 minutes.`,

  critical: (pod) =>
    `CRITICAL: Pod ${pod} is in a degraded state. CPU has spiked to 94% — well above the 80% SLA threshold. Memory is at 89% and rising. The Log Agent has detected 47 ERROR entries in the last 5 minutes, primarily "connection refused" to postgres-db, indicating a downstream dependency failure. OOMKill risk is high within the next 3–5 minutes. Immediate action required: scale horizontally, increase memory limits to 512Mi, and investigate postgres-db connectivity.`,

  stress: (pod) =>
    `STRESS TEST ACTIVE on ${pod}. Synthetic CPU load injected via stress-ng. CPU at 97%, Memory at 91%. Z-score anomaly detected: 3.8σ above baseline — classified as CRITICAL anomaly. The Orchestrator Agent has correlated this spike with elevated network latency (+340ms p99) and increased error rate in downstream services. Auto-remediation suggestion: (1) Cordon node to prevent new scheduling, (2) Increase resource limits, (3) Enable HPA with CPU target 60%, (4) Alert on-call engineer via PagerDuty.`,
};

export const RECOMMENDATIONS = {
  healthy:  'No action required. System is stable.',
  warning:  'Scale deployment to 2 replicas. Enable HPA. Review memory allocation.',
  critical: 'Immediate: increase memory limit to 512Mi, scale to 3 replicas, check postgres-db connectivity.',
  stress:   'Cordon node. Scale horizontally. Enable HPA (CPU target 60%). Increase limits. Alert on-call.',
};

export const ROOT_CAUSES = {
  healthy:  'All systems nominal.',
  warning:  'CPU throttling detected. Memory growth trend identified.',
  critical: 'OOM pressure + downstream DB connection failures causing cascade.',
  stress:   'Synthetic stress-ng load injected. CPU/RAM exhaustion imminent.',
};

// Generate time-series history for a pod given a scenario
export function generateHistory(scenario, points = 30) {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => {
    const t = now - (points - 1 - i) * 15000;
    let cpu, mem, net, disk;

    if (scenario === 'healthy') {
      cpu  = 15 + Math.sin(i * 0.4) * 8  + (Math.random() - 0.5) * 4;
      mem  = 28 + Math.sin(i * 0.3) * 5  + (Math.random() - 0.5) * 3;
      net  = 5  + Math.random() * 8;
      disk = 2  + Math.random() * 3;
    } else if (scenario === 'warning') {
      const ramp = i / points;
      cpu  = 45 + ramp * 30 + (Math.random() - 0.5) * 8;
      mem  = 50 + ramp * 25 + (Math.random() - 0.5) * 5;
      net  = 15 + Math.random() * 20;
      disk = 5  + Math.random() * 8;
    } else if (scenario === 'critical') {
      const ramp = i / points;
      cpu  = 70 + ramp * 25 + (Math.random() - 0.5) * 5;
      mem  = 72 + ramp * 18 + (Math.random() - 0.5) * 4;
      net  = 30 + Math.random() * 30;
      disk = 10 + Math.random() * 15;
    } else { // stress
      const spike = i > points * 0.4 ? 1 : i / (points * 0.4);
      cpu  = 20 + spike * 77 + (Math.random() - 0.5) * 3;
      mem  = 25 + spike * 66 + (Math.random() - 0.5) * 3;
      net  = 5  + spike * 60 + Math.random() * 10;
      disk = 2  + spike * 20 + Math.random() * 5;
    }

    return {
      timestamp:    new Date(t).toISOString(),
      cpu_usage:    Math.max(1,  Math.min(100, parseFloat(cpu.toFixed(1)))),
      memory_usage: Math.max(5,  Math.min(100, parseFloat(mem.toFixed(1)))),
      network_io:   Math.max(0.1, parseFloat(net.toFixed(1))),
      disk_io:      Math.max(0.1, parseFloat(disk.toFixed(1))),
    };
  });
}

export function getHealthScore(scenario) {
  return { healthy: 92, warning: 54, critical: 22, stress: 11 }[scenario] ?? 92;
}

export function getSeverity(scenario) {
  return { healthy: 'Optimal', warning: 'Warning', critical: 'Critical', stress: 'Critical' }[scenario] ?? 'Optimal';
}

export function getCost(scenario) {
  return { healthy: 0.012, warning: 0.048, critical: 0.091, stress: 0.134 }[scenario] ?? 0.012;
}
