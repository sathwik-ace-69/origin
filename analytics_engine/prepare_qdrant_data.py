import json
import os
import sys

def prepare_qdrant_data(analytics_data):
    base_directory = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(base_directory, "qdrant_export.json")

    vectors = []

    for transaction in analytics_data["categorized_transactions"]:
        vectors.append({
            "transaction_id": transaction["transaction_id"],
            "user_id": analytics_data["user_id"],
            "merchant": transaction["merchant"],
            "amount": transaction["amount"],
            "category": transaction["category"],
            "vector": transaction["embedding"]
        })

    with open(output_path, "w") as file:
        json.dump(vectors, file, indent=4)

    print("Qdrant export prepared successfully!", file=sys.stderr)
    print("Total vectors:", len(vectors), file=sys.stderr)