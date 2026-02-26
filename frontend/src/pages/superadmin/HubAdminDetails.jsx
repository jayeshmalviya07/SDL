import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { toast } from "react-toastify";

const HubAdminDetails = () => {
    const { adminId } = useParams();
    const navigate = useNavigate();

    const [admin, setAdmin] = useState(null);
    const [wishMasters, setWishMasters] = useState([]);
    const [loadingWM, setLoadingWM] = useState(true);

    // Fetch hub admin info + wish masters
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [adminsRes, wmRes] = await Promise.all([
                    axiosInstance.get("/hub-admins"),
                    axiosInstance.get(`/delivery/hub-admin/${adminId}`)
                ]);
                const admins = adminsRes.data?.data || adminsRes.data || [];
                const found = Array.isArray(admins) ? admins.find(a => String(a.id) === String(adminId)) : null;
                setAdmin(found || null);

                const wms = wmRes.data?.data || wmRes.data || [];
                setWishMasters(Array.isArray(wms) ? wms : []);
            } catch (err) {
                console.error("Error fetching data:", err);
                toast.error("Failed to load data");
            } finally {
                setLoadingWM(false);
            }
        };
        fetchData();
    }, [adminId]);

    const handleWishMasterClick = (wm) => {
        navigate(`/WishMasterPerformance/${wm.id}`, {
            state: { name: wm.name, employeeId: wm.employeeId, adminId }
        });
    };

    const thClass = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
    const tdClass = "px-4 py-3 whitespace-nowrap text-sm";

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-4 sm:px-6 lg:px-10 py-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Back + Header */}
                <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4">
                    <button
                        onClick={() => navigate("/HubAdminList")}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <div className="border-l border-gray-200 pl-4">
                        <h1 className="text-2xl font-bold text-gray-800 font-outfit">
                            {admin ? admin.name : `Hub Admin #${adminId}`}
                        </h1>
                        {admin && (
                            <p className="text-sm text-gray-500 mt-0.5">
                                {admin.email} &bull; Username: <span className="font-medium text-gray-700">{admin.username || "N/A"}</span> &bull; Hub: <span className="font-medium text-indigo-600">{admin.hubName || "N/A"}</span> &bull; City: {admin.city || "N/A"}
                            </p>
                        )}
                    </div>
                </div>

                {/* Wish Masters Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Wish Masters</h2>
                            <p className="text-sm text-gray-400 mt-0.5">Click a row to view daily performance</p>
                        </div>
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                            {wishMasters.length} total
                        </span>
                    </div>

                    {loadingWM ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : wishMasters.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="font-medium">No Wish Masters are present.</p>
                            <p className="text-sm text-gray-400 mt-1">This Hub Admin hasn't registered any delivery partners yet.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className={thClass}>Emp ID</th>
                                    <th className={thClass}>Name</th>
                                    <th className={thClass}>Phone</th>
                                    <th className={thClass}>Vehicle No.</th>
                                    <th className={thClass}>Status</th>
                                    <th className={thClass}>Rate (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {wishMasters.map((wm) => (
                                    <tr
                                        key={wm.id}
                                        onClick={() => handleWishMasterClick(wm)}
                                        className="cursor-pointer transition-colors hover:bg-indigo-50"
                                    >
                                        <td className={`${tdClass} font-medium text-indigo-600`}>{wm.employeeId}</td>
                                        <td className={`${tdClass} font-medium text-gray-900`}>{wm.name}</td>
                                        <td className={`${tdClass} text-gray-500`}>{wm.phone}</td>
                                        <td className={`${tdClass} text-gray-500 font-mono`}>{wm.vehicleNumber || "N/A"}</td>
                                        <td className={tdClass}>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${wm.approvalStatus === "APPROVED" ? "bg-green-100 text-green-800" :
                                                wm.approvalStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                                    "bg-red-100 text-red-800"
                                                }`}>
                                                {wm.approvalStatus?.toLowerCase() || "pending"}
                                            </span>
                                        </td>
                                        <td className={`${tdClass} text-green-600 font-medium`}>
                                            {wm.approvedRate ?? wm.proposedRate ?? "—"}
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

export default HubAdminDetails;
