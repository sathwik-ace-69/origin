import json
from typing import TypedDict, Optional
from langgraph.graph import StateGraph, START, END

from investigation_agent import run_expense_investigation
from planning_agent import run_financial_planning
from monitoring_agent import run_monitoring_agent

class OrginAgentState(TypedDict):
    input_data: dict
    investigation_report: Optional[dict]
    financial_plan: Optional[dict]
    monitoring_report: Optional[dict]

def investigation_node(state: OrginAgentState):
    print("-> [Orchestrator] Routing to Expense Investigation Agent...")
    report = run_expense_investigation(state["input_data"])
    return {"investigation_report": report.model_dump()}

def planning_node(state: OrginAgentState):
    print("-> [Orchestrator] Routing to Financial Planning & Simulation Agent...")
    plan = run_financial_planning(state["input_data"], state["investigation_report"])
    return {"financial_plan": plan.model_dump()}

def monitoring_node(state: OrginAgentState):
    print("-> [Orchestrator] Routing to Monitoring & Adaptation Agent...")
    selected_strategy = state["financial_plan"]["selected_strategy"]
    monitoring = run_monitoring_agent(state["input_data"], selected_strategy)
    return {"monitoring_report": monitoring.model_dump()}

def should_monitor(state: OrginAgentState):
    new_tx = state["input_data"].get("new_incoming_transactions", [])
    if new_tx:
        return "monitoring_agent"
    return END

def build_orgin_graph():
    workflow = StateGraph(OrginAgentState)
    workflow.add_node("investigation_agent", investigation_node)
    workflow.add_node("planning_agent", planning_node)
    workflow.add_node("monitoring_agent", monitoring_node)

    workflow.add_edge(START, "investigation_agent")
    workflow.add_edge("investigation_agent", "planning_agent")
    workflow.add_conditional_edges("planning_agent", should_monitor)
    workflow.add_edge("monitoring_agent", END)

    return workflow.compile()

if __name__ == "__main__":
    with open("mock_data.json", "r") as f:
        mock_data = json.load(f)

    print("Starting ORGIN Central Agentic Orchestrator...\n")
    app = build_orgin_graph()
    final_state = app.invoke({"input_data": mock_data})

    output_payload = {
        "user_id": mock_data["user_id"],
        "investigation_report": final_state.get("investigation_report"),
        "financial_plan": final_state.get("financial_plan"),
        "monitoring_report": final_state.get("monitoring_report")
    }

    with open("final_agent_output.json", "w") as out_f:
        json.dump(output_payload, out_f, indent=2)

    print("\nAll Agents Finished! Full pipeline output saved to 'final_agent_output.json':\n")
    print(json.dumps(output_payload, indent=2))
