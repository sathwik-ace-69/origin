
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const monthlyData = [
  { month: "Jan", income: 70000, expenses: 45000 },
  { month: "Feb", income: 75000, expenses: 50000 },
  { month: "Mar", income: 80000, expenses: 42000 },
  { month: "Apr", income: 72000, expenses: 48000 },
  { month: "May", income: 90000, expenses: 55000 },
  { month: "Jun", income: 85000, expenses: 42500 },
];

const categoryData = [
  { name: "Food", value: 12000 },
  { name: "Shopping", value: 10000 },
  { name: "Transport", value: 6500 },
  { name: "Utilities", value: 8000 },
  { name: "Entertainment", value: 6000 },
];

const chartColors = ["#38BDF8", "#2563EB", "#14B8A6", "#F59E0B", "#F472B6"];

const investigations = [
  {
    title: "Unusual shopping expense",
    description: "A shopping transaction is higher than your usual spending.",
    amount: "₹8,500",
    category: "Shopping",
    confidence: "92%",
    severity: "High",
  },
  {
    title: "Repeated food transactions",
    description: "Several food transactions occurred within a short period.",
    amount: "₹2,400",
    category: "Food",
    confidence: "86%",
    severity: "Medium",
  },
  {
    title: "Unexpected subscription",
    description: "A recurring payment pattern was detected.",
    amount: "₹999",
    category: "Subscription",
    confidence: "89%",
    severity: "Low",
  },
];

const budgets = [
  { name: "Food", spent: 12000, limit: 15000 },
  { name: "Shopping", spent: 10000, limit: 8000 },
  { name: "Transport", spent: 6500, limit: 9000 },
  { name: "Entertainment", spent: 6000, limit: 7000 },
];

const recommendations = [
  {
    number: "01",
    title: "Review shopping expenses",
    description:
      "Your shopping expenses are above the example budget. Review recent purchases and consider adjusting the category limit.",
    impact: "Potential saving: ₹2,000",
  },
  {
    number: "02",
    title: "Monitor food spending",
    description:
      "Food expenses are one of your larger spending categories. Tracking smaller purchases may help identify patterns.",
    impact: "Potential saving: ₹1,000",
  },
  {
    number: "03",
    title: "Review recurring payments",
    description:
      "Check recurring subscriptions and confirm that each service is still useful to you.",
    impact: "Potential saving: ₹999",
  },
];

const sections = [
  { id: "overview", label: "Overview" },
  { id: "analytics", label: "Analytics" },
  { id: "investigations", label: "Investigations" },
  { id: "budgets", label: "Budgets" },
  { id: "recommendations", label: "Recommendations" },
];

const money = (value) => `₹${value.toLocaleString("en-IN")}`;

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-bold text-white sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function StatCard({ label, value, change, icon, accent }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-white/10 bg-[#142B4D]/60 p-5 shadow-lg shadow-black/10"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <span className={`text-xl ${accent}`}>{icon}</span>
      </div>
      <h3 className="mt-4 text-2xl font-bold text-white">{value}</h3>
      <p className="mt-2 text-xs text-slate-400">{change}</p>
    </motion.div>
  );
}

function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("6 months");
  const [selectedInvestigation, setSelectedInvestigation] = useState(null);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  // Tracks the section currently visible on the screen.
  const [activeSection, setActiveSection] = useState("overview");

  // Detects which dashboard section is currently visible.
  useEffect(() => {
    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0,
      }
    );

    sectionElements.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const displayedRecommendations = showAllRecommendations
    ? recommendations
    : recommendations.slice(0, 2);

  return (
    <main className="min-h-screen bg-[#080F20] text-white">
      {/* Dashboard navigation */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#080F20]/90 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
              ORGIN / FINANCIAL INTELLIGENCE
            </p>
            <h1 className="mt-1 text-lg font-bold">Your Financial Space</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`rounded-full border px-3 py-2 text-xs font-medium transition-all duration-300 ${
                    isActive
                      ? "border-sky-400 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "border-white/10 text-slate-400 hover:border-sky-400/50 hover:bg-blue-500/10 hover:text-sky-300"
                  }`}
                >
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] space-y-24 px-5 py-10 sm:px-8 lg:px-10">

        {/* 1. OVERVIEW */}
        <motion.section
          id="overview"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="scroll-mt-28"
        >
          <div className="mb-10 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-sky-400">
                Welcome to ORGIN
              </p>
              <h2 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
                Understand your money.
                <span className="block text-sky-400">
                  Take control of your future.
                </span>
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
                Your personal finance investigation dashboard brings
                spending patterns, unusual transactions, budgets, and
                financial insights together in one place.
              </p>
              <button
                onClick={() => scrollToSection("investigations")}
                className="mt-7 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Explore investigations →
              </button>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-br from-[#142B4D] to-[#0B1930] p-7"
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
              <p className="relative text-sm text-slate-400">
                Remaining balance
              </p>
              <h3 className="relative mt-3 text-4xl font-bold">
                ₹42,500
              </h3>
              <p className="relative mt-3 text-sm text-sky-300">
                Example dashboard data
              </p>
              <div className="relative mt-8 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-600 to-sky-400" />
              </div>
              <div className="relative mt-3 flex justify-between text-xs text-slate-400">
                <span>Income ₹85,000</span>
                <span>Expenses ₹42,500</span>
              </div>
            </motion.div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Income"
              value="₹85,000"
              change="Example monthly income"
              icon="↗"
              accent="text-emerald-400"
            />
            <StatCard
              label="Total Expenses"
              value="₹42,500"
              change="Example monthly expenses"
              icon="↘"
              accent="text-rose-400"
            />
            <StatCard
              label="Remaining Balance"
              value="₹42,500"
              change="Income minus expenses"
              icon="◈"
              accent="text-sky-400"
            />
            <StatCard
              label="Savings"
              value="₹20,000"
              change="Example savings figure"
              icon="✦"
              accent="text-amber-400"
            />
          </div>
        </motion.section>

        {/* 2. ANALYTICS */}
        <section id="analytics" className="scroll-mt-28">
          <SectionHeading
            eyebrow="Financial patterns"
            title="Spending Analytics"
            description="Explore how your income and expenses change over time and understand where your money goes."
          />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-400">Income vs expenses</p>
            <select
              value={selectedPeriod}
              onChange={(event) => setSelectedPeriod(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#142B4D] px-4 py-2 text-sm text-white outline-none focus:border-sky-400"
            >
              <option>6 months</option>
              <option>Monthly</option>
              <option>Yearly</option>
            </select>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-[#142B4D]/50 p-5">
              <h3 className="mb-6 font-semibold">Income and expenses</h3>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid stroke="#ffffff12" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#94A3B8"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#142B4D",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                      formatter={(value) => money(value)}
                    />
                    <Legend />
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#38BDF8"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="expenses"
                      name="Expenses"
                      fill="#2563EB"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#142B4D]/50 p-5">
              <h3 className="font-semibold">Expense distribution</h3>
              <p className="mt-1 text-xs text-slate-400">
                Spending by category
              </p>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={4}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => money(value)}
                      contentStyle={{
                        background: "#142B4D",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INVESTIGATIONS */}
        <section id="investigations" className="scroll-mt-28">
          <SectionHeading
            eyebrow="AI investigation center"
            title="Unusual Activity"
            description="Review example transaction patterns that may deserve attention. These are demonstration records, not actual bank findings."
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {investigations.map((item, index) => (
              <motion.button
                key={item.title}
                onClick={() =>
                  setSelectedInvestigation(
                    selectedInvestigation === index ? null : index
                  )
                }
                whileHover={{ y: -5 }}
                className={`rounded-2xl border p-5 text-left transition ${
                  selectedInvestigation === index
                    ? "border-sky-400 bg-blue-500/10"
                    : "border-white/10 bg-[#142B4D]/50 hover:border-sky-400/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-300">
                    {item.severity} priority
                  </span>
                  <span className="text-sky-400">↗</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Amount</p>
                    <p className="mt-1 text-xl font-bold">{item.amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Confidence</p>
                    <p className="mt-1 font-semibold text-sky-300">
                      {item.confidence}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-xs text-sky-300">
                  {selectedInvestigation === index
                    ? "Hide details ↑"
                    : "View investigation details →"}
                </p>
              </motion.button>
            ))}
          </div>

          {selectedInvestigation !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-2xl border border-sky-400/20 bg-[#142B4D]/70 p-6"
            >
              <h3 className="text-lg font-semibold text-sky-300">
                Investigation details
              </h3>
              <p className="mt-3 text-sm text-slate-300">
                {investigations[selectedInvestigation].description}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-500">Category</p>
                  <p className="mt-1 font-medium">
                    {investigations[selectedInvestigation].category}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Amount</p>
                  <p className="mt-1 font-medium">
                    {investigations[selectedInvestigation].amount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Confidence</p>
                  <p className="mt-1 font-medium">
                    {investigations[selectedInvestigation].confidence}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-xs text-amber-300">
                Demonstration only: connect the investigation API to display
                verified transaction evidence.
              </p>
            </motion.div>
          )}
        </section>

        {/* 4. BUDGETS */}
        <section id="budgets" className="scroll-mt-28">
          <SectionHeading
            eyebrow="Budget intelligence"
            title="Your Budget Tracker"
            description="Compare example spending against category limits and identify categories that need attention."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {budgets.map((budget, index) => {
              const percentage = Math.round(
                (budget.spent / budget.limit) * 100
              );
              const exceeded = budget.spent > budget.limit;

              return (
                <motion.div
                  key={budget.name}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl border border-white/10 bg-[#142B4D]/50 p-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{budget.name}</h3>
                    <span
                      className={`text-xs ${
                        exceeded ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {exceeded ? "Limit exceeded" : "Within budget"}
                    </span>
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <p className="text-2xl font-bold">
                      {money(budget.spent)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Limit {money(budget.limit)}
                    </p>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{
                        width: `${Math.min(percentage, 100)}%`,
                      }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={`h-full rounded-full ${
                        exceeded ? "bg-rose-500" : "bg-sky-400"
                      }`}
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    {percentage}% of budget used
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* 5. RECOMMENDATIONS */}
        <section id="recommendations" className="scroll-mt-28">
          <SectionHeading
            eyebrow="Smart financial insights"
            title="AI Recommendations"
            description="Example recommendations based on the sample spending patterns shown in this dashboard."
          />

          <div className="space-y-4">
            {displayedRecommendations.map((item, index) => (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#142B4D]/50 p-6 sm:flex-row sm:items-center"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 font-bold text-sky-300">
                  {item.number}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>
                </div>
                <p className="whitespace-nowrap text-sm font-semibold text-emerald-300">
                  {item.impact}
                </p>
              </motion.div>
            ))}
          </div>

          <button
            onClick={() =>
              setShowAllRecommendations(!showAllRecommendations)
            }
            className="mt-6 rounded-xl border border-sky-400/30 px-5 py-3 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/10"
          >
            {showAllRecommendations
              ? "Show less ↑"
              : "View all recommendations →"}
          </button>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 py-8 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-sky-400">
            ORGIN
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Agentic Personal Finance Investigator
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Demonstration dashboard using sample data
          </p>
        </footer>
      </div>
    </main>
  );
}

export default Dashboard;
