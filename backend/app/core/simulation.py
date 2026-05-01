"""Pre-scripted scenario engine.

Selects a scenario branch from scenarios.json based on use case + user inputs,
then applies light parametric overlays so colleagues see their inputs reflected
in the headline, year-by-year events, and agent reactions.

The MiroFish upstream uses LLM agents end-to-end; here we deliberately keep the
output deterministic and presentation-ready. An optional LLM hook
(`enrich_with_llm`) can be wired in later via the OpenAI-compatible client
configured in .env.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

DATA = Path(__file__).resolve().parent.parent / "data"


def _load(name: str) -> Any:
    with (DATA / name).open() as f:
        return json.load(f)


@dataclass
class SimulationRequest:
    use_case: str
    inputs: dict


def _capex_directional(cycle: str) -> str:
    return {
        "Recession": "down 6-10%",
        "Flat": "sideways",
        "Expansion (Recommended)": "up 8-12%",
        "Boom": "up 15-22%",
    }.get(cycle, "sideways")


def _format_strings(obj: Any, ctx: dict) -> Any:
    if isinstance(obj, str):
        try:
            return obj.format(**ctx)
        except (KeyError, IndexError):
            return obj
    if isinstance(obj, list):
        return [_format_strings(x, ctx) for x in obj]
    if isinstance(obj, dict):
        return {k: _format_strings(v, ctx) for k, v in obj.items()}
    return obj


def _agent_lookup(agents: dict, agent_id: str) -> dict | None:
    for bucket in agents.values():
        for a in bucket:
            if a["id"] == agent_id:
                return a
    return None


def run_simulation(req: SimulationRequest) -> dict:
    scenarios = _load("scenarios.json")
    agents = _load("agents.json")

    bucket = scenarios.get(req.use_case)
    if not bucket:
        raise ValueError(f"Unknown use case: {req.use_case}")

    branch = bucket["default"]
    ctx: dict[str, Any] = dict(req.inputs)

    if req.use_case == "competitive_activity":
        actor_obj = _agent_lookup(agents, ctx.get("actor", "")) or {"name": ctx.get("actor", "Unknown")}
        ctx["actor"] = actor_obj.get("name", ctx.get("actor"))
        ctx["move"] = ctx.get("move", "strategic move")
        ctx["segment"] = ctx.get("segment", "industrial AM")
    elif req.use_case == "value_proposition":
        verts = ctx.get("target_verticals", []) or []
        ctx["n_verticals"] = len(verts) if isinstance(verts, list) else 0
        ctx["hot"] = "throughput-driven verticals"
        ctx["cold"] = "qualification-first verticals"
    elif req.use_case == "industrial_market":
        ctx["capex_directional"] = _capex_directional(ctx.get("capex_cycle", "Flat"))
        ctx.setdefault("ai_design_adoption", 40)
        ctx.setdefault("consolidation", 50)
        ctx.setdefault("tariff_regime", "Status quo")
        ctx.setdefault("capex_cycle", "Flat")
    elif req.use_case == "demand_shift":
        vert_id = ctx.get("vertical", "")
        vert_obj = _agent_lookup(agents, vert_id) or {"name": vert_id}
        ctx["vertical"] = vert_obj.get("name", vert_id)
        ctx.setdefault("shock", "demand shock")
        ctx.setdefault("magnitude", 3)
        ctx.setdefault("duration_quarters", 6)
        ctx["realloc_pct"] = 4 + int(ctx.get("magnitude", 3)) * 3

    rendered = _format_strings(branch, ctx)
    rendered["use_case"] = req.use_case
    rendered["inputs_echo"] = req.inputs
    return rendered


def list_use_cases() -> list[dict]:
    return _load("use_cases.json")["use_cases"]


def list_agents() -> dict:
    return _load("agents.json")
