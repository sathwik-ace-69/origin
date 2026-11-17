
import { BellIcon, SearchIcon } from "./Icons.jsx";

function Header({ activePage }) {
  const pageDetails = {
    Dashboard: {
      title: "Financial Overview",
      subtitle: "Your financial intelligence at a glance",
    },
    "Upload Statements": {
      title: "Upload Statements",
      subtitle: "Import your financial data for analysis",
    },
    "Investigation Feed": {
      title: "Investigation Center",
      subtitle: "Explore unusual financial activity and evidence",
    },
  };

  const currentPage = pageDetails[activePage] || pageDetails.Dashboard;

  return (
    <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#0B1930] px-6 py-5 sm:px-8">
      <div>
        <h2 className="text-xl font-bold text-white">
          {currentPage.title}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {currentPage.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 md:flex">
          <SearchIcon className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-500">
            Financial workspace
          </span>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:border-sky-400/40 hover:text-sky-300"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-sky-400" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-400/30 bg-blue-500/20 font-bold text-sky-300">
          S
        </div>
      </div>
    </header>
  );
}

export default Header;
