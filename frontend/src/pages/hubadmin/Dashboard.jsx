import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";

export const HubDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [wishMasterCount, setWishMasterCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, wmRes] = await Promise.all([
                axiosInstance.get("/hubadmin/profile"),
                axiosInstance.get("/hubadmin/wishmasters"),
            ]);
            setProfile(profileRes.data);
            const wms = wmRes.data?.data || wmRes.data || [];
            setWishMasterCount(Array.isArray(wms) ? wms.length : 0);
        } catch (error) {
            console.error("Error fetching hub admin data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg font-semibold animate-pulse text-indigo-600">
                    Loading Dashboard...
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
                Hub Admin Dashboard
            </h1>
            {profile && (
                <p className="text-gray-500 mb-8 text-lg">
                    Hub: <span className="font-semibold text-indigo-600">{profile.hubName}</span>
                    {profile.city && (
                        <span className="ml-2 text-gray-400">({profile.city})</span>
                    )}
                </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Wish Masters Card  */}
                <div
                    onClick={() => navigate("/WishMasterList")}
                    className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-indigo-600 flex flex-col items-center justify-center transform hover:-translate-y-1"
                >
                    <p className="text-gray-500 font-medium mb-2 uppercase tracking-wide">
                        Total Wish Masters
                    </p>
                    <h2 className="text-4xl font-extrabold text-indigo-700">
                        {wishMasterCount}
                    </h2>
                </div>

                {/* Register Wish Master Card */}
                <div
                    onClick={() => navigate("/RegisterWishMaster")}
                    className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-green-500 flex flex-col items-center justify-center transform hover:-translate-y-1"
                >
                    <p className="text-gray-500 font-medium mb-2 uppercase tracking-wide">
                        Register
                    </p>
                    <h2 className="text-2xl font-bold text-green-600">+ Wish Master</h2>
                </div>

                {/* Reports Card */}
                <div
                    onClick={() => navigate("/hub/reports")}
                    className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-orange-500 flex flex-col items-center justify-center transform hover:-translate-y-1"
                >
                    <p className="text-gray-500 font-medium mb-2 uppercase tracking-wide">
                        Reports
                    </p>
                    <h2 className="text-2xl font-bold text-orange-600">View Reports</h2>
                </div>
            </div>
        </div>
    );
};

export default HubDashboard;