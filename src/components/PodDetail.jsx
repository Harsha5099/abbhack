import { useState } from 'react';
import { Server, Cpu, MemoryStick, Globe, Hash, TrendingUp, Zap, Grid } from 'lucide-react';
import HealthMetrics from './HealthMetrics';
import MetricsChart from './MetricsChart';
import BlastRadius from './BlastRadius';
import AIInsightPanel from './AIInsightPanel';
import DependencyHeatmap from './DependencyHeatmap';

function StatPill({ icon: Icon, label, value, color = 'text-cyan-400' }) {
  return (
    <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg">
      <Icon size={11} className={color} />
      <span className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</span>
      <span className={`text-[11px] font-bold ${color} truncate max-w-[120px]`}>{value || '—'}</span>
    </div>
  );
}

const TABS = [
  { id: 'metrics',  label: 'Chrono-Metrics',  icon: TrendingUp },
  { id: 'blast',    label: 'Blast Radius',     icon: Zap },
  { id: 'heatmap',  label: 'Dep. Heatmap',     icon: Grid },
];

export default function PodDetail({
  pod, analysis, analysisError, blastRadius, history,
  loadingAnalysis, loadingBlast, loadingHistory,
  allPods = [],
}) {
  const [activeTab, setActiveTab] = useState('metrics');

  if (!pod) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center p-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-cyan-500/15 flex items-center justify-center animate-spin-slow">
            <div className="w-16 h-16 rounded-full border border-cyan-500/10 flex items-center justify-center">
              <Server size={28} className="text-cyan-800" />
            </div>
          </div>
          <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-ping" style={{ animationDuration: '3s' }} />
        </div>
        <div>
          <p className="text-slate-300 text-base font-bold tracking-wide">Select a Pod</p>
          <p className="text-slate-600 text-xs mt-1">
            Choose any pod from the topology navigator to begin deep analysis
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-2 w-full max-w-lg opacity-20 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-y-auto p-4 min-h-0">

      {/* ── Pod identity bar ── */}
      <div className="glass-card p-4 flex items-center gap-4 animate-fade-in shrink-0">
        <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center glow-cyan shrink-0">
          <Server size={20} className="text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-black text-white tracking-wider truncate">{pod.name}</h2>
            <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest border ${
              (pod.status || '').toLowerCase() === 'running'
                ? 'bg-emerald-900/60 text-emerald-300 border-emerald-500/30'
                : (pod.status || '').toLowerCase() === 'pending'
                ? 'bg-amber-900/60 text-amber-300 border-amber-500/30'
                : 'bg-red-900/60 text-red-300 border-red-500/30'
            }`}>
              {pod.status || 'unknown'}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Hash size={9} className="text-slate-600" />
            <span className="text-[10px] text-slate-500 font-mono truncate">{pod.namespace || 'default'}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <StatPill icon={Cpu}         label="CPU"    value={analysis?.cpu_usage    ? `${analysis.cpu_usage}%`    : '—'} color="text-cyan-400" />
          <StatPill icon={MemoryStick} label="Memory" value={analysis?.memory_usage ? `${analysis.memory_usage}%` : '—'} color="text-purple-400" />
          <StatPill icon={Globe}       label="Node"   value={pod.node || pod.nodeName || '—'} color="text-emerald-400" />
        </div>
      </div>

      {/* ── Health metrics row ── */}
      {analysisError ? (
        <div className="glass-card p-4 border-red-500/30 flex items-center gap-3">
          <span className="text-red-400 text-lg">⚠</span>
          <div>
            <div className="text-red-400 text-xs font-bold">Analysis Error</div>
            <div className="text-slate-500 text-[10px] mt-0.5">{analysisError}</div>
          </div>
        </div>
      ) : (
        <HealthMetrics data={analysis} loading={loadingAnalysis} />
      )}

      {/* ── AI Insight ── */}
      <AIInsightPanel data={analysis} loading={loadingAnalysis} podName={pod.name} />

      {/* ── Tabbed bottom section ── */}
      <div className="glass-card flex flex-col overflow-hidden shrink-0">
        {/* Tab bar */}
        <div className="flex border-b border-slate-700/40">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === id
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/20'
              }`}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-3">
          {activeTab === 'metrics' && (
            <MetricsChart history={history} loading={loadingHistory} podName={pod.name} />
          )}
          {activeTab === 'blast' && (
            <BlastRadius data={blastRadius} loading={loadingBlast} podName={pod.name} />
          )}
          {activeTab === 'heatmap' && (
            <DependencyHeatmap pods={allPods} />
          )}
        </div>
      </div>
    </div>
  );
}
