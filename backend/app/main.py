from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.projects import router as projects_router

app = FastAPI(
    title="MiroFish AM Simulation",
    version="0.1.0",
    description="Industrial Additive Manufacturing market simulation, modeled on MiroFish multi-agent prediction.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects_router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "mirofish-am-sim"}
