import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { downloadWishMasterList, downloadWishMasterListPdf } from "../../services/reportService";

const HubReports = () => {
    const [wishMasters, setWishMasters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchWishMasters();
    }, []);

    const fetchWishMasters = async () => {
        try {
            let url = "/reports/hub-admin/wish-masters";
            const params = new URLSearchParams();
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const res = await axiosInstance.get(url);
            console.log("DEBUG: Reports data:", res.data);
            setWishMasters(res.data || []);
        } catch (error) {
            console.error("Error fetching reports", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!search.trim()) {
            fetchWishMasters();
            return;
        }
        try {
            setLoading(true);
            const res = await axiosInstance.get(
                `/reports/hub-admin/wish-masters/search?employeeId=${search.trim()}`
            );
            setWishMasters(res.data || []);
        } catch (error) {
            console.error("Error searching", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg font-semibold animate-pulse text-indigo-600">
                    Loading Reports...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-4 sm:px-6 lg:px-10 py-6">
            <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl p-5 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700">
                        Wish Master Reports
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => downloadWishMasterList(wishMasters)}
                            disabled={wishMasters.length === 0}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl shadow-md transition-all font-semibold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Excel
                        </button>
                        <button
                            onClick={() => downloadWishMasterListPdf(wishMasters, startDate, endDate)}
                            disabled={wishMasters.length === 0}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl shadow-md transition-all font-semibold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Save as PDF
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Search ID</label>
                            <input
                                type="text"
                                placeholder="Search by Employee ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 gap-3">
                        {(search || startDate || endDate) && (
                            <button
                                onClick={() => {
                                    setSearch("");
                                    setStartDate("");
                                    setEndDate("");
                                    setLoading(true);
                                    setTimeout(() => fetchWishMasters(), 100);
                                }}
                                className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        )}
                        <button
                            onClick={handleSearch}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl shadow-lg transition-all font-semibold active:scale-95 text-sm"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* Results */}
                {wishMasters.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        No wish masters found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Taken</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Delivered</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Failed</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Per Parcel Rate</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {wishMasters.map((wm) => {
                                    const totalTaken = wm.totalParcelsReceived ?? ((wm.totalParcelsDelivered ?? 0) + (wm.totalParcelsFailed ?? 0));
                                    return (
                                        <tr
                                            key={wm.wishMasterId}
                                            onClick={() => navigate(`/hub/wishmasters/${wm.wishMasterId}/performance`)}
                                            className="hover:bg-indigo-50 transition cursor-pointer group"
                                        >
                                            <td className="px-4 py-4 text-sm font-medium text-gray-800">{wm.wishMasterName}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600">{wm.employeeId}</td>
                                            <td className="px-4 py-4 text-sm text-blue-600 font-semibold">{totalTaken}</td>
                                            <td className="px-4 py-4 text-sm text-green-600 font-semibold">{wm.totalParcelsDelivered ?? 0}</td>
                                            <td className="px-4 py-4 text-sm text-red-500 font-semibold">{wm.totalParcelsFailed ?? 0}</td>
                                            <td className="px-4 py-4 text-sm text-indigo-600 font-semibold">₹{wm.totalAmount ?? 0}</td>
                                            <td className="px-4 py-4 text-sm font-bold text-gray-700">
                                                {wm.perParcelRate !== undefined && wm.perParcelRate !== null ? `₹${wm.perParcelRate}` :
                                                    wm.approvedRate !== undefined && wm.approvedRate !== null ? `₹${wm.approvedRate}` :
                                                        wm.proposedRate !== undefined && wm.proposedRate !== null ? `₹${wm.proposedRate}` :
                                                            wm.per_parcel_rate !== undefined && wm.per_parcel_rate !== null ? `₹${wm.per_parcel_rate}` :
                                                                (wm.totalAmount > 0 && wm.totalParcelsDelivered > 0) ? `₹${(wm.totalAmount / wm.totalParcelsDelivered).toFixed(2)}` :
                                                                    <span className="text-gray-400 italic" title={`Proposed: ${wm.proposedRate}, Approved: ${wm.approvedRate}, perParcelRate: ${wm.perParcelRate}, Calc: ${wm.totalAmount}/${wm.totalParcelsDelivered}`}>Rate Not Set</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {/* Grand Total Row */}
                                <tr className="bg-indigo-50/50 font-bold border-t-2 border-indigo-100">
                                    <td colSpan="2" className="px-4 py-4 text-sm text-indigo-700 uppercase">Grand Total (All)</td>
                                    <td className="px-4 py-4 text-sm text-blue-700">
                                        {wishMasters.reduce((acc, wm) => acc + (wm.totalParcelsReceived ?? ((wm.totalParcelsDelivered ?? 0) + (wm.totalParcelsFailed ?? 0))), 0)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-green-700">
                                        {wishMasters.reduce((acc, wm) => acc + (wm.totalParcelsDelivered ?? 0), 0)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-red-700">
                                        {wishMasters.reduce((acc, wm) => acc + (wm.totalParcelsFailed ?? 0), 0)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-indigo-700">
                                        ₹{wishMasters.reduce((acc, wm) => acc + (wm.totalAmount ?? 0), 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HubReports;
