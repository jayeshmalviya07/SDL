import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import {
  getAllHubs,
  getSuperAdminWishMastersByHub,
  searchSuperAdminWishMasters,
  downloadWishMasterList,
  downloadWishMasterListPdf
} from "../../services/reportService";

const Reports = () => {
  const navigate = useNavigate();

  // Persistent state using session storage
  const [viewMode, setViewMode] = useState(() => sessionStorage.getItem("reportViewMode") || "CITIES");
  const [selectedCityName, setSelectedCityName] = useState(() => sessionStorage.getItem("selectedCityName") || "");
  const [selectedHub, setSelectedHub] = useState(() => sessionStorage.getItem("selectedHub") || "");
  const [hubs, setHubs] = useState([]);
  const [uniqueCities, setUniqueCities] = useState([]);
  const [wishMasters, setWishMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Update session storage when state changes
  useEffect(() => {
    sessionStorage.setItem("reportViewMode", viewMode);
    sessionStorage.setItem("selectedCityName", selectedCityName);
    sessionStorage.setItem("selectedHub", selectedHub);
  }, [viewMode, selectedCityName, selectedHub]);

  useEffect(() => {
    fetchHubs();
    // If we recovered a state on refresh, fetch reports automatically if a hub was selected
    if (viewMode === "PERFORMANCE" && selectedHub) {
      fetchReports(selectedHub);
    }
  }, []);

  const fetchHubs = async () => {
    setLoading(true);
    try {
      const data = await getAllHubs();
      setHubs(data);
      const cities = [...new Set(data.map(hub => hub.city).filter(Boolean))].sort();
      setUniqueCities(cities);
    } catch (error) {
      console.error("Error fetching hubs", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (hubId) => {
    setLoading(true);
    setViewMode("PERFORMANCE");
    try {
      const data = await getSuperAdminWishMastersByHub(hubId, startDate, endDate);
      setWishMasters(data);
    } catch (error) {
      console.error("Error fetching reports", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setViewMode("SEARCH");
    try {
      const data = await searchSuperAdminWishMasters(search.trim(), startDate, endDate);
      setWishMasters(data);
    } catch (error) {
      console.error("Error searching", error);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setViewMode("CITIES");
    setSelectedCityName("");
    setSelectedHub("");
    setSearch("");
    setStartDate("");
    setEndDate("");
    setWishMasters([]);
    sessionStorage.clear();
  };

  // Skeleton Components for better loading UX
  const CitySkeleton = () => (
    <div className="animate-pulse bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-8 flex flex-col items-center">
      <div className="w-20 h-20 bg-slate-200 rounded-3xl mb-4"></div>
      <div className="h-6 w-24 bg-slate-200 rounded-lg mb-2"></div>
      <div className="h-3 w-16 bg-slate-100 rounded-lg"></div>
    </div>
  );

  const HubSkeleton = () => (
    <div className="animate-pulse bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col items-start">
      <div className="w-12 h-12 bg-slate-200 rounded-2xl mb-4"></div>
      <div className="h-5 w-32 bg-slate-200 rounded-lg mb-2"></div>
      <div className="h-3 w-16 bg-slate-100 rounded-lg"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 px-4 sm:px-6 lg:px-10 py-6">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/super')}
              className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl transition-all shadow-sm group"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                Reports <span className="text-indigo-600">Analytics</span>
              </h2>
              <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 font-medium">
                <button
                  onClick={resetAll}
                  className={`hover:text-indigo-600 transition-colors ${viewMode === 'CITIES' ? 'text-indigo-600 font-bold' : ''}`}
                >
                  All Cities
                </button>
                {selectedCityName && (
                  <>
                    <span className="text-slate-300">/</span>
                    <button
                      onClick={() => setViewMode("HUBS")}
                      className={`hover:text-indigo-600 transition-colors ${viewMode === 'HUBS' ? 'text-indigo-600 font-bold' : ''}`}
                    >
                      {selectedCityName}
                    </button>
                  </>
                )}
                {selectedHub && (
                  <>
                    <span className="text-slate-300">/</span>
                    <span className="text-indigo-600 font-bold">
                      {hubs.find(h => h.id.toString() === selectedHub.toString())?.name || "Detailed Report"}
                    </span>
                  </>
                )}
                {viewMode === 'SEARCH' && (
                  <>
                    <span className="text-slate-300">/</span>
                    <span className="text-indigo-600 font-bold">Global Search</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic View Area */}
        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 min-h-[500px]">

          {/* Step 1: Browse Cities + prominent GLOBAL SEARCH */}
          {viewMode === "CITIES" && (
            <div>
              <div className="mb-12">
                <div className="max-w-xl mb-10">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Global Search</h3>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search by Employee ID across all hubs..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-14 pr-32 py-5 bg-slate-50 border-2 border-slate-50 shadow-inner rounded-3xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-base font-bold placeholder:text-slate-400"
                    />
                    <div className="absolute inset-y-2 right-2">
                      <button
                        onClick={handleSearch}
                        className="h-full px-6 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-black transition-colors shadow-lg active:scale-95"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-black text-slate-800">Browse by City</h3>
                  <p className="text-slate-500 font-medium tracking-tight">Select a delivery zone to view regional hubs</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(loading && uniqueCities.length === 0) ? (
                  Array(8).fill(0).map((_, i) => <CitySkeleton key={i} />)
                ) : (
                  uniqueCities.map(city => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCityName(city);
                        setViewMode("HUBS");
                      }}
                      className="group relative flex flex-col items-center justify-center p-8 bg-slate-50 hover:bg-white border-2 border-transparent hover:border-indigo-100 rounded-[2rem] transition-all hover:shadow-2xl hover:shadow-indigo-100/50 active:scale-95 text-center overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-indigo-600 text-white p-2 rounded-full shadow-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <span className="text-xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600">{city}</span>
                      <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                        {hubs.filter(h => h.city === city).length} Hubs Present
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2: Browse Hubs in City */}
          {viewMode === "HUBS" && (
            <div>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Hubs in {selectedCityName}</h3>
                  <p className="text-slate-500 font-medium">Select a direct hub to generate performance reports</p>
                </div>
                <button
                  onClick={() => setViewMode("CITIES")}
                  className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-600 hover:text-white px-6 py-3 rounded-2xl transition-all shadow-sm active:scale-95 group"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Cities
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(loading && hubs.filter(h => h.city === selectedCityName).length === 0) ? (
                  Array(6).fill(0).map((_, i) => <HubSkeleton key={i} />)
                ) : (
                  hubs
                    .filter(h => h.city === selectedCityName)
                    .map(hub => (
                      <button
                        key={hub.id}
                        onClick={() => {
                          setSelectedHub(hub.id);
                          fetchReports(hub.id);
                        }}
                        className="group flex flex-col items-start p-6 bg-slate-50 hover:bg-indigo-600 border border-slate-100 hover:border-indigo-600 rounded-3xl transition-all hover:shadow-xl hover:shadow-indigo-200 active:scale-95 text-left"
                      >
                        <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="text-lg font-black text-slate-800 group-hover:text-white leading-tight mb-1">{hub.name}</span>
                        <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-100 uppercase tracking-wider">{hub.hubId}</span>
                      </button>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Table Content (Performance & Search) */}
          {(viewMode === "PERFORMANCE" || viewMode === "SEARCH") && (
            <div>
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setViewMode(viewMode === "SEARCH" ? "CITIES" : "HUBS")}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm font-black text-xs uppercase tracking-widest group active:scale-95"
                  >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">
                      {viewMode === "SEARCH" ? "Search Results" : "Performance Metrics"}
                    </h3>
                    <p className="text-slate-500 font-medium">Detailed delivery data and exports</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Premium Date Range Picker */}
                  <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-3xl border border-slate-100 shadow-inner">
                    <div className="flex items-center gap-2 group px-4 py-2 hover:bg-white rounded-2xl transition-all cursor-pointer">
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none">From</span>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer p-0 h-4 text-slate-700"
                        />
                      </div>
                    </div>
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <div className="flex items-center gap-2 group px-4 py-2 hover:bg-white rounded-2xl transition-all cursor-pointer">
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none">To</span>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer p-0 h-4 text-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={viewMode === "SEARCH" ? handleSearch : () => fetchReports(selectedHub)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black text-xs hover:bg-black transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center gap-2 group"
                  >
                    Apply Analysis
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>

                  <div className="flex gap-3 ml-2">
                    <button
                      onClick={() => downloadWishMasterList(wishMasters)}
                      disabled={wishMasters.length === 0}
                      className="group flex items-center gap-2 px-6 py-4 bg-emerald-50 text-emerald-700 rounded-3xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-30 disabled:scale-100 font-black text-xs uppercase tracking-wider"
                      title="Export Excel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="hidden sm:inline">Excel</span>
                    </button>
                    <button
                      onClick={() => downloadWishMasterListPdf(wishMasters, startDate, endDate)}
                      disabled={wishMasters.length === 0}
                      className="group flex items-center gap-2 px-6 py-4 bg-rose-50 text-rose-700 rounded-3xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-30 disabled:scale-100 font-black text-xs uppercase tracking-wider"
                      title="Save PDF"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-50/30 rounded-[2rem]">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute top-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-slate-400 font-bold mt-8 tracking-widest uppercase text-[10px]">Assembling global delivery metrics...</p>
                </div>
              ) : wishMasters.length === 0 ? (
                <div className="text-center py-32 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div className="text-slate-300 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">No data found</h4>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2 font-medium">Try adjusting your date filters or check if everything is correct.</p>
                </div>
              ) : (
                <div className="overflow-hidden border border-slate-100 rounded-[1.5rem] shadow-sm bg-white">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Name</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hub</th>
                        <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Collection</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {wishMasters.map((wm) => (
                        <tr
                          key={wm.wishMasterId}
                          onClick={() => navigate(`/WishMasterPerformance/${wm.wishMasterId}`)}
                          className="hover:bg-indigo-50/20 transition-all cursor-pointer group"
                        >
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {wm.wishMasterName?.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-base font-black text-slate-800 tracking-tight">{wm.wishMasterName}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{wm.employeeId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-wider group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                              {wm.hubName}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-6">
                              <div className="flex flex-col">
                                <span className="text-base font-black text-emerald-600">{wm.totalParcelsDelivered ?? 0}</span>
                                <span className="text-xs font-black text-slate-300 uppercase">Delivered</span>
                              </div>
                              <div className="w-px h-6 bg-slate-100"></div>
                              <div className="flex flex-col">
                                <span className="text-base font-black text-rose-500">{wm.totalParcelsFailed ?? 0}</span>
                                <span className="text-xs font-black text-slate-300 uppercase">Failed</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-right">
                            <span className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">₹{(wm.totalAmount ?? 0).toLocaleString()}</span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-right">
                            <span className="text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg" title={`P:${wm.proposedRate} A:${wm.approvedRate} PER:${wm.perParcelRate}`}>
                              {wm.perParcelRate != null ? `₹${wm.perParcelRate}` :
                                wm.approvedRate != null ? `₹${wm.approvedRate}` :
                                  wm.proposedRate != null ? `₹${wm.proposedRate}` :
                                    wm.per_parcel_rate != null ? `₹${wm.per_parcel_rate}` :
                                      (wm.totalAmount > 0 && wm.totalParcelsDelivered > 0) ? `₹${(wm.totalAmount / wm.totalParcelsDelivered).toFixed(2)}` :
                                        "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {/* Grand Total Row (Moved to bottom) */}
                      {wishMasters.length > 0 && (
                        <tr className="bg-indigo-50/30 font-bold border-t-2 border-indigo-100">
                          <td className="px-8 py-6" colSpan="2">
                            <span className="text-sm font-black text-indigo-900">GRAND TOTAL (ALL)</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex items-center justify-center gap-6">
                              <div className="flex flex-col">
                                <span className="text-base font-black text-emerald-600">
                                  {wishMasters.reduce((acc, wm) => acc + (wm.totalParcelsDelivered ?? 0), 0)}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase">Delivered</span>
                              </div>
                              <div className="w-px h-6 bg-slate-200"></div>
                              <div className="flex flex-col">
                                <span className="text-base font-black text-rose-500">
                                  {wishMasters.reduce((acc, wm) => acc + (wm.totalParcelsFailed ?? 0), 0)}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase">Failed</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <span className="text-lg font-black text-indigo-700">
                              ₹{wishMasters.reduce((acc, wm) => acc + (wm.totalAmount ?? 0), 0).toLocaleString()}
                            </span>
                          </td>
                          <td></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
