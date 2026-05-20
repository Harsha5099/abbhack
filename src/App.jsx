import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import PodSidebar from './components/PodSidebar';
import PodDetail from './components/PodDetail';
import NeuralChat from './components/NeuralChat';
import ClusterOverview from './components/ClusterOverview';
import AnomalyTimeline from './components/AnomalyTimeline';
import PodHealthTable from './components/PodHealthTable';
import { fetchPods, analyzePod, fetchBlastRadius, fetchHistory } from './api/endpoints';

const VIEWS = [
  { id: 'detail', label: 'Pod Detail' },
  { id: 'table',  label: 'Health Table' },
  { id: 'chat',   label: 'Neural Chat' },
];

export default function App() {
  // ── Pods ────────────────────────────────────────────────────────────────────
  const [pods, setPods]               = useState([]);
  const [podsLoading, setPodsLoading] = useState(true);
  const [podsError, setPodsError]     = useState(null);
  const [isOnline, setIsOnline]       = useState(false);
  const [lastSync, setLastSync]       = useState(null);

  // ── Selected pod ────────────────────────────────────────────────────────────
  const [selectedPod, setSelectedPod]         = useState(null);
  const [analysis, setAnalysis]               = useState(null);
  const [blastRadius, setBlastRadius]         = useState(null);
  const [history, setHistory]                 = useState([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingBlast, setLoadingBlast]       = useState(false);
  const [loadingHistory, setLoadingHistory]   = useState(false);
  const [analysisError, setAnalysisError]     = useState(null);

  // ── View ────────────────────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState('detail');

  // ── Load pods ───────────────────────────────────────────────────────────────
  const loadPods = useCallback(async () => {
    try {
      const list = await fetchPods();
      setPods(list);
      setIsOnline(true);
      setPodsError(null);
      setLastSync(new Date().toLocaleTimeString());
    } catch (e) {
      setIsOnline(false);
      setPodsError(e.message);
    } finally {
      setPodsLoading(false);
    }
  }, []);

  useEffect(() => { loadPods(); }, [loadPods]);

  // ── Load pod details ────────────────────────────────────────────────────────
  const loadPodDetails = useCallback(async (pod) => {
    if (!pod?.name) return;
    setLoadingAnalysis(true);
    setLoadingBlast(true);
    setLoadingHistory(true);
    setAnalysis(null);
    setBlastRadius(null);
    setHistory([]);
    setAnalysisError(null);

    Promise.allSettled([
      analyzePod(pod.name),
      fetchBlastRadius(pod.name),
      fetchHistory(pod.name),
    ]).then(([aRes, bRes, hRes]) => {
      if (aRes.status === 'fulfilled') {
        setAnalysis(aRes.value);
      } else {
        setAnalysisError(aRes.reason?.message || 'Analysis failed');
      }
      if (bRes.status === 'fulfilled') setBlastRadius(bRes.value);
      if (hRes.status === 'fulfilled') setHistory(hRes.value);
      setLoadingAnalysis(false);
      setLoadingBlast(false);
      setLoadingHistory(false);
    });
  }, []);

  const handleSelectPod = useCallback((pod) => {
    setSelectedPod(pod);
    loadPodDetails(pod);
    setActiveView('detail');
  }, [loadPodDetails]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden grid-bg">

      {/* Header */}
      <Header onRefresh={loadPods} isOnline={isOnline} lastSync={lastSync} />

      {/* Cluster overview */}
      {pods.length > 0 && <ClusterOverview pods={pods} />}

      {/* Anomaly timeline */}
      {pods.length > 0 && (
        <AnomalyTimeline pods={pods} onSelectPod={handleSelectPod} />
      )}

      {/* Main body */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Sidebar */}
        <PodSidebar
          pods={pods}
          loading={podsLoading}
          error={podsError}
          selectedPod={selectedPod}
          onSelect={handleSelectPod}
        />

        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">

          {/* View tabs */}
          <div className="flex items-center border-b border-slate-800/60 px-4 shrink-0 bg-slate-950/40">
            {VIEWS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                  activeView === id
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
            {selectedPod && (
              <span className="ml-auto text-[9px] text-slate-600 pr-2">
                Active: <span className="text-cyan-600 font-bold truncate max-w-[200px] inline-block align-bottom">{selectedPod.name}</span>
              </span>
            )}
          </div>

          {/* View content */}
          <div className="flex-1 overflow-hidden min-h-0">
            {activeView === 'detail' && (
              <PodDetail
                pod={selectedPod}
                analysis={analysis}
                analysisError={analysisError}
                blastRadius={blastRadius}
                history={history}
                loadingAnalysis={loadingAnalysis}
                loadingBlast={loadingBlast}
                loadingHistory={loadingHistory}
                allPods={pods}
              />
            )}
            {activeView === 'table' && (
              <div className="h-full overflow-y-auto py-3">
                <PodHealthTable
                  pods={pods}
                  onSelect={handleSelectPod}
                  selectedPod={selectedPod}
                />
              </div>
            )}
            {activeView === 'chat' && (
              <NeuralChat selectedPod={selectedPod} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
