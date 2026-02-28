import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative z-50 w-72 max-w-full h-full bg-white shadow-xl">
            <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="flex-1 p-4 md:p-6 overflow-auto">{children}</div>
      </div>
    </div>
  );
};
