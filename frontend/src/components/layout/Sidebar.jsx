import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

const NavLink = ({ to, icon, label, isActive }) => (
  <Link
    to={to}
    className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 mb-1 ${isActive
      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
      : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
      }`}
  >
    <div className={`transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500"}`}>
      {icon}
    </div>
    <span className="font-semibold text-sm tracking-tight">{label}</span>
  </Link>
);

export default function Sidebar() {
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();

  const icons = {
    dashboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    hubs: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    admins: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    add: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    approvals: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    reports: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    entries: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    archive: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
  };

  return (
    <div className="w-72 h-screen bg-white border-r border-slate-100 flex flex-col sticky top-0">
      {/* Logo Section */}
      <div className="p-8 pb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">
            S
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight">Shree Digambara</h2>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Logistics CMS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-4">Main Menu</p>

        {user?.role === "SUPER_ADMIN" && (
          <div className="space-y-1">
            <NavLink to="/super" label="Dashboard" icon={icons.dashboard} isActive={location.pathname === "/super"} />
            <NavLink to="/HubList" label="Hub List" icon={icons.hubs} isActive={location.pathname === "/HubList"} />
            <NavLink to="/HubAdminList" label="Hub Admin List" icon={icons.admins} isActive={location.pathname === "/HubAdminList"} />
            <NavLink to="/AddHub" label="Add Hub" icon={icons.add} isActive={location.pathname === "/AddHub"} />
            <NavLink to="/RegisterHubAdmin" label="Register Hub Admin" icon={icons.add} isActive={location.pathname === "/RegisterHubAdmin"} />
            <NavLink to="/ApproveWishMaster" label="Wish Master Approvals" icon={icons.approvals} isActive={location.pathname === "/ApproveWishMaster"} />
            <NavLink to="/Reports" label="Reports" icon={icons.reports} isActive={location.pathname === "/Reports"} />
            <NavLink to="/InactiveUsers" label="Inactive Users" icon={icons.archive} isActive={location.pathname === "/InactiveUsers"} />
          </div>
        )}

        {user?.role === "HUB_ADMIN" && (
          <div className="space-y-1">
            <NavLink to="/hub" label="Dashboard" icon={icons.dashboard} isActive={location.pathname === "/hub"} />
            <NavLink to="/WishMasterList" label="Wish Master List" icon={icons.admins} isActive={location.pathname === "/WishMasterList"} />
            <NavLink to="/RegisterWishMaster" label="Register Wish Master" icon={icons.add} isActive={location.pathname === "/RegisterWishMaster"} />
            <NavLink to="/hub/reports" label="Reports" icon={icons.reports} isActive={location.pathname === "/hub/reports"} />
          </div>
        )}

        {user?.role === "WISH_MASTER" && (
          <div className="space-y-1">
            <NavLink to="/DailyEntry" label="Add Daily Entry" icon={icons.entries} isActive={location.pathname === "/DailyEntry"} />
            <NavLink to="/MyEntry" label="My Entries" icon={icons.reports} isActive={location.pathname === "/MyEntry"} />
            <NavLink to="/UniversalReports" label="Reports" icon={icons.reports} isActive={location.pathname === "/UniversalReports"} />
          </div>
        )}
      </nav>

      {/* Profile Section */}
      <div className="p-6 border-t border-slate-50">
        <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 transition-colors hover:bg-slate-100 cursor-pointer">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold uppercase ring-2 ring-white">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">{user?.name || "User"}</p>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight truncate">
              {user?.role?.replace("_", " ") || "Guest"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
