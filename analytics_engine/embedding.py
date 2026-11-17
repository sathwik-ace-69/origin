
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is missing from .env")

client = genai.Client(api_key=api_key)

MODEL_NAME = "gemini-embedding-2"
VECTOR_SIZE = 768


def generate_embedding(text):
    if not text or not text.strip():
        raise ValueError("Transaction description cannot be empty")

    response = client.models.embed_content(
        model=MODEL_NAME,
        contents=text,
        config=types.EmbedContentConfig(
            output_dimensionality=VECTOR_SIZE
        )
    )

    return response.embeddings[0].values


def generate_embeddings(texts):
    if not texts:
        return []

    if any(not isinstance(text, str) or not text.strip() for text in texts):
        raise ValueError("All descriptions must be non-empty strings")

    # Give Gemini a separate Content object for each text
    contents = [
        types.Content(
            parts=[types.Part.from_text(text=text)]
        )
        for text in texts
    ]

    response = client.models.embed_content(
        model=MODEL_NAME,
        contents=contents,
        config=types.EmbedContentConfig(
            output_dimensionality=VECTOR_SIZE
        )
    )

    embeddings = response.embeddings or []

    if len(embeddings) != len(texts):
        raise ValueError(
            f"Expected {len(texts)} embeddings, "
            f"but Gemini returned {len(embeddings)}"
        )

    return [item.values for item in embeddings]



if __name__ == "__main__":
    description = "Payment of Rs. 450 at a food delivery restaurant"

    vector = generate_embedding(description)

    print("Embedding generated successfully!")
    print("Vector dimensions:", len(vector))
    print("First 5 values:", vector[:5])
