from prepare_qdrant_data import prepare_qdrant_data
from embedding import generate_embedding
import json
import os
from categorizer import categorize_transaction
from anomaly_detector import (
    detect_large_transactions,
    detect_duplicates,
    detect_category_spikes
)
from recurring_detector import detect_recurring_payments
from budget_analyzer import analyze_budgets


def run_analytics(data=None):
    if data is None:
        base_directory = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(
    base_directory,
    "..",
    "orgin_agent_engine",
    "mock_data.json"
)

        with open(data_path, "r") as file:
            data = json.load(file)
    transactions = data["flagged_anomalies"]
    history = data["historical_context"]

    categorized = []

    for transaction in transactions:
        description = (
            f"Payment of {transaction['amount']} "
            f"at {transaction['merchant']}"
        )

        vector = generate_embedding(description)
        result = categorize_transaction(description, vector)

        categorized.append({
            "transaction_id": transaction["transaction_id"],
            "merchant": transaction["merchant"],
            "amount": transaction["amount"],
            "category": result["category"],
            "confidence": result["confidence"],
            "embedding": vector
        })

    anomalies = {
        "large_transactions": detect_large_transactions(
            transactions, history
        ),
        "duplicates": detect_duplicates(transactions),
        "category_spikes": detect_category_spikes(
            transactions, history
        )
    }

    recurring = detect_recurring_payments(transactions, history)

    budgets = analyze_budgets(data["budgets"])

    return {
        "user_id": data["user_id"],
        "budgets": data["budgets"],
        "flagged_anomalies": transactions,
        "historical_context": history,
        "new_incoming_transactions": data.get(
            "new_incoming_transactions", []
    ),

    "categorized_transactions": categorized,
    "anomalies": anomalies,
    "recurring_payments": recurring,
    "budget_analytics": budgets
}

if __name__ == "__main__":
    result = run_analytics()

    prepare_qdrant_data(result)

    print(json.dumps(result, indent=4))
