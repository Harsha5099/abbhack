# KubeNexus — Project Context for Kiro

## What is this project?
KubeNexus is a **multi-agent AI observatory for Kubernetes** built for the ABB Accelerator Hackathon 2026.
It collects real-time pod metrics (CPU, RAM, PVC, network, logs) and feeds them into specialized AI agents
that correlate behavior, map dependencies, detect anomalies, and answer plain-English questions about the cluster.

**Tagline:** Beyond monitoring — AI agents that understand, predict, and explain your Kubernetes cluster.

---

## Repository
- GitHub: https://github.com/Harsha5099/abbhack
- Branch `main`     → Python FastAPI backend (AI engine)
- Branch `frontend` → React dashboard (this folder)

---

## Team Structure
| Member | Role |
|---|---|
| Member 1 | Infrastructure + Kubernetes + Prometheus + ngrok data server |
| Member 2 | Multi-agent AI backend (FastAPI + Groq LLM) |
| Member 3 | Anomaly detection + forecasting + time-travel (not yet integrated) |
| Member 4 | React frontend dashboard (this codebase) |

---

## Tech Stack

### Frontend (this repo — `kubenexus-frontend`)
- **Framework:** React 18 + Vite 5
- **Styling:** Tailwind CSS v3 (dark cyberpunk theme, glassmorphism, glow effects)
- **Charts:** Recharts (AreaChart with gradient fills)
- **Icons:** lucide-react
- **No router** — all views managed via React state

### Backend (`kubenexus-ai-backend` — branch `main`)
- **Framework:** Python FastAPI + Uvicorn
- **LLM:** Groq API (`llama-3.3-70b-versatile`) via `groq==0.13.0`
- **Graph:** NetworkX (blast radius / dependency mapping)
- **Anomaly:** scikit-learn + Z-score
- **Forecast:** numpy + sklearn LinearRegression
- **DB:** SQLite (metric history)
- **Env:** `.env` file with `GROQ_API_KEY` (never committed to git)

---

## API Endpoints

### Member 2 Backend — `http://127.0.0.1:8000`
| Endpoint | Description |
|---|---|
| `GET /pods` | List all pods (name, namespace, status) |
| `GET /analyze/{pod}` | Full AI analysis — health_score, severity, root_cause, recommendation, ai_summary, agent_analysis, estimated_cost |
| `GET /blast-radius/{pod}` | Affected downstream services + impact_level string |
| `GET /history/{pod}` | Timestamped metric history array |
| `GET /ask?query=` | NLP chat — returns AI response |
| `GET /cost/{pod}` | Estimated cost in USD/hr |
| `GET /forecast/{pod}` | Predicted CPU/memory values |

### Member 1 Backend — `https://payment-surfboard-think.ngrok-free.dev`
| Endpoint | Description |
|---|---|
| `GET /pods` | Live Kubernetes pod list |
| `GET /metrics/{pod}` | Raw Prometheus metrics (cpu, ram) |
| `GET /logs/{pod}` | Pod log stream |
| `GET /snapshots` | Cluster snapshots |

> Member 1's ngrok URL may change. If `/pods` returns 404, ask Member 1 for the new URL and update `src/api/endpoints.js` → `M1_BASE`.

---

## Frontend File Structure

```
src/
├── App.jsx                    # Root — manages state, view switching, demo mode toggle
├── index.css                  # Tailwind + custom cyberpunk CSS (glow, glass, grid-bg)
├── main.jsx                   # React entry point
│
├── api/
│   ├── endpoints.js           # All fetch calls to Member 2 + Member 1 APIs
│   └── mockData.js            # Fallback mock data (not used in production)
│
├── components/
│   ├── Header.jsx             # Top bar — logo, telemetry status, countdown, force sync, demo button
│   ├── PodSidebar.jsx         # Left sidebar — pod list grouped by namespace, search filter
│   ├── PodDetail.jsx          # Main detail panel — pod identity, tabs (metrics/blast/heatmap)
│   ├── HealthMetrics.jsx      # 3-card row — health gauge, severity badge, cost meter
│   ├── MetricsChart.jsx       # Recharts AreaChart — CPU/memory/network/disk history
│   ├── BlastRadius.jsx        # Cascade tree of affected services
│   ├── AIInsightPanel.jsx     # AI summary + 4 agent cards + remediation
│   ├── NeuralChat.jsx         # Chat terminal — POST to /ask, macro buttons
│   ├── ClusterOverview.jsx    # 5 stat cards — total/running/pending/failed/avg health
│   ├── AnomalyTimeline.jsx    # Collapsible anomaly event list, click to select pod
│   ├── PodHealthTable.jsx     # Sortable table of all pods with health bars
│   ├── DependencyHeatmap.jsx  # D3-style influence matrix grid
│   └── MiniSparkline.jsx      # Tiny inline sparkline (used in pod cards)
│
└── demo/
    ├── DemoPage.jsx           # Full self-contained demo — no backend needed
    └── demoData.js            # Synthetic pod data, scenarios, AI summaries, history generator
```

---

## Key Design Decisions

### CSS Classes (custom — defined in index.css)
- `.glass` — frosted glass card background
- `.glass-dark` — darker glass (used in header/sidebar)
- `.glass-card` — rounded card with border
- `.glow-cyan / .glow-green / .glow-red / .glow-amber / .glow-purple` — box-shadow glows
- `.glow-text-cyan` — text glow
- `.grid-bg` — subtle cyan grid background
- `.skeleton` — shimmer loading placeholder
- `.animate-pulse-glow` — pulsing opacity animation
- `.animate-fade-in` — slide-up fade animation
- `.scan-overlay::after` — CRT scanline effect

### API Field Normalisation
The `analyzePod()` function in `endpoints.js` normalises the backend response so the UI always gets:
- `health_score`, `severity`, `root_cause`, `recommendation`, `ai_summary`
- `estimated_cost` (not `estimated_cost_usd`)
- `agent_analysis.cpu_agent / memory_agent / network_agent / log_agent`
- `cpu_usage`, `memory_usage`

### Demo Mode
- Triggered by the **"Demo Mode"** button in the header
- Completely self-contained — no backend or internet required
- Scenarios: Normal / Warning / Critical / Stress Mode
- Live ticker updates charts every 1.5 seconds
- Neural Chat answers questions using pre-built AI responses
- Used for hackathon judge demos when Member 1's server is offline

---

## How to Run

### Backend
```bash
cd kubenexus-ai-backend
pip install -r requirements.txt
# Create .env with: GROQ_API_KEY=your_key_here
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
cd kubenexus-frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## Important Notes for Kiro

1. **Never commit `.env`** — it contains the Groq API key. It is in `.gitignore`.
2. **Member 1 ngrok URL** changes every session. If pods don't load, update `M1_BASE` in `src/api/endpoints.js`.
3. **Member 3 features** (anomaly timeline backend, time-travel slider, forecast charts) are not yet integrated — the frontend has placeholder components ready.
4. **All API calls** have timeout protection (12s) and error boundaries — never crash the UI.
5. **Tailwind v3** is used (not v4) — use `tailwind.config.js` for customisation, not `@import "tailwindcss"`.
6. **No React Router** — all navigation is pure React state (`activeView`, `demoMode`).
7. **Recharts** — always set `isAnimationActive={false}` on live-updating charts to prevent flicker.
8. **Pod names** are long Kubernetes hashes — always use `truncate` class on any pod name display.
