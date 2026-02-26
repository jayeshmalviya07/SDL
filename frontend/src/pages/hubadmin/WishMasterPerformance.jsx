import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";

const HubWishMasterPerformance = () => {
    const { wmId } = useParams();
    const navigate = useNavigate();

    const [wishMaster, setWishMaster] = useState(null);
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [wmRes, perfRes] = await Promise.all([
                    axiosInstance.get(`/hubadmin/wishmasters/${wmId}`),
                    axiosInstance.get(`/performance/wish-master/${wmId}`),
                ]);
                setWishMaster(wmRes.data);
                const data = perfRes.data?.data || perfRes.data || [];
                setPerformance(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching performance:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [wmId]);

    const thClass = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
    const tdClass = "px-6 py-4 whitespace-nowrap text-sm";

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-4 sm:px-6 lg:px-10 py-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4">
                    <button
                        onClick={() => navigate("/WishMasterList")}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Wish Masters
                    </button>
                    <div className="border-l border-gray-200 pl-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Daily Performance — <span className="text-indigo-600">
                                {wishMaster?.name || `Wish Master #${wmId}`}
                            </span>
                        </h1>
                        {wishMaster?.employeeId && (
                            <p className="text-sm text-gray-500 mt-0.5">Emp ID: {wishMaster.employeeId}</p>
                        )}
                    </div>
                </div>

                {/* Performance Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Daily Entries</h2>
                            <p className="text-sm text-gray-400 mt-0.5">All recorded daily performance data</p>
                        </div>
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                            {performance.length} records
                        </span>
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
                            <p className="text-sm text-gray-400 mt-1">No daily entries have been submitted yet.</p>
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

export default HubWishMasterPerformance;
