import { Activity, Server, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color, glow }) {
  return (
    <div className={`glass-card p-4 flex items-center gap-3 ${glow}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color.bg}`}>
        <Icon size={18} className={color.text} />
      </div>
      <div className="min-w-0">
        <div className={`text-2xl font-black leading-none ${color.text}`}>{value}</div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{label}</div>
        {sub && <div className="text-[9px] text-slate-600 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function ClusterOverview({ pods }) {
  const total    = pods.length;
  const running  = pods.filter(p => (p.status || '').toLowerCase() === 'running').length;
  const pending  = pods.filter(p => (p.status || '').toLowerCase() === 'pending').length;
  const failed   = pods.filter(p => !['running','pending'].includes((p.status||'').toLowerCase())).length;
  const namespaces = [...new Set(pods.map(p => p.namespace).filter(Boolean))].length;

  const healthScores = pods.map(p => p.health_score).filter(n => typeof n === 'number');
  const avgHealth = healthScores.length
    ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
    : null;

  return (
    <div className="grid grid-cols-5 gap-3 px-4 pt-3 pb-1 shrink-0">
      <StatCard
        icon={Server}
        label="Total Pods"
        value={total}
        sub={`${namespaces} namespace${namespaces !== 1 ? 's' : ''}`}
        color={{ text: 'text-cyan-400', bg: 'bg-cyan-950/50' }}
        glow="hover:glow-cyan transition-all"
      />
      <StatCard
        icon={CheckCircle}
        label="Running"
        value={running}
        sub={total ? `${Math.round((running/total)*100)}% healthy` : '—'}
        color={{ text: 'text-emerald-400', bg: 'bg-emerald-950/50' }}
        glow="hover:glow-green transition-all"
      />
      <StatCard
        icon={Clock}
        label="Pending"
        value={pending}
        sub="awaiting schedule"
        color={{ text: 'text-amber-400', bg: 'bg-amber-950/50' }}
        glow="hover:glow-amber transition-all"
      />
      <StatCard
        icon={XCircle}
        label="Failed"
        value={failed}
        sub="needs attention"
        color={{ text: 'text-red-400', bg: 'bg-red-950/50' }}
        glow="hover:glow-red transition-all"
      />
      <StatCard
        icon={Activity}
        label="Avg Health"
        value={avgHealth !== null ? avgHealth : '—'}
        sub="cluster score"
        color={{ text: 'text-purple-400', bg: 'bg-purple-950/50' }}
        glow="hover:glow-purple transition-all"
      />
    </div>
  );
}
