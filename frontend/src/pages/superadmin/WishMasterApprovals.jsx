import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../services/axiosInstance";

const WishMasterApprovals = () => {
  const [wishMasters, setWishMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((s) => s.auth);
  const approvedBy = user?.name || user?.username || user?.sub || "Super Admin";

  useEffect(() => {
    fetchPendingWishMasters();
  }, []);

  const fetchPendingWishMasters = async () => {
    try {
      const res = await axiosInstance.get("/delivery/pending");
      setWishMasters(res.data);
    } catch (err) {
      console.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axiosInstance.put(`/delivery/${id}/approve-registration?approved=true`);

      setWishMasters((prev) =>
        prev.filter((wm) => wm.id !== id)
      );
      alert("✅ Wish Master approved successfully!");
    } catch (err) {
      alert("Error approving user");
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosInstance.put(`/delivery/${id}/approve-registration?approved=false`);

      setWishMasters((prev) =>
        prev.filter((wm) => wm.id !== id)
      );
      alert("❌ Wish Master rejected successfully.");
    } catch (err) {
      alert("Error rejecting user");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-indigo-700 mb-8">
          Wish Master Approval Panel
        </h2>

        {wishMasters.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-lg">
            No Pending Wish Masters 🚀
          </div>
        ) : (
          <div className="grid gap-6">
            {wishMasters.map((wm) => (
              <div
                key={wm.id}
                className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                {/* Left Section */}
                <div className="flex items-center gap-5">
                  <img
                    src={wm.profilePhotoUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-indigo-400"
                  />

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {wm.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {wm.phone}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {wm.city}, {wm.state}
                    </p>

                    <span className="inline-block mt-2 px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                      Pending Approval
                    </span>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex gap-3 mt-4 md:mt-0">
                  <button
                    onClick={() => handleApprove(wm.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow-md transition"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(wm.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl shadow-md transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishMasterApprovals;
