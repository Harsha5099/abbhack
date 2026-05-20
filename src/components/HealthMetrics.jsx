import { Shield, AlertTriangle, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function HealthGauge({ score }) {
  const clamped = Math.max(0, Math.min(100, score ?? 0));
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const arc = circ * 0.75;
  const offset = arc - (arc * clamped) / 100;

  const color =
    clamped >= 75 ? '#10b981' :
    clamped >= 45 ? '#f59e0b' : '#ef4444';

  const label =
    clamped >= 75 ? 'Healthy' :
    clamped >= 45 ? 'Degraded' : 'Critical';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg width="144" height="144" viewBox="0 0 144 144">
          {/* Track */}
          <circle
            cx="72" cy="72" r={radius}
            fill="none" stroke="#1e293b" strokeWidth="10"
            strokeDasharray={arc}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform="rotate(135 72 72)"
          />
          {/* Value arc */}
          <circle
            cx="72" cy="72" r={radius}
            fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={arc}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(135 72 72)"
            style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{clamped}</span>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color }}>{label}</span>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const s = (severity || 'optimal').toLowerCase();
  const cfg = {
    critical: { color: 'text-red-400', bg: 'bg-red-950/60 border-red-500/50', glow: 'glow-red', icon: '🔴', pulse: true },
    warning:  { color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-500/50', glow: 'glow-amber', icon: '🟡', pulse: true },
    optimal:  { color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-500/50', glow: 'glow-green', icon: '🟢', pulse: false },
  }[s] || { color: 'text-slate-400', bg: 'bg-slate-900/60 border-slate-500/30', glow: '', icon: '⚪', pulse: false };

  return (
    <div className={`flex flex-col items-center gap-3 p-4 rounded-xl border ${cfg.bg} ${cfg.glow}`}>
      <AlertTriangle size={20} className={cfg.color} />
      <div className="text-center">
        <div className={`text-2xl font-black uppercase tracking-widest ${cfg.color} ${cfg.pulse ? 'animate-pulse-glow' : ''}`}>
          {severity || 'Optimal'}
        </div>
        <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Anomaly Severity</div>
      </div>
      <div className={`w-full h-1 rounded-full ${s === 'critical' ? 'bg-red-500' : s === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}
        style={{ boxShadow: `0 0 8px currentColor` }} />
    </div>
  );
}

function CostMeter({ cost, recommendation }) {
  const costNum = parseFloat(cost) || 0;
  const trend = costNum > 0.05 ? 'up' : costNum > 0.02 ? 'flat' : 'down';

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-cyan-500/20 bg-slate-900/40">
      <div className="flex items-center gap-2">
        <DollarSign size={16} className="text-cyan-400" />
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Financial Footprint</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-black text-cyan-400 glow-text-cyan">
          ${costNum.toFixed(4)}
        </span>
        <span className="text-slate-500 text-xs mb-1">/hr</span>
        {trend === 'up' && <TrendingUp size={16} className="text-red-400 mb-1" />}
        {trend === 'down' && <TrendingDown size={16} className="text-emerald-400 mb-1" />}
        {trend === 'flat' && <Minus size={16} className="text-amber-400 mb-1" />}
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
          style={{ width: `${Math.min(100, costNum * 1000)}%`, boxShadow: '0 0 6px #06b6d4' }}
        />
      </div>
      {recommendation && (
        <div className="text-[10px] text-slate-400 border-t border-slate-700/50 pt-2 leading-relaxed">
          <span className="text-cyan-600">💡 </span>{recommendation}
        </div>
      )}
    </div>
  );
}

export default function HealthMetrics({ data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-4 space-y-3">
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-3 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Health Score */}
      <div className="glass-card p-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 w-full mb-1">
          <Shield size={13} className="text-cyan-400" />
          <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Health Score</span>
        </div>
        <HealthGauge score={data?.health_score} />
      </div>

      {/* Severity */}
      <div className="glass-card p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={13} className="text-amber-400" />
          <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Anomaly Status</span>
        </div>
        <SeverityBadge severity={data?.severity} />
        {data?.root_cause && (
          <div className="text-[10px] text-slate-400 mt-1 leading-relaxed border-t border-slate-700/40 pt-2">
            <span className="text-red-400">Root Cause: </span>
            <span className="break-words">{data.root_cause}</span>
          </div>
        )}
      </div>

      {/* Cost */}
      <div className="glass-card p-4 flex flex-col gap-2">
        <CostMeter cost={data?.estimated_cost} recommendation={data?.recommendation} />
      </div>
    </div>
  );
}
