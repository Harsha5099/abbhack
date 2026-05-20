import { useState } from 'react';
import { BarChart2, ArrowUpDown, Search } from 'lucide-react';

function HealthBar({ score }) {
  const s = score ?? 0;
  const color = s >= 75 ? 'bg-emerald-500' : s >= 45 ? 'bg-amber-500' : 'bg-red-500';
  const glow  = s >= 75 ? 'shadow-emerald-500/50' : s >= 45 ? 'shadow-amber-500/50' : 'shadow-red-500/50';
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${s}%`, boxShadow: `0 0 6px var(--tw-shadow-color)` }}
        />
      </div>
      <span className={`text-[10px] font-bold w-7 text-right ${
        s >= 75 ? 'text-emerald-400' : s >= 45 ? 'text-amber-400' : 'text-red-400'
      }`}>{s}</span>
    </div>
  );
}

function statusBadge(status) {
  const s = (status || '').toLowerCase();
  if (s === 'running') return 'bg-emerald-900/60 text-emerald-300 border-emerald-500/30';
  if (s === 'pending') return 'bg-amber-900/60 text-amber-300 border-amber-500/30';
  return 'bg-red-900/60 text-red-300 border-red-500/30';
}

export default function PodHealthTable({ pods, onSelect, selectedPod }) {
  const [sort, setSort]     = useState({ key: 'health_score', dir: 'asc' });
  const [search, setSearch] = useState('');

  const filtered = pods.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.namespace || '').toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sort.key] ?? (sort.key === 'health_score' ? 50 : '');
    const bv = b[sort.key] ?? (sort.key === 'health_score' ? 50 : '');
    if (typeof av === 'number') return sort.dir === 'asc' ? av - bv : bv - av;
    return sort.dir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const toggleSort = (key) => {
    setSort(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const ColHeader = ({ label, sortKey }) => (
    <th
      className="px-3 py-2 text-left text-[9px] text-slate-500 uppercase tracking-widest font-bold cursor-pointer hover:text-cyan-400 transition-colors select-none"
      onClick={() => toggleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={8} className={sort.key === sortKey ? 'text-cyan-400' : 'text-slate-700'} />
      </div>
    </th>
  );

  return (
    <div className="glass-card mx-4 mb-3 flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700/40">
        <BarChart2 size={13} className="text-cyan-400" />
        <span className="text-[11px] text-cyan-400 uppercase tracking-widest font-bold">
          Pod Health Scores
        </span>
        <div className="ml-auto relative">
          <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter…"
            className="bg-slate-900/60 border border-slate-700/50 rounded-lg pl-7 pr-3 py-1 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 w-36"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-44">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
            <tr>
              <ColHeader label="Pod Name"   sortKey="name" />
              <ColHeader label="Namespace"  sortKey="namespace" />
              <ColHeader label="Status"     sortKey="status" />
              <ColHeader label="Health"     sortKey="health_score" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-slate-600 text-xs">
                  No pods found
                </td>
              </tr>
            )}
            {sorted.map((pod) => {
              const isSelected = selectedPod?.name === pod.name;
              return (
                <tr
                  key={pod.name}
                  onClick={() => onSelect(pod)}
                  className={`cursor-pointer border-b border-slate-800/40 transition-all hover:bg-cyan-950/20 ${
                    isSelected ? 'bg-cyan-950/30 border-l-2 border-l-cyan-500' : ''
                  }`}
                >
                  <td className="px-3 py-2">
                    <span className="text-[11px] font-bold text-slate-200 truncate block max-w-[160px]" title={pod.name}>
                      {pod.name}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-[10px] text-slate-500 truncate block max-w-[100px]" title={pod.namespace}>
                      {pod.namespace || 'default'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${statusBadge(pod.status)}`}>
                      {pod.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-3 py-2 w-40">
                    <HealthBar score={pod.health_score} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
