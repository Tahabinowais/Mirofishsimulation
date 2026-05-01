from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any

from app.core.simulation import list_use_cases, list_agents, run_simulation, SimulationRequest

router = APIRouter()


class RunRequest(BaseModel):
    use_case: str
    inputs: dict[str, Any]


@router.get("/use-cases")
def get_use_cases():
    return {"use_cases": list_use_cases()}


@router.get("/agents")
def get_agents():
    return list_agents()


@router.post("/simulate")
def simulate(body: RunRequest):
    try:
        return run_simulation(SimulationRequest(use_case=body.use_case, inputs=body.inputs))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
