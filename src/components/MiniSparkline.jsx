// Tiny inline sparkline used inside pod cards or summary rows
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

export default function MiniSparkline({ data = [], color = '#06b6d4', height = 32 }) {
  if (!data || data.length < 2) {
    return <div style={{ height }} className="flex items-center justify-center text-[9px] text-slate-700">no data</div>;
  }

  const points = data.map((v, i) => ({ i, v: typeof v === 'object' ? (v.cpu ?? v.value ?? 0) : v }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={points} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.length
              ? <div className="glass-dark text-[9px] px-2 py-1 rounded text-cyan-300">{payload[0].value?.toFixed(1)}</div>
              : null
          }
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
