import { useState } from 'react';
import { Search, Server, Circle, ChevronRight, Layers } from 'lucide-react';

function statusColor(status) {
  const s = (status || '').toLowerCase();
  if (s === 'running') return { dot: 'bg-emerald-400', border: 'border-emerald-500/40', text: 'text-emerald-400', glow: 'glow-green', badge: 'bg-emerald-900/50 text-emerald-300' };
  if (s === 'pending') return { dot: 'bg-amber-400', border: 'border-amber-500/40', text: 'text-amber-400', glow: 'glow-amber', badge: 'bg-amber-900/50 text-amber-300' };
  return { dot: 'bg-red-500', border: 'border-red-500/40', text: 'text-red-400', glow: 'glow-red', badge: 'bg-red-900/50 text-red-300' };
}

function SkeletonCard() {
  return (
    <div className="glass-card p-3 space-y-2">
      <div className="skeleton h-3 w-3/4" />
      <div className="skeleton h-2 w-1/2" />
      <div className="skeleton h-2 w-1/3" />
    </div>
  );
}

export default function PodSidebar({ pods, loading, error, selectedPod, onSelect }) {
  const [search, setSearch] = useState('');

  const filtered = pods.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.namespace || '').toLowerCase().includes(q)
    );
  });

  const grouped = filtered.reduce((acc, pod) => {
    const ns = pod.namespace || 'default';
    if (!acc[ns]) acc[ns] = [];
    acc[ns].push(pod);
    return acc;
  }, {});

  return (
    <aside className="flex flex-col w-72 shrink-0 glass-dark border-r border-cyan-500/15 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-cyan-500/10">
        <div className="flex items-center gap-2 mb-3">
          <Server size={14} className="text-cyan-400" />
          <span className="text-[11px] font-bold text-cyan-400 tracking-widest uppercase">
            Pod Topology
          </span>
          <span className="ml-auto text-[10px] glass px-2 py-0.5 rounded-full text-cyan-600">
            {pods.length} pods
          </span>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Filter pods…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-cyan-500/20 rounded-lg pl-8 pr-3 py-2 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400/60 transition-colors"
          />
        </div>
      </div>

      {/* Pod list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {loading && !pods.length && (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {error && !pods.length && (
          <div className="glass-card p-4 border-red-500/30 text-center">
            <div className="text-red-400 text-xs mb-1">⚠ Connection Error</div>
            <div className="text-slate-500 text-[10px]">{error}</div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center text-slate-600 text-xs py-8">No pods match filter</div>
        )}

        {Object.entries(grouped).map(([ns, nsPods]) => (
          <div key={ns}>
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <Layers size={10} className="text-cyan-700" />
              <span className="text-[9px] text-cyan-700 uppercase tracking-widest font-bold truncate">
                {ns}
              </span>
              <span className="ml-auto text-[9px] text-slate-600">{nsPods.length}</span>
            </div>
            <div className="space-y-1.5">
              {nsPods.map((pod) => {
                const c = statusColor(pod.status);
                const isSelected = selectedPod?.name === pod.name;
                return (
                  <button
                    key={pod.name}
                    onClick={() => onSelect(pod)}
                    className={`w-full text-left glass-card p-3 rounded-xl transition-all duration-200 hover:border-cyan-400/40 group ${
                      isSelected
                        ? `border-cyan-400/60 bg-cyan-950/40 ${c.glow}`
                        : `${c.border}`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot} ${isSelected ? 'animate-pulse-glow' : ''}`} />
                      <span className="text-[11px] font-bold text-slate-200 truncate flex-1">
                        {pod.name}
                      </span>
                      <ChevronRight
                        size={12}
                        className={`shrink-0 transition-transform ${isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'}`}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${c.badge}`}>
                        {pod.status || 'unknown'}
                      </span>
                      {pod.health_score !== undefined && (
                        <span className="text-[9px] text-slate-500">
                          Score: <span className="text-cyan-500">{pod.health_score}</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
