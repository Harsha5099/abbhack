import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar,
} from 'recharts';
import {
  Zap, Activity, AlertTriangle, Shield, DollarSign,
  Play, Square, Flame, ChevronRight, Brain, Server,
  TrendingUp, GitBranch, Terminal, Sparkles, ArrowLeft,
  CheckCircle, XCircle, Clock, Cpu, MemoryStick,
} from 'lucide-react';
import {
  DEMO_PODS, BLAST_RADIUS, AI_SUMMARIES, RECOMMENDATIONS,
  ROOT_CAUSES, generateHistory, getHealthScore, getSeverity, getCost,
} from './demoData';

// ── Helpers ────────────────────────────────────────────────────────────────────
function rand(min, max) { return parseFloat((Math.random() * (max - min) + min).toFixed(1)); }

function statusColor(scenario) {
  if (scenario === 'healthy')  return { dot: 'bg-emerald-400', badge: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/30', border: 'border-emerald-500/30' };
  if (scenario === 'warning')  return { dot: 'bg-amber-400',   badge: 'bg-amber-900/60 text-amber-300 border-amber-500/30',     border: 'border-amber-500/30' };
  return                              { dot: 'bg-red-500',     badge: 'bg-red-900/60 text-red-300 border-red-500/30',           border: 'border-red-500/30' };
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark rounded-xl p-3 border border-cyan-500/30 text-[11px] min-w-[150px]">
      <div className="text-slate-400 mb-2 font-bold">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-white font-bold">{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

// ── Health Gauge ───────────────────────────────────────────────────────────────
function HealthGauge({ score }) {
  const r = 52, circ = 2 * Math.PI * r, arc = circ * 0.75;
  const offset = arc - (arc * score) / 100;
  const color = score >= 75 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-32 h-32">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={r} fill="none" stroke="#1e293b" strokeWidth="10"
            strokeDasharray={arc} strokeDashoffset={0} strokeLinecap="round" transform="rotate(135 64 64)" />
          <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={arc} strokeDashoffset={offset} strokeLinecap="round"
            transform="rotate(135 64 64)"
            style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 8px ${color})` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{score}</span>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">/100</span>
        </div>
      </div>
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
        {score >= 75 ? 'Healthy' : score >= 45 ? 'Degraded' : 'Critical'}
      </span>
    </div>
  );
}

// ── Live Metric Bar ────────────────────────────────────────────────────────────
function MetricBar({ label, value, icon: Icon, color, bgColor }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon size={11} className={color} />
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
        <span className={`text-sm font-black ${color}`}>{value}%</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full transition-all duration-700 ${bgColor}`}
          style={{ width: `${value}%`, boxShadow: '0 0 8px currentColor' }} />
      </div>
    </div>
  );
}

// ── Anomaly Badge ──────────────────────────────────────────────────────────────
function AnomalyBadge({ scenario }) {
  const cfg = {
    healthy:  { label: 'Optimal',  cls: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400', pulse: false },
    warning:  { label: 'Warning',  cls: 'bg-amber-950/60 border-amber-500/40 text-amber-400',       pulse: true  },
    critical: { label: 'Critical', cls: 'bg-red-950/60 border-red-500/40 text-red-400',             pulse: true  },
    stress:   { label: 'Critical', cls: 'bg-red-950/60 border-red-500/40 text-red-400',             pulse: true  },
  }[scenario];
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${cfg.cls}`}>
      <AlertTriangle size={16} className={cfg.cls.split(' ').find(c => c.startsWith('text-'))} />
      <span className={`text-lg font-black uppercase tracking-widest ${cfg.pulse ? 'animate-pulse-glow' : ''} ${cfg.cls.split(' ').find(c => c.startsWith('text-'))}`}>
        {cfg.label}
      </span>
    </div>
  );
}

// ── Main DemoPage Component ────────────────────────────────────────────────────
export default function DemoPage({ onExit }) {
  const [selectedPod, setSelectedPod]   = useState(DEMO_PODS[0]);
  const [scenario, setScenario]         = useState('healthy');
  const [isStress, setIsStress]         = useState(false);
  const [isRunning, setIsRunning]       = useState(true);
  const [history, setHistory]           = useState(() => generateHistory('healthy'));
  const [liveCpu, setLiveCpu]           = useState(15);
  const [liveMem, setLiveMem]           = useState(28);
  const [liveNet, setLiveNet]           = useState(5);
  const [tick, setTick]                 = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'KubeNexus Demo AI online. Select a pod and trigger scenarios to see live analysis.' }
  ]);
  const [chatInput, setChatInput]       = useState('');
  const chatRef                         = useRef(null);
  const intervalRef                     = useRef(null);

  const activeScenario = isStress ? 'stress' : scenario;
  const healthScore    = getHealthScore(activeScenario);
  const severity       = getSeverity(activeScenario);
  const cost           = getCost(activeScenario);
  const sc             = statusColor(activeScenario === 'stress' ? 'critical' : activeScenario);
  const blastAffected  = BLAST_RADIUS[selectedPod.base] || [];

  // ── Live ticker ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTick(t => t + 1);
      const s = isStress ? 'stress' : scenario;

      let cpu, mem, net;
      if (s === 'healthy')  { cpu = rand(10, 28); mem = rand(22, 38); net = rand(2, 12); }
      else if (s === 'warning')  { cpu = rand(65, 80); mem = rand(60, 78); net = rand(15, 35); }
      else if (s === 'critical') { cpu = rand(82, 96); mem = rand(80, 93); net = rand(30, 60); }
      else                       { cpu = rand(90, 99); mem = rand(85, 97); net = rand(50, 90); }

      setLiveCpu(cpu);
      setLiveMem(mem);
      setLiveNet(net);

      setHistory(prev => {
        const next = [...prev.slice(1), {
          timestamp:    new Date().toISOString(),
          cpu_usage:    cpu,
          memory_usage: mem,
          network_io:   net,
          disk_io:      rand(1, 10),
        }];
        return next;
      });
    }, 1500);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, scenario, isStress]);

  // ── Scroll chat ──────────────────────────────────────────────────────────────
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ── Scenario change ───────────────────────────────────────────────────────────
  const applyScenario = useCallback((s) => {
    setScenario(s);
    setIsStress(false);
    setHistory(generateHistory(s));
    const msg = {
      healthy:  `✅ Normal mode activated for ${selectedPod.name}. All metrics within SLA.`,
      warning:  `⚠️ Warning scenario triggered on ${selectedPod.name}. CPU and memory trending up.`,
      critical: `🔴 Critical scenario on ${selectedPod.name}. Immediate attention required.`,
    }[s];
    setChatMessages(prev => [...prev, { role: 'system', text: msg }]);
  }, [selectedPod]);

  const triggerStress = useCallback(() => {
    setIsStress(true);
    setHistory(generateHistory('stress'));
    setChatMessages(prev => [...prev,
      { role: 'system', text: `🔥 STRESS MODE activated on ${selectedPod.name} — injecting synthetic CPU/RAM load via stress-ng...` },
      { role: 'ai',     text: AI_SUMMARIES.stress(selectedPod.name) },
    ]);
  }, [selectedPod]);

  const stopStress = useCallback(() => {
    setIsStress(false);
    setScenario('healthy');
    setHistory(generateHistory('healthy'));
    setChatMessages(prev => [...prev,
      { role: 'system', text: `✅ Stress test stopped. Pod ${selectedPod.name} recovering...` },
    ]);
  }, [selectedPod]);

  // ── Pod select ────────────────────────────────────────────────────────────────
  const selectPod = useCallback((pod) => {
    setSelectedPod(pod);
    setIsStress(false);
    setScenario('healthy');
    setHistory(generateHistory('healthy'));
    setChatMessages(prev => [...prev,
      { role: 'system', text: `🔍 Switched to pod: ${pod.name} [${pod.namespace}]` },
    ]);
  }, []);

  // ── Chat send ─────────────────────────────────────────────────────────────────
  const sendChat = useCallback((q) => {
    const query = (q || chatInput).trim();
    if (!query) return;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: query }]);
    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply;
      if (lower.includes('health') || lower.includes('score'))
        reply = `Current health score for ${selectedPod.name}: ${healthScore}/100. Status: ${severity}.`;
      else if (lower.includes('blast') || lower.includes('radius') || lower.includes('impact'))
        reply = `Blast radius for ${selectedPod.name}: ${blastAffected.length} downstream services affected — ${blastAffected.join(', ')}. Impact level: ${blastAffected.length >= 3 ? 'Critical' : 'High'}.`;
      else if (lower.includes('fix') || lower.includes('recommend') || lower.includes('solution'))
        reply = RECOMMENDATIONS[activeScenario];
      else if (lower.includes('cause') || lower.includes('why') || lower.includes('root'))
        reply = ROOT_CAUSES[activeScenario];
      else if (lower.includes('cost'))
        reply = `Estimated cost for ${selectedPod.name}: $${cost.toFixed(4)}/hr. ${activeScenario !== 'healthy' ? 'Resource waste detected — optimization recommended.' : 'Cost is within budget.'}`;
      else if (lower.includes('memory') || lower.includes('ram'))
        reply = `Memory usage: ${liveMem}%. ${liveMem > 80 ? '⚠️ High — OOM risk. Increase limits to 512Mi.' : 'Within normal range.'}`;
      else if (lower.includes('cpu'))
        reply = `CPU usage: ${liveCpu}%. ${liveCpu > 80 ? '🔴 Critical throttling detected. Scale horizontally.' : 'Operating normally.'}`;
      else
        reply = AI_SUMMARIES[activeScenario](selectedPod.name);
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
    }, 600);
  }, [chatInput, selectedPod, healthScore, severity, blastAffected, activeScenario, cost, liveMem, liveCpu]);

  const chartData = history.map((pt, i) => ({
    t:   new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    cpu: pt.cpu_usage,
    mem: pt.memory_usage,
    net: pt.network_io,
  }));

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden grid-bg">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3 glass-dark border-b border-cyan-500/20 shrink-0 relative">
        <div className="absolute inset-0 scan-overlay pointer-events-none" />
        <div className="flex items-center gap-4">
          <button onClick={onExit}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-slate-600/40 text-slate-400 text-[11px] hover:border-cyan-400/40 hover:text-cyan-400 transition-all">
            <ArrowLeft size={12} /> Live Dashboard
          </button>
          <div>
            <h1 className="text-xl font-black tracking-widest">
              <span className="text-white">KUBE</span>
              <span className="text-cyan-400 glow-text-cyan">[NEXUS]</span>
              <span className="text-purple-400 ml-2 text-sm">DEMO MODE</span>
            </h1>
            <p className="text-[9px] text-slate-600 tracking-widest uppercase">Synthetic Kubernetes Cluster — No backend required</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 glass px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
            {isRunning ? 'Live Simulation Running' : 'Simulation Paused'}
          </span>
          <button onClick={() => setIsRunning(r => !r)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-cyan-500/30 text-cyan-400 text-[11px] font-bold uppercase tracking-widest hover:glow-cyan transition-all">
            {isRunning ? <><Square size={11} /> Pause</> : <><Play size={11} /> Resume</>}
          </button>
        </div>
      </div>

      {/* ── Scenario controls ── */}
      <div className="flex items-center gap-3 px-6 py-2.5 border-b border-slate-800/50 shrink-0 bg-slate-950/50">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mr-1">Scenario:</span>
        {['healthy', 'warning', 'critical'].map(s => (
          <button key={s} onClick={() => applyScenario(s)}
            className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest border transition-all ${
              scenario === s && !isStress
                ? s === 'healthy'  ? 'bg-emerald-900/60 border-emerald-500/60 text-emerald-300 glow-green'
                : s === 'warning'  ? 'bg-amber-900/60 border-amber-500/60 text-amber-300 glow-amber'
                :                    'bg-red-900/60 border-red-500/60 text-red-300 glow-red'
                : 'glass border-slate-700/40 text-slate-400 hover:border-slate-500/60'
            }`}>
            {s === 'healthy' ? '✅ Normal' : s === 'warning' ? '⚠️ Warning' : '🔴 Critical'}
          </button>
        ))}
        <div className="w-px h-6 bg-slate-700 mx-1" />
        {!isStress ? (
          <button onClick={triggerStress}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-orange-950/60 border border-orange-500/60 text-orange-300 text-[11px] font-bold uppercase tracking-widest hover:glow-amber transition-all animate-pulse-glow">
            <Flame size={13} /> 🔥 Stress Mode
          </button>
        ) : (
          <button onClick={stopStress}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/60 text-slate-300 text-[11px] font-bold uppercase tracking-widest hover:border-cyan-400/40 transition-all">
            <Square size={11} /> Stop Stress
          </button>
        )}
        <div className="ml-auto flex items-center gap-2 text-[10px] text-slate-600">
          <Clock size={10} />
          <span>Tick #{tick} · 1.5s interval</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Sidebar — pod list */}
        <aside className="w-60 shrink-0 glass-dark border-r border-cyan-500/15 flex flex-col overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b border-cyan-500/10">
            <div className="flex items-center gap-2">
              <Server size={12} className="text-cyan-400" />
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Pods</span>
              <span className="ml-auto text-[9px] glass px-2 py-0.5 rounded-full text-cyan-600">{DEMO_PODS.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {DEMO_PODS.map(pod => {
              const isSel = selectedPod.name === pod.name;
              const podScenario = isSel ? activeScenario : 'healthy';
              const c = statusColor(podScenario === 'stress' ? 'critical' : podScenario);
              return (
                <button key={pod.name} onClick={() => selectPod(pod)}
                  className={`w-full text-left p-2.5 rounded-xl glass-card border transition-all hover:border-cyan-400/40 ${isSel ? 'border-cyan-400/60 bg-cyan-950/30 glow-cyan' : c.border}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot} ${isSel ? 'animate-pulse-glow' : ''}`} />
                    <span className="text-[10px] font-bold text-slate-200 truncate">{pod.base}</span>
                  </div>
                  <div className="text-[8px] text-slate-600 mt-0.5 truncate">{pod.namespace}</div>
                  {isSel && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex justify-between text-[9px]">
                        <span className="text-slate-500">CPU</span>
                        <span className={liveCpu > 80 ? 'text-red-400 font-bold' : 'text-cyan-400'}>{liveCpu}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1">
                        <div className={`h-1 rounded-full transition-all duration-700 ${liveCpu > 80 ? 'bg-red-500' : 'bg-cyan-500'}`}
                          style={{ width: `${liveCpu}%` }} />
                      </div>
                      <div className="flex justify-between text-[9px]">
                        <span className="text-slate-500">MEM</span>
                        <span className={liveMem > 80 ? 'text-red-400 font-bold' : 'text-purple-400'}>{liveMem}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1">
                        <div className={`h-1 rounded-full transition-all duration-700 ${liveMem > 80 ? 'bg-red-500' : 'bg-purple-500'}`}
                          style={{ width: `${liveMem}%` }} />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-4 gap-4 overflow-y-auto">

          {/* Pod header */}
          <div className="glass-card p-4 flex items-center gap-4 shrink-0 animate-fade-in">
            <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center glow-cyan shrink-0">
              <Server size={20} className="text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-white tracking-wider truncate">{selectedPod.name}</h2>
              <div className="text-[10px] text-slate-500 font-mono">{selectedPod.namespace}</div>
            </div>
            <AnomalyBadge scenario={activeScenario} />
            {isStress && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-950/60 border border-orange-500/40 animate-pulse-glow">
                <Flame size={14} className="text-orange-400" />
                <span className="text-[11px] text-orange-300 font-bold uppercase tracking-widest">Stress Active</span>
              </div>
            )}
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-4 shrink-0">
            {/* Health gauge */}
            <div className="glass-card p-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 w-full mb-1">
                <Shield size={12} className="text-cyan-400" />
                <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Health Score</span>
              </div>
              <HealthGauge score={healthScore} />
            </div>

            {/* Live metrics */}
            <div className="glass-card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={12} className="text-purple-400" />
                <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Live Metrics</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
              </div>
              <MetricBar label="CPU"     value={liveCpu} icon={Cpu}         color={liveCpu > 80 ? 'text-red-400' : 'text-cyan-400'}   bgColor={liveCpu > 80 ? 'bg-red-500' : 'bg-cyan-500'} />
              <MetricBar label="Memory"  value={liveMem} icon={MemoryStick} color={liveMem > 80 ? 'text-red-400' : 'text-purple-400'} bgColor={liveMem > 80 ? 'bg-red-500' : 'bg-purple-500'} />
              <MetricBar label="Network" value={Math.min(100, liveNet * 2)} icon={Activity} color="text-emerald-400" bgColor="bg-emerald-500" />
            </div>

            {/* Cost + blast */}
            <div className="glass-card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={12} className="text-cyan-400" />
                <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Cost & Impact</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-cyan-400 glow-text-cyan">${cost.toFixed(4)}</span>
                <span className="text-slate-500 text-xs mb-1">/hr</span>
              </div>
              <div className="border-t border-slate-700/40 pt-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Zap size={10} className="text-red-400" />
                  <span className="text-[9px] text-red-400 uppercase tracking-widest font-bold">Blast Radius</span>
                </div>
                {blastAffected.length === 0
                  ? <span className="text-[10px] text-slate-500">No downstream dependencies</span>
                  : blastAffected.map(s => (
                    <div key={s} className="flex items-center gap-1.5 text-[10px] text-slate-400 py-0.5">
                      <ChevronRight size={9} className="text-amber-500" />
                      <span className="truncate">{s}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card p-4 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={13} className="text-cyan-400" />
              <span className="text-[11px] text-cyan-400 uppercase tracking-widest font-bold">
                Live Chrono-Metrics — {selectedPod.base}
              </span>
              {isStress && <span className="ml-2 text-[9px] text-orange-400 font-bold animate-pulse-glow">⚡ STRESS LOAD ACTIVE</span>}
              <span className="ml-auto text-[9px] text-slate-600">{chartData.length} points · live</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {[['cpu','#06b6d4'],['mem','#a855f7'],['net','#10b981']].map(([k,c]) => (
                    <linearGradient key={k} id={`dg-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={c} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={c} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t" tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} axisLine={{ stroke: '#1e293b' }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px' }} formatter={v => <span style={{ color: '#94a3b8' }}>{v}</span>} />
                <Area type="monotone" dataKey="cpu" name="CPU %"    stroke="#06b6d4" strokeWidth={2} fill="url(#dg-cpu)" dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="mem" name="Memory %" stroke="#a855f7" strokeWidth={2} fill="url(#dg-mem)" dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="net" name="Network"  stroke="#10b981" strokeWidth={2} fill="url(#dg-net)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* AI Summary */}
          <div className="glass-card p-4 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={13} className="text-purple-400" />
              <span className="text-[11px] text-purple-400 uppercase tracking-widest font-bold">AI Orchestrator Summary</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-purple-400 animate-pulse-glow" />
            </div>
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 mb-3">
              <p className="text-[11px] text-slate-300 leading-relaxed">{AI_SUMMARIES[activeScenario](selectedPod.name)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20">
                <div className="text-[9px] text-red-400 uppercase tracking-widest font-bold mb-1">Root Cause</div>
                <p className="text-[11px] text-slate-300">{ROOT_CAUSES[activeScenario]}</p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                <div className="text-[9px] text-cyan-400 uppercase tracking-widest font-bold mb-1">Recommendation</div>
                <p className="text-[11px] text-slate-300">{RECOMMENDATIONS[activeScenario]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Neural Chat */}
        <div className="w-72 shrink-0 flex flex-col glass-dark border-l border-cyan-500/15 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-cyan-500/10 shrink-0">
            <Terminal size={12} className="text-cyan-400" />
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Neural Chat</span>
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
          </div>
          {/* Macros */}
          <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-slate-800/40 shrink-0">
            {['Why is pod unhealthy?','Show blast radius','Fix recommendations','Cost analysis','Root cause'].map(q => (
              <button key={q} onClick={() => sendChat(q)}
                className="flex items-center gap-1 px-2 py-1 rounded-full glass border border-cyan-500/20 text-[8px] text-cyan-500 font-bold uppercase tracking-wider hover:border-cyan-400/50 transition-all">
                <Sparkles size={7} />{q}
              </button>
            ))}
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
            {chatMessages.map((m, i) => (
              <div key={i} className={`animate-fade-in text-[11px] leading-relaxed rounded-xl px-3 py-2 ${
                m.role === 'user'   ? 'bg-cyan-950/50 border border-cyan-500/25 text-cyan-100 ml-4' :
                m.role === 'system' ? 'bg-slate-800/40 border border-slate-700/40 text-slate-400 text-[10px]' :
                                      'bg-slate-900/70 border border-purple-500/20 text-slate-300 mr-4'
              }`}>{m.text}</div>
            ))}
            <div ref={chatRef} />
          </div>
          {/* Input */}
          <div className="px-3 py-2.5 border-t border-slate-800/50 shrink-0">
            <div className="flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Ask about this pod…"
                className="flex-1 bg-slate-900/60 border border-cyan-500/20 rounded-xl px-3 py-2 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50" />
              <button onClick={() => sendChat()}
                className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:glow-cyan transition-all">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
