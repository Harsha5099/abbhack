import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';

const COLORS = {
  cpu:     { stroke: '#06b6d4', fill: '#06b6d4' },
  memory:  { stroke: '#a855f7', fill: '#a855f7' },
  network: { stroke: '#10b981', fill: '#10b981' },
  disk:    { stroke: '#f59e0b', fill: '#f59e0b' },
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark rounded-xl p-3 border border-cyan-500/30 text-[11px] min-w-[140px]">
      <div className="text-slate-400 mb-2 font-bold">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-white font-bold">{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function normalizeHistory(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((pt, i) => {
    const ts = pt.timestamp
      ? new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : `T-${raw.length - i}`;
    return {
      time: ts,
      cpu:     parseFloat(pt.cpu_usage ?? pt.cpu ?? 0),
      memory:  parseFloat(pt.memory_usage ?? pt.memory ?? pt.ram ?? 0),
      network: parseFloat(pt.network_io ?? pt.network ?? 0),
      disk:    parseFloat(pt.disk_io ?? pt.disk ?? 0),
    };
  });
}

export default function MetricsChart({ history, loading, podName }) {
  const data = normalizeHistory(history);

  const hasCpu     = data.some(d => d.cpu > 0);
  const hasMemory  = data.some(d => d.memory > 0);
  const hasNetwork = data.some(d => d.network > 0);
  const hasDisk    = data.some(d => d.disk > 0);

  if (loading) {
    return (
      <div className="glass-card p-4 space-y-3">
        <div className="skeleton h-4 w-48" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center gap-3 min-h-[220px]">
        <Activity size={28} className="text-slate-600" />
        <p className="text-slate-500 text-sm">No telemetry history available</p>
        <p className="text-slate-600 text-xs">Select a pod to load metrics</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <TrendingUp size={14} className="text-cyan-400" />
        <span className="text-[11px] text-cyan-400 uppercase tracking-widest font-bold">
          Chrono-Metrics — {podName}
        </span>
        <span className="ml-auto text-[9px] text-slate-600">{data.length} data points</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {Object.entries(COLORS).map(([key, { fill }]) => (
              <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={fill} stopOpacity={0.35} />
                <stop offset="95%" stopColor={fill} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#475569', fontSize: 9 }}
            tickLine={false}
            axisLine={{ stroke: '#1e293b' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#475569', fontSize: 9 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
            formatter={(val) => <span style={{ color: '#94a3b8' }}>{val}</span>}
          />
          {hasCpu && (
            <Area type="monotone" dataKey="cpu" name="CPU %" stroke={COLORS.cpu.stroke}
              strokeWidth={2} fill="url(#grad-cpu)" dot={false} activeDot={{ r: 4, fill: COLORS.cpu.stroke }} />
          )}
          {hasMemory && (
            <Area type="monotone" dataKey="memory" name="Memory %" stroke={COLORS.memory.stroke}
              strokeWidth={2} fill="url(#grad-memory)" dot={false} activeDot={{ r: 4, fill: COLORS.memory.stroke }} />
          )}
          {hasNetwork && (
            <Area type="monotone" dataKey="network" name="Network MB/s" stroke={COLORS.network.stroke}
              strokeWidth={2} fill="url(#grad-network)" dot={false} activeDot={{ r: 4, fill: COLORS.network.stroke }} />
          )}
          {hasDisk && (
            <Area type="monotone" dataKey="disk" name="Disk MB/s" stroke={COLORS.disk.stroke}
              strokeWidth={2} fill="url(#grad-disk)" dot={false} activeDot={{ r: 4, fill: COLORS.disk.stroke }} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
