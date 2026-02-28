import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import axiosInstance from "../../services/axiosInstance";

export default function Navbar({ onMenuClick }) {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user?.role === "HUB_ADMIN") {
      axiosInstance
        .get("/hubadmin/profile")
        .then((res) => setProfile(res.data))
        .catch((err) => console.error("Failed to fetch profile", err));
    } else if (user?.role === "WISH_MASTER") {
      axiosInstance
        .get("/delivery/my-profile")
        .then((res) => setProfile(res.data))
        .catch((err) => console.error("Failed to fetch WM profile", err));
    }
  }, [user?.role]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isHubAdmin = user?.role === "HUB_ADMIN" && profile;
  const isWishMaster = user?.role === "WISH_MASTER" && profile;

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-5 py-3 flex items-center justify-between gap-3">
      {/* Left side — menu + profile info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex md:hidden items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Open navigation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {isWishMaster ? (
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Profile Avatar */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md shrink-0">
              {profile.name?.charAt(0)?.toUpperCase() || "W"}
            </div>

            {/* Name & Employee ID */}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-gray-800 leading-tight truncate">
                {profile.name}
              </span>
              <span className="text-xs text-gray-500 leading-tight truncate">
                ID: {profile.employeeId}
              </span>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-gray-200 mx-1" />

            {/* Detail pills */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                📞 {profile.phone || "N/A"}
              </span>
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                🏍️ {profile.vehicleNumber || "N/A"}
              </span>
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                💰 ₹{profile.approvedRate ?? profile.proposedRate ?? "N/A"}/parcel
              </span>
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                🏢 {profile.hubName || "N/A"}
              </span>
            </div>
          </div>
        ) : isHubAdmin ? (
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Avatar circle */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow shrink-0">
              {profile.name?.charAt(0)?.toUpperCase() || "H"}
            </div>

            {/* Details */}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-gray-800 leading-tight truncate">
                {profile.name}
              </span>
              <span className="text-xs text-gray-500 leading-tight truncate">
                @{profile.username || "—"}
              </span>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-gray-200 mx-1" />

            {/* Hub details pills */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {profile.hubName || "N/A"}
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.city || "N/A"}
              </span>
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {profile.email}
              </span>
            </div>
          </div>
        ) : (
          <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
            {user?.name || user?.sub || "Shridigambara"}
          </h1>
        )}
      </div>

      {/* Right side — role badge + logout */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {isWishMaster && (
          <span className="hidden md:inline-flex items-center bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
            🏍️ Wish Master
          </span>
        )}
        {isHubAdmin && (
          <span className="hidden md:inline-flex items-center bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
            Hub Admin
          </span>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}
