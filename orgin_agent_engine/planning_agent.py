import json
from langchain_core.prompts import ChatPromptTemplate
from schemas import FinancialPlan, InvestigationReport
from llm_config import get_structured_chain
from investigation_agent import run_expense_investigation

def run_financial_planning(data: dict, investigation_report: dict) -> FinancialPlan:
    system_prompt = """You are the Financial Planning and Simulation Agent for ORGIN, an AI Personal Finance Investigator.
Your role is to analyze budget utilization, review findings from the Expense Investigation Agent, simulate 2 to 3 alternative saving strategies, and autonomously select the most practical one.

Follow these strict rules:
1. Compare `current_spent` against `monthly_limit` in `budgets` to generate exact `budget_overrun_warnings` (include exact INR overruns).
2. Design 3 distinct `simulated_scenarios` (e.g., Conservative, Balanced, Aggressive) that directly address the investigated anomalies and budget overruns.
3. Calculate realistic `projected_monthly_savings` in INR for each scenario and assign a `practicality_score` (1-10) based on how sustainable it is for the user.
4. Autonomously choose the single best strategy in `selected_strategy` (balancing good savings with a high practicality score) and justify your choice in `selection_reasoning`."""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", """Generate budget warnings, simulate saving strategies, and select the optimal plan based on the following data:

Monthly Income: ₹{income}
Budgets & Current Spending: {budgets}
Investigation Findings: {investigation}""")
    ])

    chain = get_structured_chain(prompt, FinancialPlan)

    result = chain.invoke({
        "income": data["monthly_income"],
        "budgets": json.dumps(data["budgets"], indent=2),
        "investigation": json.dumps(investigation_report, indent=2)
    })

    return result

if __name__ == "__main__":
    with open("mock_data.json", "r") as f:
        mock_data = json.load(f)

    print("1. Running Expense Investigation Agent...")
    inv_report = run_expense_investigation(mock_data)

    print("2. Running Financial Planning & Simulation Agent...")
    plan = run_financial_planning(mock_data, inv_report.model_dump())

    print("\nFinancial Plan & Simulation Complete!\n")
    print(json.dumps(plan.model_dump(), indent=2))
