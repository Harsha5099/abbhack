import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Wifi, WifiOff, Zap, Activity } from 'lucide-react';

export default function Header({ onRefresh, isOnline, lastSync }) {
  const [countdown, setCountdown] = useState(12);
  const [spinning, setSpinning] = useState(false);

  const doRefresh = useCallback(() => {
    setSpinning(true);
    onRefresh();
    setTimeout(() => setSpinning(false), 900);
  }, [onRefresh]);

  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown((p) => {
        if (p <= 1) { doRefresh(); return 12; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [doRefresh]);

  const handleManual = () => { setCountdown(12); doRefresh(); };
  const arc = 2 * Math.PI * 13;
  const dash = arc * ((12 - countdown) / 12);

  return (
    <header className="relative flex items-center justify-between px-6 py-3 glass-dark border-b border-cyan-500/20 z-50 shrink-0">
      {/* CRT scanline */}
      <div className="absolute inset-0 pointer-events-none scan-overlay" />

      {/* ── Logo ── */}
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-cyan-400/50 glow-cyan">
          <Zap size={18} className="text-cyan-400" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse-glow" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-[0.15em] leading-none">
            <span className="text-white">KUBE</span>
            <span className="text-cyan-400 glow-text-cyan">[NEXUS]</span>
          </h1>
          <p className="text-[9px] text-cyan-700 tracking-[0.35em] uppercase mt-0.5">
            Multi-Agent AI Observatory
          </p>
        </div>
      </div>

      {/* ── Center status ── */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
              <Wifi size={12} className="text-emerald-400" />
              <span className="text-[10px] text-emerald-400 tracking-widest font-bold uppercase">
                Telemetry Sync Active
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <WifiOff size={12} className="text-red-400" />
              <span className="text-[10px] text-red-400 tracking-widest font-bold uppercase">
                Connection Lost
              </span>
            </>
          )}
        </div>

        {/* Countdown ring */}
        <div className="flex items-center gap-2">
          <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
            <circle cx="18" cy="18" r="13" fill="none" stroke="#0f172a" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="13"
              fill="none" stroke="#06b6d4" strokeWidth="3"
              strokeDasharray={arc}
              strokeDashoffset={arc - dash}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="text-center">
            <div className="text-cyan-400 font-bold text-sm leading-none">{countdown}s</div>
            <div className="text-[8px] text-slate-600 uppercase tracking-widest">sync</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Activity size={10} className="text-cyan-600" />
          {lastSync ? <span>Last: {lastSync}</span> : <span>Awaiting sync…</span>}
        </div>
      </div>

      {/* ── Right controls ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleManual}
          className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-cyan-500/40 text-cyan-400 text-[11px] font-bold tracking-widest uppercase hover:border-cyan-400 hover:glow-cyan transition-all duration-200 active:scale-95"
        >
          <RefreshCw size={12} className={spinning ? 'animate-spin' : ''} />
          Force Sync
        </button>
        <div className="text-right text-[9px] leading-relaxed">
          <div className="text-cyan-700 font-bold tracking-widest">ABB ACCELERATOR</div>
          <div className="text-slate-600">HACKATHON 2026</div>
        </div>
      </div>
    </header>
  );
}
