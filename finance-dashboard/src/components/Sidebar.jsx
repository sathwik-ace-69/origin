
import {
  DashboardIcon,
  UploadIcon,
  AnalyticsIcon,
  InvestigationIcon,
  BudgetIcon,
  SettingsIcon,
} from "./Icons.jsx";

function Sidebar({ activePage, onNavigate }) {
  const menuItems = [
    { name: "Dashboard", icon: DashboardIcon, enabled: true },
    { name: "Upload Statements", icon: UploadIcon, enabled: true },
    { name: "Spending Analytics", icon: AnalyticsIcon, enabled: false },
    { name: "Investigation Feed", icon: InvestigationIcon, enabled: true },
    { name: "Budget Tracker", icon: BudgetIcon, enabled: false },
    { name: "Settings", icon: SettingsIcon, enabled: false },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#080F20] p-5 text-white">
      {/* Brand */}
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 text-xl font-black shadow-lg shadow-blue-500/20">
          O
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-wide">ORGIN</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Finance Intelligence
          </p>
        </div>
      </div>

      {/* Navigation label */}
      <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Workspace
      </p>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.name;

          return (
            <button
              key={item.name}
              disabled={!item.enabled}
              onClick={() => onNavigate(item.name)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "border border-blue-400/20 bg-blue-600/20 text-sky-300 shadow-lg shadow-blue-950/30"
                  : item.enabled
                    ? "text-slate-400 hover:bg-white/5 hover:text-white"
                    : "cursor-not-allowed text-slate-600 opacity-50"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive
                    ? "text-sky-300"
                    : "text-slate-500 group-hover:text-sky-300"
                }`}
              />

              <span className="flex-1">{item.name}</span>

              {!item.enabled && (
                <span className="rounded-md bg-white/5 px-1.5 py-1 text-[9px] text-slate-500">
                  SOON
                </span>
              )}

              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom information */}
      <div className="mt-8 rounded-2xl border border-blue-400/10 bg-gradient-to-br from-[#142B4D] to-[#0B1930] p-4">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-sky-300">
          ✦
        </div>
        <h3 className="text-sm font-semibold">Financial Intelligence</h3>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Investigate patterns and understand your finances.
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-wider text-sky-400">
          ORGIN Workspace
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
