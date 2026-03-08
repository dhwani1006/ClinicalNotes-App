import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Header() {
  const location = useLocation();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/new-note": "New Note",
    "/my-notes": "My Notes",
    "/profile": "Profile",
  };

  const currentTitle = pageTitles[location.pathname] || "Dashboard";

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const timeStr = now.toLocaleTimeString();

  return (
    <header className="h-16 bg-white border-b flex items-center px-6">
      {/* Right aligned title + date/time */}
      <div className="ml-auto text-right">
        <h2 className="text-lg font-semibold text-gray-900">{currentTitle}</h2>
        <p className="text-xs text-gray-500">
          {dateStr} • {timeStr}
        </p>
      </div>
    </header>
  );
}
