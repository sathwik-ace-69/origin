import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from orchestrator import build_orgin_graph

app = FastAPI(
    title="ORGIN Agentic Engine API (Member 3)",
    description="LangGraph Multi-Agent Investigation, Planning, Simulation & Monitoring Engine"
)

# Enable CORS so Member 4's React.js frontend can call this API directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AgentInputPayload(BaseModel):
    user_id: str
    monthly_income: float
    budgets: Dict[str, Any]
    flagged_anomalies: List[Dict[str, Any]]
    historical_context: List[Dict[str, Any]]
    new_incoming_transactions: Optional[List[Dict[str, Any]]] = []

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "orgin_agent_engine"}

@app.get("/api/agent/demo")
def get_demo_output():
    """Returns the pre-computed or live mock investigation report for Frontend testing."""
    if os.path.exists("final_agent_output.json"):
        with open("final_agent_output.json", "r") as f:
            return json.load(f)
    with open("mock_data.json", "r") as f:
        mock_data = json.load(f)
    graph = build_orgin_graph()
    final_state = graph.invoke({"input_data": mock_data})
    return {
        "user_id": mock_data["user_id"],
        "investigation_report": final_state.get("investigation_report"),
        "financial_plan": final_state.get("financial_plan"),
        "monitoring_report": final_state.get("monitoring_report")
    }

@app.post("/api/agent/investigate")
def run_live_investigation(payload: AgentInputPayload):
    """Receives live processed data from Member 1 & 2 and runs the full LangGraph pipeline."""
    try:
        input_data = payload.model_dump()
        graph = build_orgin_graph()
        final_state = graph.invoke({"input_data": input_data})
        return {
            "user_id": input_data["user_id"],
            "investigation_report": final_state.get("investigation_report"),
            "financial_plan": final_state.get("financial_plan"),
            "monitoring_report": final_state.get("monitoring_report")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
