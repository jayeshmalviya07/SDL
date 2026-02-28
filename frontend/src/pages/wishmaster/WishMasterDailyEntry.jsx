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
    screenshotUrl: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };

      // Auto-calculate failed: Failed = Taken - Delivered
      if (name === "parcelsTaken" || name === "parcelsDelivered") {
        const taken = Number(name === "parcelsTaken" ? value : prev.parcelsTaken) || 0;
        const delivered = Number(name === "parcelsDelivered" ? value : prev.parcelsDelivered) || 0;
        const failed = Math.max(0, taken - delivered);
        nextData.parcelsFailed = failed.toString();
      }

      return nextData;
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    const taken = Number(formData.parcelsTaken) || 0;
    const delivered = Number(formData.parcelsDelivered) || 0;
    const failed = Number(formData.parcelsFailed) || 0;

    if (taken === 0 && delivered === 0 && failed === 0) {
      alert("Please enter values for parcels.");
      return;
    }

    if (delivered + failed > taken) {
      alert("Delivered + Failed cannot exceed Parcels Taken.");
      return;
    }

    setUploading(true);
    let finalScreenshotUrl = formData.screenshotUrl;

    try {
      // 1. Upload file if selected
      if (selectedFile) {
        const fileData = new FormData();
        fileData.append("file", selectedFile);
        const uploadRes = await axiosInstance.post("/upload/screenshot", fileData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalScreenshotUrl = uploadRes.data.fileUrl;
      }

      // 2. Submit Entry
      const payload = {
        employeeId: user?.sub || user?.username || "",
        deliveryDate: today,
        parcelsTaken: taken,
        parcelsDelivered: delivered,
        parcelsFailed: failed,
        parcelsReturned: 0,
        screenshotUrl: finalScreenshotUrl,
      };

      await axiosInstance.post("/performance/entry", payload, {
        headers: { "Content-Type": "application/json" },
      });

      alert("Entry submitted successfully ✅");
      setFormData({
        deliveryDate: today,
        parcelsTaken: "",
        parcelsDelivered: "",
        parcelsFailed: "",
        screenshotUrl: "",
      });
      setSelectedFile(null);
      // Reset file input manually
      const fileInput = document.getElementById("screenshot-upload");
      if (fileInput) fileInput.value = "";

    } catch (error) {
      console.error("Daily entry error:", error.response?.data || error.message);
      const data = error.response?.data;
      if (data && typeof data === "object" && !data.message) {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
        alert("Validation errors:\n" + msgs);
      } else {
        alert(data?.error || data?.message || "Submission failed ❌");
      }
    } finally {
      setUploading(false);
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
            <p className="text-xs text-gray-400 mt-1">Only today's date is allowed. You can submit multiple entries for the same day.</p>
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

          {/* Screenshot Upload - Optional */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-600">
              📷 Screenshot
            </label>
            <input
              id="screenshot-upload"
              type="file"
              accept="image/*"
              title="Screenshot"
              onChange={handleFileChange}
              className="border rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-400 outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

        </div>

        <button
          onClick={handleSubmit}
          disabled={uploading}
          className={`mt-8 w-full ${uploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-3 rounded-xl font-semibold shadow-lg transition`}
        >
          {uploading ? "Uploading & Submitting..." : "Submit Entry"}
        </button>
      </div>
    </div>
  );
};

export default WishMasterDailyEntry;
