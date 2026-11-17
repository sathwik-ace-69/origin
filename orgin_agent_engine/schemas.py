from pydantic import BaseModel, Field
from typing import List, Literal

class InvestigationFinding(BaseModel):
    transaction_id: str = Field(description="ID of the flagged transaction")
    merchant: str = Field(description="Merchant name")
    amount: float = Field(description="Transaction amount in INR")
    is_recurring: bool = Field(description="Whether this is a recurring charge or subscription")
    possible_explanation: str = Field(description="Root-cause analysis based on historical evidence")
    supporting_evidence: List[str] = Field(description="Specific past dates, amounts, or patterns backing the finding")
    confidence_level: Literal["High", "Medium", "Low"] = Field(description="Confidence in the investigation")
    clarification_needed: bool = Field(description="True only if evidence is insufficient and user input is required")
    clarification_question: str = Field(description="Question to ask user if clarification_needed is True, else empty string")
    suggested_corrective_action: str = Field(description="Immediate actionable advice for this specific expense")

class InvestigationReport(BaseModel):
    findings: List[InvestigationFinding]

class SimulatedScenario(BaseModel):
    strategy_name: str = Field(description="Name of the budgeting strategy (e.g., 'Moderate Dining Cut')")
    target_categories: List[str] = Field(description="Categories modified in this simulation")
    specific_actions: List[str] = Field(description="Concrete steps like cancelling a subscription or capping weekly spend")
    projected_monthly_savings: float = Field(description="Estimated INR saved per month under this scenario")
    practicality_score: int = Field(description="Score from 1-10 on how realistic this is based on user habits")

class FinancialPlan(BaseModel):
    budget_overrun_warnings: List[str] = Field(description="Categories exceeding or predicted to exceed limits")
    simulated_scenarios: List[SimulatedScenario] = Field(description="2 to 3 simulated alternative budget plans")
    selected_strategy: SimulatedScenario = Field(description="The single best strategy autonomously chosen by the agent")
    selection_reasoning: str = Field(description="Why the agent selected this specific strategy")

class MonitoringReport(BaseModel):
    strategy_evaluated: str = Field(description="Name of the active strategy being monitored")
    compliance_status: Literal["On Track", "Partially Compliant", "Off Track"] = Field(description="Whether the user followed the strategy")
    observed_behavior_summary: str = Field(description="Analysis of new incoming transactions against the strategy rules")
    estimated_actual_savings: float = Field(description="Actual INR saved based on recent behavior")
    decision: Literal["Retain Strategy", "Revise Strategy"] = Field(description="Whether to keep the current plan or adapt it")
    adapted_recommendations: List[str] = Field(description="Updated actionable recommendations based on observed behavior")
