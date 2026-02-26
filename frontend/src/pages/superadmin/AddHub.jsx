import { useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import { toast } from "react-toastify";

const AddHub = () => {
  const [formData, setFormData] = useState({
    hubId: "",
    name: "",
    city: "",
    area: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.hubId.trim()) newErrors.hubId = "Hub ID is required";
    if (!formData.name.trim()) newErrors.name = "Hub Name is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.area.trim()) newErrors.area = "Area is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await axiosInstance.post("/hubs", formData);
      toast.success("Hub Created Successfully 🎉");
      setFormData({ hubId: "", name: "", city: "", area: "" });
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data || "Error creating hub";
      toast.error(typeof msg === "string" ? msg : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 rounded-xl transition-all outline-none";
  const errorText = "text-red-500 text-sm mt-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-2xl p-10">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
          Create New Hub
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Hub ID
              </label>
              <input
                type="text"
                name="hubId"
                placeholder="e.g., HUB-001"
                value={formData.hubId}
                onChange={handleChange}
                className={inputStyle}
              />
              {errors.hubId && <p className={errorText}>{errors.hubId}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Hub Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Central Logistics"
                value={formData.name}
                onChange={handleChange}
                className={inputStyle}
              />
              {errors.name && <p className={errorText}>{errors.name}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                placeholder="e.g., Mumbai"
                value={formData.city}
                onChange={handleChange}
                className={inputStyle}
              />
              {errors.city && <p className={errorText}>{errors.city}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Area
              </label>
              <input
                type="text"
                name="area"
                placeholder="e.g., Andheri East"
                value={formData.area}
                onChange={handleChange}
                className={inputStyle}
              />
              {errors.area && <p className={errorText}>{errors.area}</p>}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white px-8 py-3 rounded-xl shadow-lg transition duration-300 font-bold ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Creating Hub..." : "Create Hub 🎉"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHub;
