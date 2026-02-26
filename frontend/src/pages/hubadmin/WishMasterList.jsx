import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";

const WishMasterList = () => {
  const [wishMasters, setWishMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishMasters();
  }, []);

  const fetchWishMasters = async () => {
    try {
      const res = await axiosInstance.get("/hubadmin/wishmasters");
      setWishMasters(res.data);
    } catch (error) {
      console.error("Error fetching wish masters");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWishMaster = () => {
    navigate("/RegisterWishMaster");
  };

  const handleViewPerformance = (wmId) => {
    navigate(`/hub/wishmasters/${wmId}/performance`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <p className="text-lg font-semibold animate-pulse">
          Loading Wish Masters...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl p-5 sm:p-8">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 text-center sm:text-left">
            Wish Master List
          </h2>

          <button
            onClick={handleAddWishMaster}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300"
          >
            + Add Wish Master
          </button>
        </div>

        {/* Empty State */}
        {wishMasters.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg">
            No Wish Masters Found 🚀
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              gap-6
            "
          >
            {wishMasters.map((wm) => (
              <div
                key={wm.id}
                onClick={() => handleViewPerformance(wm.id)}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between cursor-pointer hover:border-indigo-300"
              >
                {/* Top Section */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={
                        wm.profilePhotoUrl ||
                        "https://via.placeholder.com/150"
                      }
                      alt="Profile"
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-indigo-400"
                    />

                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                        {wm.name}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm truncate">
                        {wm.phone}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium text-gray-800">
                        Employee ID:
                      </span>{" "}
                      {wm.employeeId}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">
                        Vehicle:
                      </span>{" "}
                      {wm.vehicleNumber}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">
                        {wm.approvalStatus === "APPROVED" ? "Approved Rate:" : "Proposed Rate:"}
                      </span>{" "}
                      ₹{wm.approvalStatus === "APPROVED" ? wm.approvedRate || wm.proposedRate : wm.proposedRate}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${wm.approvalStatus === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : wm.approvalStatus === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {wm.approvalStatus}
                  </span>
                  <span className="text-xs text-indigo-500 font-medium">
                    View Performance →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishMasterList;