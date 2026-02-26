import { useState } from "react";
import { downloadDailyEntryReport, getWishMasterDetailedReport } from "../../services/reportService";
import { formatCurrency, formatDate } from "../../utils/formatHelper";

const UniversalReports = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);

  const fetchOnScreenReport = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }
    setError("");
    setLoading("view");
    try {
      const data = await getWishMasterDetailedReport(startDate, endDate);
      setReportData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch report data");
    } finally {
      setLoading(null);
    }
  };

  const generateReport = async (type) => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }
    setError("");
    setLoading(type);
    try {
      await downloadDailyEntryReport(type, startDate, endDate);
    } catch (err) {
      setError(err.message || "Download failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen">

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl max-w-3xl mx-auto">

        <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
          Generate Reports
        </h2>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-xl mb-4">
            {error}
          </p>
        )}
        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block mb-2 font-medium">Start Date</label>
            <input
              type="date"
              className="w-full border p-3 rounded-xl"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">End Date</label>
            <input
              type="date"
              className="w-full border p-3 rounded-xl"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-8">

          <button
            onClick={() => generateReport("pdf")}
            disabled={loading !== null}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading === "pdf" ? "Downloading..." : "Download PDF"}
          </button>

          <button
            onClick={() => generateReport("excel")}
            disabled={loading !== null}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading === "excel" ? "Downloading..." : "Download Excel"}
          </button>

          <button
            onClick={fetchOnScreenReport}
            disabled={loading !== null}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading === "view" ? "Loading..." : "View Report"}
          </button>

        </div>

      </div>

      {/* Report Display Area */}
      {reportData && (
        <div className="max-w-6xl mx-auto mt-8 space-y-8">

          {/* Summary Cards */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
              Performance Summary ({formatDate(startDate)} to {formatDate(endDate)})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-blue-600 mb-1">Total Taken</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.grandTotal?.totalParcelsReceived || 0}</p>
              </div>
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-emerald-600 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.grandTotal?.totalParcelsDelivered || 0}</p>
              </div>
              <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100/50 hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-red-600 mb-1">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.grandTotal?.totalParcelsFailed || 0}</p>
              </div>
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-amber-600 mb-1">Returned</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.grandTotal?.totalParcelsReturned || 0}</p>
              </div>
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 hover:shadow-md transition-shadow col-span-2 md:col-span-1">
                <p className="text-sm font-medium text-indigo-600 mb-1">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.grandTotal?.totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Daily Table */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Daily Performance List
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-sm border-b">
                    <th className="p-4 font-semibold text-center w-16">#</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold text-center">Taken</th>
                    <th className="p-4 font-semibold text-center">Delivered</th>
                    <th className="p-4 font-semibold text-center">Failed</th>
                    <th className="p-4 font-semibold text-center">Returned</th>
                    <th className="p-4 font-semibold text-right max-w-[120px]">Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reportData.dailyPerformances?.length > 0 ? (
                    reportData.dailyPerformances.map((day, index) => (
                      <tr
                        key={day.date}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="p-4 text-center text-gray-400 text-sm">{index + 1}</td>
                        <td className="p-4 font-medium text-gray-900">{formatDate(day.date)}</td>
                        <td className="p-4 text-center text-blue-600">{day.parcelsReceived}</td>
                        <td className="p-4 text-center font-medium text-emerald-600">{day.parcelsDelivered}</td>
                        <td className="p-4 text-center text-red-600">{day.parcelsFailed}</td>
                        <td className="p-4 text-center text-amber-600">{day.parcelsReturned}</td>
                        <td className="p-4 text-right font-medium text-indigo-600">
                          {formatCurrency(day.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500">
                        No performance entries found for this date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default UniversalReports;