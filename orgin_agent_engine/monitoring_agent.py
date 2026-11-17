import json
from langchain_core.prompts import ChatPromptTemplate
from schemas import MonitoringReport
from llm_config import get_structured_chain

def run_monitoring_agent(data: dict, selected_strategy: dict) -> MonitoringReport:
    system_prompt = """You are the Monitoring and Adaptation Agent for ORGIN, an AI Personal Finance Investigator.
Your job is to evaluate new incoming transactions against the user's active saving strategy, measure progress, and decide whether to retain or revise the strategy.

Follow these strict steps:
1. Compare `new_incoming_transactions` against the `specific_actions` in `selected_strategy`.
2. Check if weekly food spending stayed under the cap, if subscriptions were adjusted, and if shopping stayed disciplined.
3. Determine `compliance_status` ("On Track", "Partially Compliant", or "Off Track").
4. Choose "Retain Strategy" if it is working well, or "Revise Strategy" if the user slipped up in a category (like Shopping) and provide updated `adapted_recommendations`."""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", """Evaluate the user's financial behavior based on the active strategy and new transactions:

Active Strategy: {strategy}
Current Budgets: {budgets}
New Incoming Transactions (Next 7 Days): {new_tx}""")
    ])

    chain = get_structured_chain(prompt, MonitoringReport)

    result = chain.invoke({
        "strategy": json.dumps(selected_strategy, indent=2),
        "budgets": json.dumps(data["budgets"], indent=2),
        "new_tx": json.dumps(data.get("new_incoming_transactions", []), indent=2)
    })

    return result
