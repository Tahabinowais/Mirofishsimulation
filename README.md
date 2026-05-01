# MiroFish · Industrial Additive Manufacturing Simulator

A multi-agent simulator for the industrial additive manufacturing (AM) market,
modeled on the [MiroFish](https://github.com/666ghj/MiroFish) prediction-engine
architecture. Built so a team can pick a use case, configure inputs, and watch
a 3-year strategic forecast play out across **metal AM**, **polymer AM**, and
**service-bureau / on-demand** segments — with OEMs, end-customer verticals,
and materials suppliers reacting in turn.

## Use cases

1. **Competitive Activity** — simulate how rivals respond to a market move
2. **Test a Value Proposition** — pressure-test positioning with simulated buyers
3. **Industrial AM Market** — top-down 3-year evolution under macro variables
4. **End-User Demand Shift** — vertical-specific demand shock and ripple

## Run locally

### Option A — Docker (recommended)

```bash
cp .env.example .env
docker compose up --build
# Frontend: http://localhost:5173
# API:      http://localhost:8000/api/health
```

### Option B — Native

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (separate shell)
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

## Architecture

```
backend/   FastAPI service. Loads agents.json, use_cases.json, scenarios.json
           and resolves a deterministic 3-year scenario per request.
frontend/  Vue 3 + Vite SPA. Use-case picker → project console → result panel.
```

The simulation engine is **pre-scripted**: scenarios are hand-authored in
`backend/app/data/scenarios.json`, with light parametric overlays that reflect
user inputs (selected actor, segment, tariff regime, magnitude, etc.) into the
headline, year-by-year events, and KPIs.

This keeps demos fast, deterministic, and presentation-ready. The `.env`
contains placeholders for an optional LLM enrichment hook (OpenAI-SDK-compatible)
matching upstream MiroFish, if you later want live agent narration.

## Editing scenarios

To add or refine a scenario for your team's discussion:

- **Add an agent** (OEM, end-customer vertical, or materials supplier):
  `backend/app/data/agents.json`
- **Add or edit a use case input form**: `backend/app/data/use_cases.json`
- **Edit the 3-year branch text and KPIs**: `backend/app/data/scenarios.json`

No code changes are required for any of these — the frontend renders directly
from the API response.
