import { useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../services/axiosInstance";

const WishMasterDailyEntry = () => {
  const { user } = useSelector((state) => state.auth);
  const today = new Date().toISOString().split("T")[0]; // yyyy-MM-dd

  const [formData, setFormData] = useState({
    deliveryDate: today,
    parcelsTaken: "",
    parcelsDelivered: "",
    parcelsFailed: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.parcelsTaken || !formData.parcelsDelivered || !formData.parcelsFailed) {
      alert("Please fill all fields");
      return;
    }

    const taken = Number(formData.parcelsTaken);
    const delivered = Number(formData.parcelsDelivered);
    const failed = Number(formData.parcelsFailed);

    if (delivered + failed > taken) {
      alert("Delivered + Failed cannot exceed Parcels Taken.");
      return;
    }

    const payload = {
      employeeId: user?.sub || user?.username || "",
      deliveryDate: today,
      parcelsTaken: taken,
      parcelsDelivered: delivered,
      parcelsFailed: failed,
    };

    try {
      await axiosInstance.post("/performance/entry", payload, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Entry submitted successfully ✅");
      setFormData({
        deliveryDate: today,
        parcelsTaken: "",
        parcelsDelivered: "",
        parcelsFailed: "",
      });
    } catch (error) {
      console.error("Daily entry error:", error.response?.data || error.message);
      const data = error.response?.data;
      if (data && typeof data === "object" && !data.message) {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
        alert("Validation errors:\n" + msgs);
      } else {
        alert(data?.error || data?.message || "Submission failed ❌");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-3xl p-6 md:p-10">

        <h2 className="text-2xl md:text-3xl font-bold text-center text-indigo-700 mb-8">
          Daily Entry
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Date Field - Locked to Today */}
          <div className="md:col-span-2 flex flex-col">
            <label className="mb-2 font-medium text-gray-600">
              📅 Date
            </label>
            <input
              type="date"
              name="deliveryDate"
              value={today}
              readOnly
              className="border rounded-xl p-3 bg-indigo-50 font-semibold text-indigo-700 cursor-not-allowed opacity-80"
            />
            <p className="text-xs text-gray-400 mt-1">Only today's date is allowed. Re-submitting will update today's entry.</p>
          </div>

          {[
            { label: "📦 Parcel Taken From Hub", name: "parcelsTaken" },
            { label: "✅ Parcel Delivered", name: "parcelsDelivered" },
            { label: "❌ Parcel Failed", name: "parcelsFailed" },
          ].map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="mb-2 font-medium text-gray-600">
                {field.label}
              </label>
              <input
                type="number"
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="border rounded-xl p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>
          ))}

        </div>

        <button
          onClick={handleSubmit}
          className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg transition"
        >
          Submit Entry
        </button>
      </div>
    </div>
  );
};

export default WishMasterDailyEntry;