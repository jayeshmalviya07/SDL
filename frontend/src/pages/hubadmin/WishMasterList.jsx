import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { toast } from "react-toastify";

const WishMasterList = () => {
  const [wishMasters, setWishMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  const getFileUrl = (url) => {
    if (!url) return "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg";
    if (url.startsWith("/api/uploads/")) return url;
    if (url.startsWith("/api/files/")) return url.replace("/api/files/", "/api/uploads/");
    if (url.startsWith("http")) return url;
    return `/api/uploads/${url}`;
  };

  useEffect(() => {
    fetchWishMasters();
  }, []);

  const fetchWishMasters = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/hubadmin/wishmasters");
      setWishMasters(res.data);
    } catch (error) {
      console.error("Error fetching wish masters");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) {
      fetchWishMasters();
      return;
    }
    try {
      setSearching(true);
      const res = await axiosInstance.get(`/hubadmin/wishmasters/search?employeeId=${searchId}`);
      setWishMasters(res.data);
    } catch (error) {
      console.error("Error searching wish masters");
    } finally {
      setSearching(false);
    }
  };

  const handleAddWishMaster = () => {
    navigate("/RegisterWishMaster");
  };

  const handleViewPerformance = (wmId) => {
    navigate(`/hub/wishmasters/${wmId}/performance`);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this Wish Master? This will move them to the inactive section.")) {
      try {
        await axiosInstance.delete(`/delivery/${id}`);
        toast.success("Wish Master deleted successfully");
        fetchWishMasters();
      } catch (error) {
        console.error("Error deleting wish master:", error);
        toast.error("Failed to delete wish master");
      }
    }
  };

  if (loading && !searching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <p className="text-lg font-semibold animate-pulse">
          Loading Wish Masters...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Wish Masters
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage and monitor delivery partner performance</p>
          </div>

          <button
            onClick={handleAddWishMaster}
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add New Partner
          </button>
        </div>

        {/* Compact Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 mb-8 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by Employee ID..."
              className="block w-full pl-11 pr-4 py-3 bg-transparent border-none focus:ring-0 text-slate-900 font-medium placeholder:text-slate-400"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="flex gap-2">
            {searchId && (
              <button
                onClick={() => { setSearchId(""); fetchWishMasters(); }}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-black transition-all disabled:opacity-50 font-bold"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Partners Grid */}
        {wishMasters.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center">
            <div className="text-4xl mb-4 text-slate-300">🔍</div>
            <h3 className="text-xl font-bold text-slate-900">No Wish Masters Found</h3>
            <p className="text-slate-500">Try adjusting your search or add a new partner</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {wishMasters.map((wm) => (
              <div
                key={wm.id}
                onClick={() => handleViewPerformance(wm.id)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="p-5 flex items-start gap-4">
                  {/* Photo Section */}
                  <div className="relative shrink-0">
                    <img
                      src={getFileUrl(wm.profilePhotoUrl)}
                      alt={wm.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 ring-4 ring-white shadow-sm group-hover:scale-105 transition-all duration-300 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (wm.profilePhotoUrl) window.open(getFileUrl(wm.profilePhotoUrl), "_blank");
                      }}
                      onError={(e) => {
                        e.target.src = "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg";
                      }}
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${wm.approvalStatus === "APPROVED" ? "bg-green-500" : "bg-amber-500"
                      }`}></div>
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {wm.name}
                      </h3>
                      <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                        {wm.employeeId}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mt-0.5">{wm.phone}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${wm.approvalStatus === "APPROVED" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                        }`}>
                        {wm.approvalStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compact Footer */}
                <div className="px-5 pb-5 mt-auto">
                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Rate per job</span>
                      <span className="text-sm font-black text-slate-900">
                        ₹{wm.approvalStatus === "APPROVED" ? wm.approvedRate || wm.proposedRate : wm.proposedRate}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleDelete(e, wm.id)}
                        className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold py-2 px-3 rounded-lg transition-all flex items-center gap-2 text-sm"
                        title="Delete Wish Master"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewPerformance(wm.id); }}
                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 text-sm"
                      >
                        Details
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishMasterList;