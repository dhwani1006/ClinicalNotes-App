import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, FilePlus, FileText, User, LogOut, Settings } from "lucide-react";
import Header from "./Header";

export default function Layout() {
  const navigate = useNavigate();

  const location = useLocation();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/new-note": "New Note",
    "/my-notes": "My Notes",
    "/profile": "Profile",
  };

  const currentTitle = pageTitles[location.pathname] || "Dashboard";

  const menu = [
    { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { name: "New Note", to: "/new-note", icon: FilePlus },
    { name: "My Notes", to: "/my-notes", icon: FileText },
    { name: "Settings", to: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#f6f9ff] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#1877F2] to-[#0f5ed7] text-white flex flex-col">
        <div className="px-6 py-5 border-b border-white/20">
          <h1 className="text-xl font-bold">Clinical Notes</h1>
          <p className="text-xs text-white/80 mt-1">{currentTitle}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${isActive
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10"
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/20">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/signin", { replace: true });
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Header (COMMON) */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
