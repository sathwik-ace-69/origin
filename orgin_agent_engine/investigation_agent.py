
import json
from langchain_core.prompts import ChatPromptTemplate
from schemas import InvestigationReport
from llm_config import get_structured_chain


def run_expense_investigation(data: dict) -> InvestigationReport:

    system_prompt = """You are the Expense Investigation Agent for ORGIN, an AI Personal Finance Investigator.

Your job is not just to classify expenses, but to actively investigate WHY flagged unusual transactions occurred using historical context and analytics.

For every flagged transaction in `flagged_anomalies`:

1. Compare the merchant, amount, and date against historical_context and budgets.
2. Determine if it is a one-time spike, recurring payment, or subscription price hike.
3. Provide a clear explanation backed by exact dates and amounts from historical data.
4. Assign a confidence level (High, Medium, Low).
5. Set clarification_needed to True only if historical data provides zero useful clues.
6. Suggest a concrete corrective action.

Use Additional Analytics Results to support your investigation.

Consider:
- Detected large transactions and duplicates.
- Category spending spikes.
- Recurring payment patterns.
- Gemini transaction categories and confidence scores.
- Budget utilization and spending status.

Cross-check analytics results against original transaction history.
Do not treat predictions as confirmed evidence.
Do not invent dates, amounts, or historical patterns.
"""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", """Investigate the following flagged anomalies based on the user's financial history.

Budgets: {budgets}

Flagged Anomalies: {anomalies}

Historical Transactions: {history}

Additional Analytics Results: {analytics}""")
    ])

    chain = get_structured_chain(prompt, InvestigationReport)

    analytics = data.get("transaction_analytics", {})

    analytics_summary = {
        "categorized_transactions": [
            {
                "transaction_id": item["transaction_id"],
                "merchant": item["merchant"],
                "amount": item["amount"],
                "category": item["category"],
                "confidence": item["confidence"]
            }
            for item in analytics.get("categorized_transactions", [])
        ],
        "anomalies": analytics.get("anomalies", {}),
        "recurring_payments": analytics.get("recurring_payments", []),
        "budget_analytics": analytics.get("budget_analytics", {})
    }

    result = chain.invoke({
        "budgets": json.dumps(data["budgets"], indent=2),
        "anomalies": json.dumps(data["flagged_anomalies"], indent=2),
        "history": json.dumps(data["historical_context"], indent=2),
        "analytics": json.dumps(analytics_summary, indent=2)
    })

    return result


if __name__ == "__main__":

    with open("mock_data.json", "r") as f:
        mock_data = json.load(f)

    print("Running Expense Investigation Agent...")

    report = run_expense_investigation(mock_data)

    print("\nInvestigation Complete!\n")
    print(json.dumps(report.model_dump(), indent=2))
