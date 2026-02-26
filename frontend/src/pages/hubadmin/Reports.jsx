import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";

const HubReports = () => {
    const [wishMasters, setWishMasters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchWishMasters();
    }, []);

    const fetchWishMasters = async () => {
        try {
            const res = await axiosInstance.get("/reports/hub-admin/wish-masters");
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
                <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 mb-6">
                    Wish Master Reports
                </h2>

                {/* Search */}
                <div className="flex gap-3 mb-8">
                    <input
                        type="text"
                        placeholder="Search by Employee ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow transition-all"
                    >
                        Search
                    </button>
                    {search && (
                        <button
                            onClick={() => {
                                setSearch("");
                                fetchWishMasters();
                            }}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-xl transition-all"
                        >
                            Clear
                        </button>
                    )}
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
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Delivered</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Failed</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {wishMasters.map((wm) => (
                                    <tr key={wm.wishMasterId} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-4 text-sm font-medium text-gray-800">{wm.wishMasterName}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600">{wm.employeeId}</td>
                                        <td className="px-4 py-4 text-sm text-green-600 font-semibold">{wm.totalParcelsDelivered ?? 0}</td>
                                        <td className="px-4 py-4 text-sm text-red-500 font-semibold">{wm.totalParcelsFailed ?? 0}</td>
                                        <td className="px-4 py-4 text-sm text-indigo-600 font-semibold">₹{wm.totalAmount ?? 0}</td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => navigate(`/hub/wishmasters/${wm.wishMasterId}/performance`)}
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                            >
                                                View Details →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HubReports;
