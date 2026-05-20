import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ChevronDown, ChevronUp, Zap } from 'lucide-react';

// Derive anomaly events from pod list — flags pods with low health or bad status
function deriveAnomalies(pods) {
  const events = [];
  pods.forEach((pod) => {
    const score = pod.health_score;
    const status = (pod.status || '').toLowerCase();

    if (status === 'crashloopbackoff' || status === 'error' || status === 'failed') {
      events.push({
        id: `${pod.name}-status`,
        pod: pod.name,
        namespace: pod.namespace,
        metric: 'Status',
        severity: 'critical',
        message: `Pod in ${pod.status} state`,
        time: new Date().toLocaleTimeString(),
      });
    } else if (typeof score === 'number' && score < 40) {
      events.push({
        id: `${pod.name}-health`,
        pod: pod.name,
        namespace: pod.namespace,
        metric: 'Health Score',
        severity: 'critical',
        message: `Health score critically low: ${score}/100`,
        time: new Date().toLocaleTimeString(),
      });
    } else if (typeof score === 'number' && score < 65) {
      events.push({
        id: `${pod.name}-warn`,
        pod: pod.name,
        namespace: pod.namespace,
        metric: 'Health Score',
        severity: 'warning',
        message: `Health score degraded: ${score}/100`,
        time: new Date().toLocaleTimeString(),
      });
    }
  });
  return events;
}

function severityStyle(s) {
  if (s === 'critical') return {
    dot: 'bg-red-500',
    badge: 'bg-red-950/60 text-red-300 border-red-500/40',
    border: 'border-l-red-500',
    glow: 'hover:glow-red',
  };
  if (s === 'warning') return {
    dot: 'bg-amber-400',
    badge: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    border: 'border-l-amber-500',
    glow: 'hover:glow-amber',
  };
  return {
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
    border: 'border-l-emerald-500',
    glow: 'hover:glow-green',
  };
}

export default function AnomalyTimeline({ pods, onSelectPod }) {
  const [expanded, setExpanded] = useState(true);
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    setAnomalies(deriveAnomalies(pods));
  }, [pods]);

  return (
    <div className="glass-card mx-4 mb-3 overflow-hidden shrink-0">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-2 px-4 py-2.5 border-b border-slate-700/40 hover:bg-slate-800/20 transition-colors"
      >
        <Zap size={13} className="text-amber-400" />
        <span className="text-[11px] text-amber-400 uppercase tracking-widest font-bold">
          Anomaly Timeline
        </span>
        {anomalies.length > 0 && (
          <span className="ml-1 px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 text-[9px] font-bold animate-pulse-glow">
            {anomalies.filter(a => a.severity === 'critical').length} critical
          </span>
        )}
        <span className="ml-auto text-[9px] text-slate-600">{anomalies.length} events</span>
        {expanded
          ? <ChevronUp size={12} className="text-slate-500" />
          : <ChevronDown size={12} className="text-slate-500" />
        }
      </button>

      {expanded && (
        <div className="max-h-36 overflow-y-auto">
          {anomalies.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-4 text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
              <span className="text-[11px]">All systems nominal — no anomalies detected</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/40">
              {anomalies.map((ev) => {
                const s = severityStyle(ev.severity);
                return (
                  <button
                    key={ev.id}
                    onClick={() => onSelectPod && onSelectPod({ name: ev.pod, namespace: ev.namespace })}
                    className={`w-full text-left flex items-center gap-3 px-4 py-2.5 border-l-2 ${s.border} ${s.glow} hover:bg-slate-800/30 transition-all`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot} ${ev.severity === 'critical' ? 'animate-pulse-glow' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-200 truncate">{ev.pod}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded border font-bold uppercase ${s.badge}`}>
                          {ev.severity}
                        </span>
                        <span className="text-[9px] text-slate-600 ml-auto shrink-0">{ev.metric}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{ev.message}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-[9px] text-slate-600">
                      <Clock size={9} />
                      {ev.time}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
