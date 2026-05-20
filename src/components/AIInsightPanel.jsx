import { Brain, Cpu, HardDrive, Network, FileText, Layers } from 'lucide-react';

function AgentCard({ icon: Icon, label, content, color }) {
  return (
    <div className={`glass-card p-3 rounded-xl border ${color.border} flex flex-col gap-2`}>
      <div className="flex items-center gap-2">
        <Icon size={12} className={color.text} />
        <span className={`text-[9px] font-bold uppercase tracking-widest ${color.text}`}>{label}</span>
      </div>
      <p className="text-[10px] text-slate-400 leading-relaxed break-words line-clamp-3">
        {content || 'No data from agent'}
      </p>
    </div>
  );
}

export default function AIInsightPanel({ data, loading, podName }) {
  if (loading) {
    return (
      <div className="glass-card p-4 space-y-3">
        <div className="skeleton h-4 w-56" />
        <div className="skeleton h-20 w-full" />
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center gap-3 min-h-[180px]">
        <Brain size={28} className="text-slate-600" />
        <p className="text-slate-500 text-sm">Select a pod to activate AI analysis</p>
      </div>
    );
  }

  const agents = data?.agent_analysis || {};

  return (
    <div className="glass-card p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain size={14} className="text-purple-400" />
        <span className="text-[11px] text-purple-400 uppercase tracking-widest font-bold">
          Correlated Brain Network — {podName}
        </span>
        <span className="ml-auto w-2 h-2 rounded-full bg-purple-400 animate-pulse-glow" />
      </div>

      {/* AI Summary */}
      {data.ai_summary && (
        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/25">
          <div className="text-[9px] text-purple-500 uppercase tracking-widest mb-2 font-bold">
            ◈ Orchestrator Summary
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed break-words">
            {data.ai_summary}
          </p>
        </div>
      )}

      {/* Agent grid */}
      <div className="grid grid-cols-2 gap-2">
        <AgentCard
          icon={Cpu}
          label="CPU Agent"
          content={agents.cpu_agent || agents.cpu}
          color={{ text: 'text-cyan-400', border: 'border-cyan-500/20' }}
        />
        <AgentCard
          icon={HardDrive}
          label="Memory Agent"
          content={agents.memory_agent || agents.memory}
          color={{ text: 'text-purple-400', border: 'border-purple-500/20' }}
        />
        <AgentCard
          icon={Network}
          label="Network Agent"
          content={agents.network_agent || agents.network}
          color={{ text: 'text-emerald-400', border: 'border-emerald-500/20' }}
        />
        <AgentCard
          icon={FileText}
          label="Log Agent"
          content={agents.log_agent || agents.logs}
          color={{ text: 'text-amber-400', border: 'border-amber-500/20' }}
        />
      </div>

      {/* Recommendation */}
      {data.recommendation && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
          <Layers size={12} className="text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-[9px] text-cyan-600 uppercase tracking-widest mb-1 font-bold">Auto-Remediation</div>
            <p className="text-[11px] text-slate-300 leading-relaxed break-words">{data.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
