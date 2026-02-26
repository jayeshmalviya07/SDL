import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { toast } from "react-toastify";

const WishMasterPerformance = () => {
    const { wmId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Name/employeeId may be passed via router state for display
    const wmName = location.state?.name || `Wish Master #${wmId}`;
    const wmEmpId = location.state?.employeeId || "";
    const adminId = location.state?.adminId || null;

    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteMonth, setDeleteMonth] = useState("");
    const [deleting, setDeleting] = useState(false);

    const fetchPerformance = async () => {
        try {
            const res = await axiosInstance.get(`/performance/wish-master/${wmId}`);
            const data = res.data?.data || res.data || [];
            setPerformance(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching performance:", err);
            toast.error("Failed to load performance data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformance();
    }, [wmId]);

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
            setLoading(true);
            fetchPerformance();
        } catch (err) {
            console.error("Delete error:", err);
            toast.error("Failed to delete entries");
        } finally {
            setDeleting(false);
        }
    };

    const thClass = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
    const tdClass = "px-6 py-4 whitespace-nowrap text-sm";

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-4 sm:px-6 lg:px-10 py-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4">
                    <button
                        onClick={() => adminId ? navigate(`/HubAdminDetails/${adminId}`) : navigate(-1)}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <div className="border-l border-gray-200 pl-4">
                        <h1 className="text-2xl font-bold text-gray-800 font-outfit">
                            Daily Performance — <span className="text-indigo-600">{wmName}</span>
                        </h1>
                        {wmEmpId && (
                            <p className="text-sm text-gray-500 mt-0.5">Emp ID: {wmEmpId}</p>
                        )}
                    </div>
                </div>

                {/* Performance Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Daily Entries</h2>
                            <p className="text-sm text-gray-400 mt-0.5">All recorded daily performance data</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                                {performance.length} records
                            </span>
                            <input
                                type="month"
                                value={deleteMonth}
                                onChange={(e) => setDeleteMonth(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-red-400 outline-none"
                            />
                            <button
                                onClick={handleDeleteByMonth}
                                disabled={deleting || !deleteMonth}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-sm px-4 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
                            >
                                🗑️ {deleting ? "Deleting..." : "Delete Month"}
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : performance.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="font-medium text-gray-600">No performance records found.</p>
                            <p className="text-sm text-gray-400 mt-1">No daily entries have been submitted by this Wish Master yet.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className={thClass}>#</th>
                                    <th className={thClass}>Date</th>
                                    <th className={thClass}>Taken</th>
                                    <th className={thClass}>Delivered</th>
                                    <th className={thClass}>Failed</th>
                                    <th className={thClass}>Returned</th>
                                    <th className={thClass}>Amount (₹)</th>
                                    <th className={thClass}>Verification</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {performance.map((p, index) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className={`${tdClass} text-gray-400 font-mono`}>{index + 1}</td>
                                        <td className={`${tdClass} font-medium text-gray-800`}>{p.deliveryDate}</td>
                                        <td className={`${tdClass} text-gray-600`}>{p.parcelsTaken}</td>
                                        <td className={`${tdClass} text-green-600 font-semibold`}>{p.parcelsDelivered}</td>
                                        <td className={`${tdClass} text-red-500`}>{p.parcelsFailed}</td>
                                        <td className={`${tdClass} text-yellow-600`}>{p.parcelsReturned ?? "—"}</td>
                                        <td className={`${tdClass} text-indigo-600 font-semibold`}>
                                            ₹{p.finalAmount ?? p.calculatedAmount ?? "—"}
                                        </td>
                                        <td className={tdClass}>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${p.verificationStatus === "VERIFIED" ? "bg-green-100 text-green-800" :
                                                p.verificationStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                                    "bg-red-100 text-red-800"
                                                }`}>
                                                {p.verificationStatus?.toLowerCase() || "pending"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </div>
    );
};

export default WishMasterPerformance;
