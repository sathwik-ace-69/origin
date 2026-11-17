
import { useState } from "react";

import {
  AlertCircleIcon,
  CheckCircleIcon,
  InvestigationIcon,
} from "../components/Icons.jsx";

const initialInvestigations = [
  {
    id: 1,
    merchant: "Amazon",
    category: "Shopping",
    amount: 12999,
    date: "2026-11-10",
    risk: "High",
    reason: "Unusually high spending compared to your previous purchases.",
    evidence:
      "Your average Amazon transaction is ₹2,500. This transaction is approximately 5 times higher.",
    status: "Pending",
  },
  {
    id: 2,
    merchant: "Netflix",
    category: "Entertainment",
    amount: 649,
    date: "2026-11-09",
    risk: "Medium",
    reason: "Recurring subscription price has increased.",
    evidence:
      "Your previous subscription payment was ₹499. The latest payment is ₹649.",
    status: "Pending",
  },
  {
    id: 3,
    merchant: "Swiggy",
    category: "Food",
    amount: 1850,
    date: "2026-11-08",
    risk: "Low",
    reason: "Food delivery spending is higher than your usual pattern.",
    evidence:
      "Your average food delivery transaction is ₹450.",
    status: "Pending",
  },
];

function InvestigationFeed() {
  const [investigations, setInvestigations] = useState(
    initialInvestigations
  );

  const [filter, setFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const updateStatus = (id, newStatus) => {
    setInvestigations((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, status: newStatus }
          : item
      )
    );
  };

  const getRiskColor = (risk) => {
    const styles = {
      High: "border-rose-400/20 bg-rose-500/10 text-rose-300",
      Medium: "border-amber-400/20 bg-amber-500/10 text-amber-300",
      Low: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    };

    return styles[risk] || styles.Low;
  };

  const getStatusColor = (status) => {
    const styles = {
      Pending: "text-amber-300",
      Reviewed: "text-emerald-300",
      Dismissed: "text-slate-400",
    };

    return styles[status] || "text-slate-400";
  };

  const pendingCount = investigations.filter(
    (item) => item.status === "Pending"
  ).length;

  const highRiskCount = investigations.filter(
    (item) => item.risk === "High"
  ).length;

  const reviewedCount = investigations.filter(
    (item) => item.status === "Reviewed"
  ).length;

  const filteredInvestigations =
    filter === "All"
      ? investigations
      : investigations.filter((item) => item.status === filter);

  return (
    <main className="min-h-screen bg-[#080F20] px-5 py-10 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <div className="mb-9">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
            FINANCIAL INVESTIGATION CENTER
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Investigation Feed
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Review unusual transaction patterns, understand the
            supporting evidence and manage investigation statuses.
          </p>
        </div>

        {/* Summary cards */}
        <div className="mb-9 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#142B4D]/50 p-5">
            <p className="text-sm text-slate-400">Pending reviews</p>
            <h2 className="mt-3 text-3xl font-bold text-amber-300">
              {pendingCount}
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              Need your attention
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#142B4D]/50 p-5">
            <p className="text-sm text-slate-400">High-risk records</p>
            <h2 className="mt-3 text-3xl font-bold text-rose-300">
              {highRiskCount}
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              Example high-priority records
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#142B4D]/50 p-5">
            <p className="text-sm text-slate-400">Reviewed</p>
            <h2 className="mt-3 text-3xl font-bold text-emerald-300">
              {reviewedCount}
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              Completed reviews
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Transaction investigations
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredInvestigations.length} records displayed
            </p>
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#142B4D] px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          >
            <option value="All">All investigations</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Dismissed">Dismissed</option>
          </select>
        </div>

        {/* Investigation cards */}
        <div className="space-y-5">
          {filteredInvestigations.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-[#142B4D]/45 p-5 transition hover:border-sky-400/30 sm:p-6"
              >
                {/* Card header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
                      <InvestigationIcon className="h-6 w-6 text-sky-400" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">
                        {item.merchant}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {item.category} · {item.date}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getRiskColor(item.risk)}`}
                  >
                    {item.risk} Risk
                  </span>
                </div>

                {/* Amount */}
                <div className="mt-6">
                  <p className="text-xs text-slate-500">
                    Transaction amount
                  </p>

                  <h2 className="mt-1 text-3xl font-bold">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </h2>
                </div>

                {/* Reason */}
                <div className="mt-6">
                  <p className="text-sm font-semibold text-slate-200">
                    Reason for investigation
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.reason}
                  </p>
                </div>

                {/* Expand evidence */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : item.id)
                  }
                  className="mt-5 text-sm font-semibold text-sky-300 transition hover:text-sky-200"
                >
                  {isExpanded
                    ? "Hide investigation evidence ↑"
                    : "View investigation evidence →"}
                </button>

                {isExpanded && (
                  <div className="mt-4 rounded-xl border border-sky-400/15 bg-[#080F20]/70 p-5">
                    <div className="flex items-center gap-2">
                      <AlertCircleIcon className="h-5 w-5 text-sky-400" />
                      <h4 className="text-sm font-semibold text-sky-300">
                        Supporting evidence
                      </h4>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {item.evidence}
                    </p>

                    <div className="mt-4 border-t border-white/10 pt-4">
                      <p className="text-xs text-slate-500">
                        Current investigation status
                      </p>

                      <p
                        className={`mt-1 text-sm font-semibold ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                  <div>
                    <p className="text-xs text-slate-500">
                      Investigation status
                    </p>

                    <p
                      className={`mt-1 text-sm font-semibold ${getStatusColor(item.status)}`}
                    >
                      {item.status}
                    </p>
                  </div>

                  {item.status === "Pending" ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(item.id, "Reviewed")
                        }
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Mark Reviewed
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(item.id, "Dismissed")
                        }
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400">
                      Action completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredInvestigations.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#142B4D]/40 px-5 py-14 text-center">
              <CheckCircleIcon className="mx-auto h-10 w-10 text-emerald-400" />

              <h3 className="mt-4 font-semibold">
                No investigations found
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                There are no records matching this filter.
              </p>
            </div>
          )}
        </div>

        {/* Demo notice */}
        <div className="mt-8 rounded-xl border border-amber-400/10 bg-amber-400/5 p-4">
          <p className="text-xs leading-6 text-slate-400">
            Demo notice: These are predefined sample investigation
            records. Actual transaction findings and evidence will
            come from the connected analysis backend.
          </p>
        </div>

      </div>
    </main>
  );
}

export default InvestigationFeed;
