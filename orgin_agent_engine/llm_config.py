import time
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables import RunnableLambda

load_dotenv()

ACTIVE_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-omni-flash-preview",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-4-hydrogen",
    "gemini-4-carbon",
    "gemini-4-argon",
    "gemini-3.8-flash"
]

def get_structured_chain(prompt, schema_class):
    def invoke_with_resilience(inputs):
        last_error = None
        for round_num in range(2):
            for model_name in ACTIVE_MODELS:
                try:
                    llm = ChatGoogleGenerativeAI(
                        model=model_name,
                        max_retries=1,
                        timeout=25
                    ).with_structured_output(schema_class)
                    chain = prompt | llm
                    res = chain.invoke(inputs)
                    time.sleep(1)
                    return res
                except Exception as e:
                    last_error = e
                    time.sleep(1.5)
            time.sleep(3)
        raise last_error

    return RunnableLambda(invoke_with_resilience)
