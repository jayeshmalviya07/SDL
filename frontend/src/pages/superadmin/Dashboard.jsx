import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";

export default function Dashboard() {
  const [hubCount, setHubCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHubCount();
    fetchPendingCount();
  }, []);

  const fetchHubCount = async () => {
    try {
      const res = await axiosInstance.get("/hubs");
      const hubs = res.data?.data || res.data || [];
      setHubCount(hubs.length);
    } catch (error) {
      console.error("Error fetching hub count", error);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await axiosInstance.get("/superadmin/pending-registrations");
      const pending = res.data || [];
      setPendingCount(pending.length);
    } catch (error) {
      console.error("Error fetching pending count", error);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Super Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Total Hubs Card - Clickable */}
        <div
          onClick={() => navigate("/HubList")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-indigo-600 flex flex-col items-center justify-center transform hover:-translate-y-1"
        >
          <p className="text-gray-500 font-medium mb-2 uppercase tracking-wide">Total Hubs</p>
          <h2 className="text-4xl font-extrabold text-indigo-700">{hubCount}</h2>
        </div>

        {/* Existing Cards */}
        {/* Pending Approvals Card - Clickable */}
        <div
          onClick={() => navigate("/ApproveWishMaster")}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-orange-500 flex flex-col items-center justify-center transform hover:-translate-y-1"
        >
          <p className="text-gray-500 font-medium mb-2 uppercase tracking-wide">Pending Approvals</p>
          <h2 className="text-4xl font-extrabold text-orange-600">{pendingCount}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-green-500 flex flex-col items-center justify-center">
          <p className="text-gray-500 font-medium mb-2 uppercase tracking-wide">Reports</p>
          <h2 className="text-4xl font-extrabold text-green-600">0</h2>
        </div>

      </div>
    </div>
  );
}
