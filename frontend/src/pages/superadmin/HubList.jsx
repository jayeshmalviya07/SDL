import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { toast } from "react-toastify";

const HubList = () => {
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");

  // Modal State
  const [selectedHub, setSelectedHub] = useState(null);
  const [hubAdmins, setHubAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchHubs();
  }, []);

  const fetchHubs = async () => {
    try {
      const res = await axiosInstance.get("/hubs");
      setHubs(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Error fetching hubs");
      toast.error("Failed to fetch hubs");
    } finally {
      setLoading(false);
    }
  };

  const handleAddHub = () => {
    navigate("/AddHub");
  };

  const handleDeleteHub = async (e, id, hubName) => {
    e.stopPropagation(); // Prevent opening modal when clicking delete
    if (!window.confirm(`Are you sure you want to delete the Hub: ${hubName}?`)) return;

    try {
      await axiosInstance.delete(`/hubs/${id}`);
      toast.success("Hub deleted successfully");
      setHubs(hubs.filter(hub => hub.id !== id));
      // If the deleted hub was open in modal, close it
      if (selectedHub?.id === id) {
        closeModal();
      }
    } catch (error) {
      console.error("Error deleting hub", error);
      toast.error("Failed to delete hub");
    }
  };

  const openHubDetails = async (hub) => {
    setSelectedHub(hub);
    setIsModalOpen(true);
    setLoadingAdmins(true);

    try {
      const res = await axiosInstance.get(`/hub-admins/hub/${hub.id}`);
      setHubAdmins(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Error fetching hub admins:", error);
      toast.error("Failed to load Hub Admin details");
      setHubAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedHub(null);
    setHubAdmins([]);
  };

  const filteredHubs = hubs.filter((hub) =>
    hub.city.toLowerCase().includes(searchCity.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <p className="text-lg font-semibold animate-pulse">
          Loading Hubs...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-4 sm:px-6 lg:px-10 py-8 relative">
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl p-5 sm:p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 text-center sm:text-left">
            Hub List
          </h2>

          <button
            onClick={handleAddHub}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300"
          >
            + Add Hub
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by City..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="w-full sm:w-1/2 lg:w-1/3 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-3 px-4 rounded-xl transition-all outline-none"
          />
        </div>

        {/* Empty State */}
        {filteredHubs.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg">
            {hubs.length === 0 ? "No Hubs Found 🚀" : "No Hubs matching that city found 🏙️"}
          </div>
        ) : (
          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            gap-6
          ">
            {filteredHubs.map((hub) => (
              <div
                key={hub.id}
                onClick={() => openHubDetails(hub)}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
              >
                {/* Hub Details Section */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-800 break-words">
                      {hub.name}
                    </h3>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded">
                      {hub.hubId}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-2 mb-6">
                    <p className="flex items-center gap-2">
                      📍 <span className="font-medium">City:</span> {hub.city}
                    </p>
                    <p className="flex items-center gap-2">
                      🗺️ <span className="font-medium">Area:</span> {hub.area}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto border-t pt-4 border-gray-200 flex justify-end">
                  <button
                    onClick={(e) => handleDeleteHub(e, hub.id, hub.name)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition duration-150 inline-flex items-center gap-1 bg-white px-2 py-1 rounded"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hub Admin Modal overlay */}
      {isModalOpen && selectedHub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-bold">{selectedHub.name}</h3>
                <p className="text-indigo-200 text-sm mt-1">Hub ID: {selectedHub.hubId}</p>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 text-3xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <h4 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Assigned Hub Admins</h4>

              {loadingAdmins ? (
                <div className="py-8 text-center text-gray-500 animate-pulse">
                  Fetching Admin records...
                </div>
              ) : hubAdmins.length === 0 ? (
                <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 font-medium">No Hub Admin is currently assigned to this Hub</p>
                  <p className="text-sm text-gray-400 mt-1">Please register one from the dashboard.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hubAdmins.map(admin => (
                    <div key={admin.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex justify-center items-center font-bold text-xl">
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{admin.name}</p>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right shrink-0">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HubList;
