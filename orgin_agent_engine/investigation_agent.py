import json
from langchain_core.prompts import ChatPromptTemplate
from schemas import InvestigationReport
from llm_config import get_structured_chain

def run_expense_investigation(data: dict) -> InvestigationReport:
    system_prompt = """You are the Expense Investigation Agent for ORGIN, an AI Personal Finance Investigator.
Your job is not just to classify expenses, but to actively investigate WHY flagged unusual transactions occurred using historical context.

For every flagged transaction in `flagged_anomalies`:
1. Compare the merchant, amount, and date against `historical_context` and `budgets`.
2. Determine if it is a one-time spike, a recurring payment, or a stealth subscription price hike.
3. Provide a clear explanation backed by exact dates and amounts from the historical data.
4. Assign a confidence level (High, Medium, Low).
5. Only set `clarification_needed` to True if the historical data gives zero clues (e.g., an unknown merchant with a high spike) and ask a specific question.
6. Suggest a concrete corrective action."""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", """Investigate the following flagged anomalies based on the user's financial history:
        
Budgets: {budgets}
Flagged Anomalies: {anomalies}
Historical Transactions: {history}""")
    ])
    
    chain = get_structured_chain(prompt, InvestigationReport)
    
    result = chain.invoke({
        "budgets": json.dumps(data["budgets"], indent=2),
        "anomalies": json.dumps(data["flagged_anomalies"], indent=2),
        "history": json.dumps(data["historical_context"], indent=2)
    })
    
    return result

if __name__ == "__main__":
    with open("mock_data.json", "r") as f:
        mock_data = json.load(f)
        
    print("Running Expense Investigation Agent...")
    report = run_expense_investigation(mock_data)
    
    print("\nInvestigation Complete!\n")
    print(json.dumps(report.model_dump(), indent=2))
