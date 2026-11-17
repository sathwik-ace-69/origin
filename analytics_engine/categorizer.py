from embedding import generate_embedding, generate_embeddings
import math


CATEGORY_EXAMPLES = {
    "Food": [
        "Payment at Swiggy food delivery",
        "Restaurant and cafe bill",
        "Online food order",
        "Zomato payment"
    ],
    "Shopping": [
        "Shopping at Amazon",
        "Clothing purchase at Myntra",
        "Online shopping payment",
        "Purchase of electronics"
    ],
    "Transportation": [
        "Uber cab ride",
        "Ola taxi payment",
        "Petrol station payment",
        "Bus or train ticket"
    ],
    "Subscriptions": [
        "Netflix monthly subscription",
        "Spotify premium payment",
        "Amazon Prime subscription",
        "Monthly streaming service"
    ],
    "Entertainment": [
        "Movie theatre ticket",
        "BookMyShow payment",
        "Concert ticket purchase"
    ],
    "Utilities": [
        "Electricity bill payment",
        "Mobile recharge",
        "Internet broadband bill",
        "Water bill payment"
    ],
    "Education": [
        "College tuition fee",
        "Online course payment",
        "Purchase of educational books"
    ]
}

CATEGORY_TEXTS = []
CATEGORY_LABELS = []

for category, examples in CATEGORY_EXAMPLES.items():
    for example in examples:
        CATEGORY_TEXTS.append(example)
        CATEGORY_LABELS.append(category)

CATEGORY_EMBEDDINGS = None


def load_category_embeddings():
    global CATEGORY_EMBEDDINGS

    if CATEGORY_EMBEDDINGS is None:
        CATEGORY_EMBEDDINGS = generate_embeddings(CATEGORY_TEXTS)

    return CATEGORY_EMBEDDINGS


def cosine_similarity(vector_a, vector_b):
    dot_product = sum(
        a * b for a, b in zip(vector_a, vector_b)
    )

    magnitude_a = math.sqrt(sum(a * a for a in vector_a))
    magnitude_b = math.sqrt(sum(b * b for b in vector_b))

    if magnitude_a == 0 or magnitude_b == 0:
        return 0

    return dot_product / (magnitude_a * magnitude_b)

def categorize_transaction(description, transaction_vector=None):
    category_embeddings = load_category_embeddings()

    if transaction_vector is None:
        transaction_vector = generate_embedding(description)

    category_scores = {}

    for category in CATEGORY_EXAMPLES:
        scores = []

        for index, label in enumerate(CATEGORY_LABELS):
            if label == category:
                score = cosine_similarity(
                    transaction_vector,
                    category_embeddings[index]
                )
                scores.append(score)

        category_scores[category] = sum(scores) / len(scores)

    best_category = max(category_scores, key=category_scores.get)

    return {
        "category": best_category,
        "confidence": round(category_scores[best_category], 4),
        "method": "gemini_embedding"
    }
