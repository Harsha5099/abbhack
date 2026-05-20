import { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Bot, User, Loader, Sparkles } from 'lucide-react';
import { askNLP } from '../api/endpoints';

const MACROS = [
  { label: 'Analyze Spikes',      query: 'What caused the recent CPU and memory spikes?' },
  { label: 'Check Bottlenecks',   query: 'Which pods are causing performance bottlenecks?' },
  { label: 'Blast Radius',        query: 'What is the blast radius if the selected pod fails?' },
  { label: 'Memory Forecast',     query: 'Which pods will run out of memory in the next 10 minutes?' },
  { label: 'Top Issues',          query: 'What are the top 3 critical issues in the cluster right now?' },
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? 'bg-cyan-900/60 border border-cyan-500/40' : 'bg-purple-900/60 border border-purple-500/40'
      }`}>
        {isUser
          ? <User size={10} className="text-cyan-400" />
          : <Bot size={10} className="text-purple-400" />
        }
      </div>
      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[11px] leading-relaxed break-words ${
        isUser
          ? 'bg-cyan-950/50 border border-cyan-500/25 text-cyan-100 rounded-tr-sm'
          : 'bg-slate-900/70 border border-purple-500/20 text-slate-300 rounded-tl-sm'
      }`}>
        {msg.content}
      </div>
    </div>
  );
}

export default function NeuralChat({ selectedPod }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'KubeNexus Neural Interface online. Ask me anything about your cluster — pod health, anomalies, forecasts, or blast radius analysis.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (query) => {
    const q = (query || input).trim();
    if (!q || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await askNLP(q);
      const answer = res?.response || res?.answer || res?.result || JSON.stringify(res);
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch (e) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `⚠ Neural interface error: ${e.message}. Backend may be unreachable.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex flex-col h-full glass-dark border-t border-cyan-500/15 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-cyan-500/10 shrink-0">
        <Terminal size={13} className="text-cyan-400" />
        <span className="text-[11px] text-cyan-400 uppercase tracking-widest font-bold">Neural Chat Terminal</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
          <span className="text-[9px] text-emerald-600">ONLINE</span>
        </span>
      </div>

      {/* Macro buttons */}
      <div className="flex gap-1.5 px-3 py-2 border-b border-slate-800/50 overflow-x-auto shrink-0">
        {MACROS.map((m) => (
          <button
            key={m.label}
            onClick={() => send(m.query)}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full glass border border-cyan-500/20 text-[9px] text-cyan-500 font-bold uppercase tracking-wider whitespace-nowrap hover:border-cyan-400/50 hover:text-cyan-300 transition-all disabled:opacity-40"
          >
            <Sparkles size={8} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div className="flex gap-2 animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center shrink-0">
              <Bot size={10} className="text-purple-400" />
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-900/70 border border-purple-500/20">
              <div className="flex gap-1 items-center">
                <Loader size={10} className="text-purple-400 animate-spin" />
                <span className="text-[10px] text-slate-500">Analyzing cluster state…</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2.5 border-t border-slate-800/50 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={selectedPod ? `Ask about ${selectedPod.name}…` : 'Ask about your cluster…'}
            className="flex-1 bg-slate-900/60 border border-cyan-500/20 rounded-xl px-3 py-2 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 resize-none transition-colors leading-relaxed"
            style={{ maxHeight: '80px' }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/30 hover:glow-cyan transition-all disabled:opacity-30 shrink-0"
          >
            <Send size={13} />
          </button>
        </div>
        <div className="text-[8px] text-slate-700 mt-1 text-center">Enter to send · Shift+Enter for newline</div>
      </div>
    </div>
  );
}
