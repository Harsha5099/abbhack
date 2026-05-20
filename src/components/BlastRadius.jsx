import { Zap, AlertOctagon, GitBranch, ChevronRight } from 'lucide-react';

function impactColor(level) {
  const l = (level || '').toLowerCase();
  if (l === 'critical' || l === 'high')   return { text: 'text-red-400',    bg: 'bg-red-950/50 border-red-500/40',    glow: 'glow-red',   bar: 'bg-red-500' };
  if (l === 'medium' || l === 'moderate') return { text: 'text-amber-400',  bg: 'bg-amber-950/50 border-amber-500/40', glow: 'glow-amber', bar: 'bg-amber-500' };
  return                                         { text: 'text-emerald-400', bg: 'bg-emerald-950/50 border-emerald-500/40', glow: 'glow-green', bar: 'bg-emerald-500' };
}

export default function BlastRadius({ data, loading, podName }) {
  if (loading) {
    return (
      <div className="glass-card p-4 space-y-3">
        <div className="skeleton h-4 w-48" />
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
      </div>
    );
  }

  const services = data?.affected_services || data?.affected_pods || [];
  const impact   = data?.impact_level || 'low';
  const c        = impactColor(impact);

  return (
    <div className="glass-card p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-red-400" />
        <span className="text-[11px] text-red-400 uppercase tracking-widest font-bold">
          Blast Radius — {podName}
        </span>
      </div>

      {/* Impact badge */}
      <div className={`flex items-center gap-3 p-3 rounded-xl border ${c.bg} ${c.glow}`}>
        <AlertOctagon size={20} className={c.text} />
        <div>
          <div className={`text-lg font-black uppercase tracking-widest ${c.text}`}>
            {impact} Impact
          </div>
          <div className="text-[9px] text-slate-500 uppercase tracking-widest">
            {services.length} downstream service{services.length !== 1 ? 's' : ''} affected
          </div>
        </div>
        <div className="ml-auto text-3xl font-black opacity-20">{services.length}</div>
      </div>

      {/* Cascade tree */}
      {services.length > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 mb-2">
            <GitBranch size={11} className="text-slate-500" />
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Cascade Chain</span>
          </div>

          {/* Root pod */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/30 border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-glow shrink-0" />
            <span className="text-[11px] font-bold text-red-300 truncate">{podName}</span>
            <span className="ml-auto text-[9px] text-red-600 uppercase">origin</span>
          </div>

          {services.map((svc, i) => (
            <div key={i} className="flex items-center gap-2 ml-4">
              <div className="w-px h-4 bg-slate-700 shrink-0" />
              <ChevronRight size={10} className="text-slate-600 shrink-0" />
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-amber-500/30 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-[11px] text-slate-300 truncate">{svc}</span>
                <span className="ml-auto text-[9px] text-slate-600">affected</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-slate-600 text-xs">
          No downstream dependencies detected
        </div>
      )}

      {/* Impact bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[9px] text-slate-600">
          <span>Blast Severity</span>
          <span className={c.text}>{impact}</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-700 ${c.bar}`}
            style={{
              width: impact.toLowerCase() === 'critical' || impact.toLowerCase() === 'high' ? '90%'
                   : impact.toLowerCase() === 'medium' || impact.toLowerCase() === 'moderate' ? '55%' : '20%',
              boxShadow: '0 0 6px currentColor'
            }}
          />
        </div>
      </div>
    </div>
  );
}
