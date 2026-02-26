import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

const linkClass = (isActive) =>
  `block w-full text-left px-4 py-2 rounded-lg mb-1 transition ${isActive ? "bg-indigo-100 text-indigo-700 font-medium" : "text-gray-700 hover:bg-gray-100"
  }`;

export default function Sidebar() {
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();

  return (
    <div className="w-64 bg-white shadow p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-6 text-indigo-700">SDL</h2>
      <nav className="space-y-1 flex-1">
        {user?.role === "SUPER_ADMIN" && (
          <>
            <Link to="/super" className={linkClass(location.pathname === "/super")}>
              Dashboard
            </Link>
            <Link to="/HubList" className={linkClass(location.pathname === "/HubList")}>
              Hub List
            </Link>
            <Link to="/HubAdminList" className={linkClass(location.pathname === "/HubAdminList")}>
              Hub Admin List
            </Link>
            <Link to="/AddHub" className={linkClass(location.pathname === "/AddHub")}>
              Add Hub
            </Link>
            <Link to="/RegisterHubAdmin" className={linkClass(location.pathname === "/RegisterHubAdmin")}>
              Register Hub Admin
            </Link>
            <Link to="/ApproveWishMaster" className={linkClass(location.pathname === "/ApproveWishMaster")}>
              Wish Master Approvals
            </Link>
            <Link to="/Reports" className={linkClass(location.pathname === "/Reports")}>
              Reports
            </Link>
          </>
        )}
        {user?.role === "HUB_ADMIN" && (
          <>
            <Link to="/hub" className={linkClass(location.pathname === "/hub")}>
              Dashboard
            </Link>
            <Link to="/WishMasterList" className={linkClass(location.pathname === "/WishMasterList")}>
              Wish Master List
            </Link>
            <Link to="/RegisterWishMaster" className={linkClass(location.pathname === "/RegisterWishMaster")}>
              Register Wish Master
            </Link>
            <Link to="/hub/reports" className={linkClass(location.pathname === "/hub/reports")}>
              Reports
            </Link>
          </>
        )}
        {user?.role === "WISH_MASTER" && (
          <>
            <Link to="/DailyEntry" className={linkClass(location.pathname === "/DailyEntry")}>
              Add Daily Entry
            </Link>
            <Link to="/MyEntry" className={linkClass(location.pathname === "/MyEntry")}>
              My Entries
            </Link>
            <Link to="/UniversalReports" className={linkClass(location.pathname === "/UniversalReports")}>
              Reports
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}
