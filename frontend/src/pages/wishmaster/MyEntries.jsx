import { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";

const MyEntry = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteMonth, setDeleteMonth] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axiosInstance.get("/performance/my-entries");
      setEntries(res.data);
    } catch (err) {
      console.error("Error fetching entries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteByMonth = async () => {
    if (!deleteMonth) {
      alert("Please select a month first");
      return;
    }
    const [year, month] = deleteMonth.split("-").map(Number);
    const mName = new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });

    if (!window.confirm(`⚠️ Are you sure you want to delete ALL your entries for ${mName}?\n\nThis action cannot be undone!`)) return;

    try {
      setDeleting(true);
      await axiosInstance.delete(`/performance/my-entries/month?year=${year}&month=${month}`);
      alert(`✅ Deleted entries for ${mName}`);
      setDeleteMonth("");
      setLoading(true);
      fetchEntries();
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to delete entries");
    } finally {
      setDeleting(false);
    }
  };

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // "2026-02"
  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

  const monthEntries = entries.filter((e) => e.deliveryDate?.startsWith(currentMonth));
  const monthEarning = monthEntries.reduce((sum, e) => sum + (e.finalAmount ?? e.calculatedAmount ?? 0), 0);
  const monthDelivered = monthEntries.reduce((sum, e) => sum + (e.parcelsDelivered ?? 0), 0);
  const monthFailed = monthEntries.reduce((sum, e) => sum + (e.parcelsFailed ?? 0), 0);

  const statusColor = (status) => {
    if (status === "VERIFIED" || status === "APPROVED") return "bg-green-100 text-green-700";
    if (status === "REJECTED") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const statusLabel = (status) => {
    if (status === "VERIFIED" || status === "APPROVED") return "✅ Approved";
    if (status === "REJECTED") return "❌ Rejected";
    if (status === "PENDING") return "⏳ Pending";
    return status || "—";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">

      <h2 className="text-2xl font-bold text-indigo-700 mb-6">
        My Daily Entries
      </h2>

      {/* Monthly Summary Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm font-medium opacity-90">💰 Monthly Earning</p>
          <h3 className="text-3xl font-extrabold mt-1">₹{monthEarning.toFixed(2)}</h3>
          <p className="text-xs mt-2 opacity-75">{monthName}</p>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm font-medium opacity-90">📦 Monthly Delivered</p>
          <h3 className="text-3xl font-extrabold mt-1">{monthDelivered}</h3>
          <p className="text-xs mt-2 opacity-75">{monthName}</p>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm font-medium opacity-90">❌ Monthly Failed</p>
          <h3 className="text-3xl font-extrabold mt-1">{monthFailed}</h3>
          <p className="text-xs mt-2 opacity-75">{monthName}</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm font-medium opacity-90">📊 Monthly Entries</p>
          <h3 className="text-3xl font-extrabold mt-1">{monthEntries.length}</h3>
          <p className="text-xs mt-2 opacity-75">{monthName}</p>
        </div>
      </div>

      {/* Delete by Month */}
      <div className="mb-6 bg-white rounded-2xl shadow p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">🗑️ Delete Entries by Month</h3>
          <p className="text-xs text-gray-400">Select a month and delete all entries for that period</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={deleteMonth}
            onChange={(e) => setDeleteMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-red-400 outline-none"
          />
          <button
            onClick={handleDeleteByMonth}
            disabled={deleting || !deleteMonth}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-sm px-4 py-1.5 rounded-lg font-medium transition-colors"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Entries Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full text-sm">

          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-center">Taken</th>
              <th className="p-3 text-center">Delivered</th>
              <th className="p-3 text-center">Failed</th>
              <th className="p-3 text-center">Earning (₹)</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-400">
                  No entries found. Submit your first daily entry!
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-medium">{entry.deliveryDate}</td>
                  <td className="p-3 text-center">{entry.parcelsTaken}</td>
                  <td className="p-3 text-center">{entry.parcelsDelivered}</td>
                  <td className="p-3 text-center">{entry.parcelsFailed}</td>
                  <td className="p-3 text-center font-semibold text-green-700">
                    ₹{(entry.finalAmount ?? entry.calculatedAmount ?? 0).toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(entry.verificationStatus)}`}>
                      {statusLabel(entry.verificationStatus)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default MyEntry;