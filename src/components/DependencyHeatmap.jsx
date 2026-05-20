import { useState } from 'react';
import { Grid, Info } from 'lucide-react';

// Generate a synthetic influence matrix from pod list
function buildMatrix(pods) {
  const names = pods.slice(0, 10).map(p => p.name); // cap at 10 for readability
  const matrix = {};
  names.forEach((a) => {
    matrix[a] = {};
    names.forEach((b) => {
      if (a === b) { matrix[a][b] = 1; return; }
      // Use health scores to derive influence — lower health = higher influence on others
      const scoreA = pods.find(p => p.name === a)?.health_score ?? 50;
      const scoreB = pods.find(p => p.name === b)?.health_score ?? 50;
      // Pods with low health have higher blast influence
      const influence = parseFloat(((100 - scoreA) * (100 - scoreB) / 10000).toFixed(2));
      matrix[a][b] = influence;
    });
  });
  return { names, matrix };
}

function cellColor(val) {
  if (val >= 0.8) return 'bg-red-600';
  if (val >= 0.6) return 'bg-red-500/70';
  if (val >= 0.4) return 'bg-amber-500/70';
  if (val >= 0.2) return 'bg-amber-400/50';
  if (val >= 0.1) return 'bg-cyan-600/40';
  if (val === 1)  return 'bg-cyan-500';
  return 'bg-slate-800/60';
}

export default function DependencyHeatmap({ pods }) {
  const [tooltip, setTooltip] = useState(null);

  if (!pods || pods.length < 2) {
    return (
      <div className="glass-card p-4 flex flex-col items-center justify-center gap-2 min-h-[160px]">
        <Grid size={24} className="text-slate-600" />
        <p className="text-slate-500 text-xs">Need ≥2 pods for heatmap</p>
      </div>
    );
  }

  const { names, matrix } = buildMatrix(pods);
  const cellSize = Math.max(24, Math.min(40, Math.floor(320 / names.length)));
  const labelW = 80;

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Grid size={13} className="text-cyan-400" />
        <span className="text-[11px] text-cyan-400 uppercase tracking-widest font-bold">
          Dependency Heatmap
        </span>
        <div className="ml-auto flex items-center gap-1 text-[9px] text-slate-600">
          <Info size={9} />
          <span>Influence strength between pod pairs</span>
        </div>
      </div>

      <div className="overflow-auto">
        <div className="relative" style={{ minWidth: labelW + names.length * cellSize }}>
          {/* Column labels */}
          <div className="flex" style={{ marginLeft: labelW }}>
            {names.map((n) => (
              <div
                key={n}
                style={{ width: cellSize, minWidth: cellSize }}
                className="text-[8px] text-slate-500 truncate px-0.5 pb-1 text-center"
                title={n}
              >
                {n.length > 6 ? n.slice(0, 5) + '…' : n}
              </div>
            ))}
          </div>

          {/* Rows */}
          {names.map((rowPod) => (
            <div key={rowPod} className="flex items-center">
              {/* Row label */}
              <div
                style={{ width: labelW, minWidth: labelW }}
                className="text-[9px] text-slate-400 truncate pr-2 text-right"
                title={rowPod}
              >
                {rowPod.length > 10 ? rowPod.slice(0, 9) + '…' : rowPod}
              </div>
              {/* Cells */}
              {names.map((colPod) => {
                const val = matrix[rowPod]?.[colPod] ?? 0;
                const isSelf = rowPod === colPod;
                return (
                  <div
                    key={colPod}
                    style={{ width: cellSize, height: cellSize, minWidth: cellSize }}
                    className={`relative border border-slate-900/50 cursor-pointer transition-all hover:scale-110 hover:z-10 hover:border-cyan-400/60 ${
                      isSelf ? 'bg-cyan-900/40 border-cyan-500/30' : cellColor(val)
                    }`}
                    onMouseEnter={() => setTooltip({ row: rowPod, col: colPod, val })}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white/70">
                      {isSelf ? '●' : val > 0 ? val.toFixed(1) : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="glass-dark rounded-lg px-3 py-2 text-[10px] border border-cyan-500/20 animate-fade-in">
          <span className="text-cyan-400 font-bold">{tooltip.row}</span>
          <span className="text-slate-500"> → </span>
          <span className="text-purple-400 font-bold">{tooltip.col}</span>
          <span className="text-slate-400 ml-2">influence: </span>
          <span className="text-white font-bold">{tooltip.val === 1 ? 'self' : tooltip.val.toFixed(2)}</span>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] text-slate-600 uppercase tracking-wider">Influence:</span>
        {[
          { label: 'None',     color: 'bg-slate-800/60' },
          { label: 'Low',      color: 'bg-cyan-600/40' },
          { label: 'Medium',   color: 'bg-amber-400/50' },
          { label: 'High',     color: 'bg-amber-500/70' },
          { label: 'Critical', color: 'bg-red-500/70' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-[9px] text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
