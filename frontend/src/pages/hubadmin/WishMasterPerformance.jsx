import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { downloadPdfReport, downloadExcelReport, getHubWishMasterDetailedReport } from "../../services/reportService";
import { formatCurrency, formatDate } from "../../utils/formatHelper";
import EmployeeDetailsSection from "../../components/common/EmployeeDetailsSection";

const HubWishMasterPerformance = () => {
    const { wmId } = useParams();
    const navigate = useNavigate();

    const [wishMaster, setWishMaster] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");
    const [deleteMonth, setDeleteMonth] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, [wmId]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const wmRes = await axiosInstance.get(`/hubadmin/wishmasters/${wmId}`);
            setWishMaster(wmRes.data);

            // Default range: last 30 days
            const end = new Date().toISOString().split("T")[0];
            const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
            setStartDate(start);
            setEndDate(end);

            await fetchReport(start, end);
        } catch (err) {
            console.error("Error fetching initial data:", err);
            setError("Failed to load wish master details");
        } finally {
            setLoading(false);
        }
    };

    const fetchReport = async (start = startDate, end = endDate) => {
        if (!start || !end) {
            setError("Please select both start and end dates");
            return;
        }
        if (start > end) {
            setError("Start date cannot be after end date");
            return;
        }
        setError("");
        setActionLoading("view");
        try {
            const data = await getHubWishMasterDetailedReport(wmId, start, end);
            setReportData(data);
        } catch (err) {
            setError(err.message || "Failed to fetch report data");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDownload = async (type) => {
        if (!startDate || !endDate) {
            setError("Please select both start and end dates");
            return;
        }
        if (startDate > endDate) {
            setError("Start date cannot be after end date");
            return;
        }
        setError("");
        setActionLoading(type);
        try {
            if (type === "pdf") {
                await downloadPdfReport(startDate, endDate, reportData, wishMaster);
            } else {
                await downloadExcelReport(startDate, endDate, reportData, wishMaster);
            }
        } catch (err) {
            setError(err.message || "Download failed");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteByMonth = async () => {
        if (!deleteMonth) {
            setError("Please select a month first");
            return;
        }
        const [year, month] = deleteMonth.split("-").map(Number);
        const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });

        if (!window.confirm(`⚠️ Are you sure you want to delete ALL entries for ${monthName}?\n\nThis action cannot be undone!`)) return;

        try {
            setDeleting(true);
            setError("");
            await axiosInstance.delete(`/performance/wish-master/${wmId}/month?year=${year}&month=${month}`);
            alert(`Deleted entries for ${monthName}`);
            setDeleteMonth("");
            fetchInitialData();
        } catch (err) {
            console.error("Delete error:", err);
            setError(err.response?.data || "Failed to delete entries");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-4 sm:px-6 lg:px-10 py-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/WishMasterList")}
                            className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                <span className="text-indigo-600">{wishMaster?.name}</span>'s Performance
                            </h1>
                            <p className="text-sm text-gray-500">Employee ID: {wishMaster?.employeeId}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <input
                                    type="date"
                                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all shadow-sm group-hover:border-indigo-200"
                                    value={startDate}
                                    max={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-gray-400 font-bold">to</span>
                            <div className="relative group">
                                <input
                                    type="date"
                                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all shadow-sm group-hover:border-indigo-200"
                                    value={endDate}
                                    max={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <button
                            onClick={() => fetchReport()}
                            disabled={actionLoading !== null}
                            className="bg-indigo-600 text-white px-8 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-semibold shadow-md active:scale-95 whitespace-nowrap"
                        >
                            {actionLoading === "view" ? "Loading..." : "View"}
                        </button>
                    </div>
                </div>

                {/* Employee Details Section */}
                {reportData?.employeeDetails && (
                    <EmployeeDetailsSection details={reportData.employeeDetails} />
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-sm">
                        {error}
                    </div>
                )}

                {/* Summary Cards */}
                {reportData && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-white p-5 rounded-3xl shadow-md border border-blue-50">
                            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Total Taken</p>
                            <p className="text-3xl font-bold text-gray-800">{reportData.grandTotal?.totalParcelsReceived || 0}</p>
                        </div>
                        <div className="bg-white p-5 rounded-3xl shadow-md border border-emerald-50">
                            <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">Delivered</p>
                            <p className="text-3xl font-bold text-gray-800">{reportData.grandTotal?.totalParcelsDelivered || 0}</p>
                        </div>
                        <div className="bg-white p-5 rounded-3xl shadow-md border border-red-50">
                            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">Failed</p>
                            <p className="text-3xl font-bold text-gray-800">{reportData.grandTotal?.totalParcelsFailed || 0}</p>
                        </div>
                        <div className="bg-white p-5 rounded-3xl shadow-md border border-amber-50">
                            <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">Returned</p>
                            <p className="text-3xl font-bold text-gray-800">{reportData.grandTotal?.totalParcelsReturned || 0}</p>
                        </div>
                        <div className="bg-white p-5 rounded-3xl shadow-md border border-indigo-50">
                            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2">Total Earnings</p>
                            <p className="text-3xl font-bold text-gray-800">{formatCurrency(reportData.grandTotal?.totalAmount)}</p>
                        </div>
                    </div>
                )}

                {/* Performance Table */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Daily Performance List</h2>
                            <p className="text-sm text-gray-400">Detailed breakdown of tasks </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <input
                                    type="month"
                                    value={deleteMonth}
                                    onChange={(e) => setDeleteMonth(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all shadow-sm group-hover:border-red-200"
                                />
                                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <button
                                onClick={handleDeleteByMonth}
                                disabled={deleting || !deleteMonth}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-200 text-white text-sm px-5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-md active:scale-95"
                            >
                                <span>🗑️</span>
                                {deleting ? "Deleting..." : "Delete Month"}
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDownload("pdf")}
                                disabled={actionLoading !== null}
                                className="bg-gray-800 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-black transition-all flex items-center gap-2 shadow-md active:scale-95"
                            >
                                {actionLoading === "pdf" ? "Preparing..." : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        PDF
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleDownload("excel")}
                                disabled={actionLoading !== null}
                                className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-md active:scale-95"
                            >
                                {actionLoading === "excel" ? "Preparing..." : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Excel
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-8 py-4 text-center w-16">#</th>
                                    <th className="px-8 py-4">Date</th>
                                    <th className="px-8 py-4 text-center text-blue-500">Taken</th>
                                    <th className="px-8 py-4 text-center text-emerald-500">Delivered</th>
                                    <th className="px-8 py-4 text-center text-red-500">Failed</th>
                                    <th className="px-8 py-4 text-center text-indigo-500">Screenshot</th>
                                    <th className="px-8 py-4 text-right text-gray-800">Earning</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reportData?.dailyPerformances?.length > 0 ? (
                                    reportData.dailyPerformances.map((p, index) => (
                                        <tr key={p.id || `${p.date}-${index}`} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-8 py-5 text-center text-gray-400 text-sm font-mono">{index + 1}</td>
                                            <td className="px-8 py-5 font-medium text-gray-800">{formatDate(p.date)}</td>
                                            <td className="px-8 py-5 text-center font-medium text-blue-600 bg-blue-50/30 group-hover:bg-transparent">{p.parcelsReceived}</td>
                                            <td className="px-8 py-5 text-center font-bold text-emerald-600 bg-emerald-50/30 group-hover:bg-transparent">{p.parcelsDelivered}</td>
                                            <td className="px-8 py-5 text-center font-medium text-red-500 bg-red-50/30 group-hover:bg-transparent">{p.parcelsFailed}</td>
                                            <td className="px-8 py-5 text-center">
                                                {p.screenshotUrl ? (
                                                    <a
                                                        href={p.screenshotUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 hover:text-indigo-800 font-bold underline decoration-indigo-200 underline-offset-4 decoration-2"
                                                    >
                                                        🖼️ View
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right font-bold text-indigo-600 bg-indigo-50/30 group-hover:bg-transparent">
                                                {formatCurrency(p.amount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-8 py-20 text-center text-gray-400 italic">
                                            No performance entries found for selected date range.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HubWishMasterPerformance;
