
import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import UploadStatements from "./pages/UploadStatements.jsx";
import InvestigationFeed from "./pages/InvestigationFeed.jsx";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [activePage]);

  return (
    <div className="flex min-h-screen bg-[#080F20] text-white">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <div className="min-w-0 flex-1">
        <Header activePage={activePage} />

        {activePage === "Dashboard" && <Dashboard key="dashboard" />}

        {activePage === "Upload Statements" && (
          <UploadStatements key="upload" />
        )}

        {activePage === "Investigation Feed" && (
          <InvestigationFeed key="investigations" />
        )}
      </div>
    </div>
  );
}

export default App;
