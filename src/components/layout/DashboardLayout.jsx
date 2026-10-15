
import { useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import Header from "../dashboard/Header";

export default function DashboardLayout({ children }) {
  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminData");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("adminData");

  navigate("/login", { replace: true });
};

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        setActive={setActive}
        open={sidebarOpen}
        close={() => setSidebarOpen(false)}
      />

      <div className="workspace">
        <Header
          active={active}
          onMenu={() => setSidebarOpen(true)}
        />

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
