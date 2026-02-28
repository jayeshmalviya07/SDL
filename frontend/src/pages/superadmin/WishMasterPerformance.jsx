import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../services/axiosInstance";
import {
    getSuperAdminWishMasterDetailedReport,
    downloadPdfReport,
    downloadExcelReport
} from "../../services/reportService";
import EmployeeDetailsSection from "../../components/common/EmployeeDetailsSection";

const WishMasterPerformance = () => {
    const { wmId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Context from navigation or defaults
    const wmName = location.state?.name || `Wish Master #${wmId}`;
    const wmEmpId = location.state?.employeeId || "";
    const adminId = location.state?.adminId || null;

    const [reportData, setReportData] = useState({ dailyPerformances: [], grandTotal: {} });
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [deleteMonth, setDeleteMonth] = useState("");
    const [deleting, setDeleting] = useState(false);

    const fetchDetailedReport = async () => {
        setLoading(true);
        try {
            const data = await getSuperAdminWishMasterDetailedReport(wmId, startDate, endDate);
            setReportData(data);
        } catch (err) {
            console.error("Error fetching report:", err);
            toast.error("Failed to load performance report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetailedReport();
    }, [wmId]);

    const handleFilter = () => {
        fetchDetailedReport();
    };

    const handleDeleteByMonth = async () => {
        if (!deleteMonth) {
            toast.warn("Please select a month first");
            return;
        }
        const [year, month] = deleteMonth.split("-").map(Number);
        const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });

        if (!window.confirm(`⚠️ Are you sure you want to delete ALL entries for ${monthName}?\n\nThis action cannot be undone!`)) return;

        try {
            setDeleting(true);
            await axiosInstance.delete(`/performance/wish-master/${wmId}/month?year=${year}&month=${month}`);
            toast.success(`Deleted entries for ${monthName}`);
            setDeleteMonth("");
            fetchDetailedReport();
        } catch (err) {
            console.error("Delete error:", err);
            toast.error("Failed to delete entries");
        } finally {
            setDeleting(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0);
    };

    const performance = reportData.dailyPerformances || [];
    const gt = reportData.grandTotal || {};

    return (
        <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-10 py-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Top Nav & Export Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <button
                        onClick={() => adminId ? navigate(`/HubAdminDetails/${adminId}`) : navigate(-1)}
                        className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest bg-indigo-50 hover:bg-indigo-600 hover:text-white px-6 py-3 rounded-2xl transition-all shadow-sm active:scale-95 group"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                        Exit Report
                    </button>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => downloadExcelReport(startDate, endDate, reportData, { name: wmName, employeeId: wmEmpId })}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-6 py-3 rounded-2xl shadow-sm transition-all font-black text-xs uppercase tracking-widest active:scale-95 border border-emerald-100"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Excel Export
                        </button>
                        <button
                            onClick={() => downloadPdfReport(startDate, endDate, reportData, { name: wmName, employeeId: wmEmpId })}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white px-6 py-3 rounded-2xl shadow-sm transition-all font-black text-xs uppercase tracking-widest active:scale-95 border border-rose-100"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Save PDF
                        </button>
                    </div>
                </div>

                {/* Profile Header */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2 block">Wish Master Performance</span>
                            <h1 className="text-4xl font-black text-slate-900 leading-tight">
                                {wmName}
                            </h1>
                            <div className="flex items-center gap-4 mt-3">
                                <span className="flex items-center gap-1.5 text-slate-500 font-medium text-sm">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    {wmEmpId || "No Employee ID"}
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-500 font-medium text-sm">System Super Admin View</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl min-w-[140px]">
                                <p className="text-[10px] font-black uppercase text-blue-400 mb-1">Total Taken</p>
                                <p className="text-xl font-black text-blue-700">{gt.totalParcelsReceived || 0}</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl min-w-[140px]">
                                <p className="text-[10px] font-black uppercase text-emerald-400 mb-1">Delivered</p>
                                <p className="text-xl font-black text-emerald-700">{gt.totalParcelsDelivered || 0}</p>
                            </div>
                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl min-w-[140px]">
                                <p className="text-[10px] font-black uppercase text-rose-400 mb-1">Total Failed</p>
                                <p className="text-xl font-black text-rose-700">{gt.totalParcelsFailed || 0}</p>
                            </div>
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl min-w-[140px]">
                                <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">Total Earned</p>
                                <p className="text-xl font-black text-indigo-700">{formatCurrency(gt.totalAmount)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employee Details Section */}
                {reportData?.employeeDetails && (
                    <div className="mb-6">
                        <EmployeeDetailsSection details={reportData.employeeDetails} />
                    </div>
                )}

                {/* Filters Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex-1 min-w-[200px] flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col flex-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starts From</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-transparent border-none text-sm font-black focus:ring-0 cursor-pointer p-0 text-slate-700"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 min-w-[200px] flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col flex-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ends At</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-transparent border-none text-sm font-black focus:ring-0 cursor-pointer p-0 text-slate-700"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleFilter}
                                className="bg-slate-900 group flex items-center gap-2 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
                            >
                                Re-sync Data
                                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Delete Month Data</label>
                        <div className="flex gap-2">
                            <input
                                type="month"
                                value={deleteMonth}
                                onChange={(e) => setDeleteMonth(e.target.value)}
                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm font-medium"
                            />
                            <button
                                onClick={handleDeleteByMonth}
                                disabled={deleting || !deleteMonth}
                                className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                            >
                                {deleting ? "..." : "🗑️"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-80">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
                            <p className="text-slate-400 font-semibold">Generating report...</p>
                        </div>
                    ) : performance.length === 0 ? (
                        <div className="text-center py-24 px-6">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">No Records Found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Either no work was recorded for this period or the entries haven't been approved yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">#</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Taken</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Delivered</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Failed</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Screenshot</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Earnings</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-50">
                                    {performance.map((p, index) => (
                                        <tr key={p.id || `${p.date}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5 text-base font-black text-slate-300 tabular-nums">{index + 1}</td>
                                            <td className="px-6 py-5 text-base font-bold text-slate-700">{p.date}</td>
                                            <td className="px-6 py-5 text-base text-center font-medium text-slate-600">{p.parcelsReceived}</td>
                                            <td className="px-6 py-5 text-base text-center font-black text-emerald-600">{p.parcelsDelivered}</td>
                                            <td className="px-6 py-5 text-base text-center font-black text-rose-500">{p.parcelsFailed}</td>
                                            <td className="px-6 py-5 text-center">
                                                {p.screenshotUrl ? (
                                                    <a
                                                        href={p.screenshotUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-amber-600 hover:text-amber-800 font-bold underline decoration-amber-200 underline-offset-4 decoration-2"
                                                    >
                                                        🖼️ View
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-base text-right font-black text-indigo-700">{formatCurrency(p.amount)}</td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter bg-emerald-100 text-emerald-700">
                                                    Approved
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default WishMasterPerformance;
