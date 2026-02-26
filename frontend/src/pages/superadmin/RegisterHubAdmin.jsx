import { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";

const RegisterHubAdmin = () => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [hubs, setHubs] = useState([]);

  const initialState = {
    name: "",
    dob: "",
    address: "",
    phone: "",
    email: "",
    profilePhoto: null,
    aadhar: null,
    policeVerification: null,
    agreement: null,
    panCard: null,
    username: "",
    password: "",
    confirmPassword: "",
    hubId: "",
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    fetchHubs();
  }, []);

  const fetchHubs = async () => {
    try {
      // Fetch both hubs and hub admins concurrently
      const [hubsRes, adminsRes] = await Promise.all([
        axiosInstance.get("/hubs"),
        axiosInstance.get("/hub-admins")
      ]);

      const fetchedHubs = hubsRes.data?.data || hubsRes.data || [];
      const fetchedAdmins = adminsRes.data?.data || adminsRes.data || [];

      // Create a set of hub IDs that are already assigned to an admin
      const assignedHubIds = new Set(fetchedAdmins.map(admin => admin.hubId));

      // Filter out hubs that are already assigned
      const unassignedHubs = fetchedHubs.filter(hub => !assignedHubIds.has(hub.id));

      setHubs(unassignedHubs);
    } catch (error) {
      console.error("Failed to fetch hubs or admins", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setFormData({ ...formData, [name]: files[0] });

      if (name === "profilePhoto") {
        setPhotoPreview(URL.createObjectURL(files[0]));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setErrors({ ...errors, [name]: "" });
  };

  // ✅ Age Validation (18+)
  const isAdult = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    return age > 18 || (age === 18 && m >= 0);
  };

  const validateStep = () => {
    let newErrors = {};

    const requiredFields = {
      1: ["name", "dob", "address", "phone", "email", "profilePhoto"],
      2: ["aadhar", "policeVerification", "agreement", "panCard"],
      3: [
        "username",
        "password",
        "confirmPassword",
        "hubId",
      ],
    };

    requiredFields[step].forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    if (step === 1 && formData.dob && !isAdult(formData.dob)) {
      newErrors.dob = "Hub Admin must be 18+ years old";
    }

    if (step === 3 && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (step === 3 && formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!validateStep()) return;

    const data = new FormData();

    // Bundle text fields into one JSON part to reduce multipart count (fixes FileCountLimitExceededException)
    const textPayload = {
      name: formData.name,
      dob: formData.dob,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      username: formData.username,
      password: formData.password,
      hubId: formData.hubId,
    };

    data.append(
      "hubAdminData",
      new Blob([JSON.stringify(textPayload)], { type: "application/json" }),
      "hubAdminData.json"
    );

    // Append files only
    ["profilePhoto", "aadhar", "policeVerification", "agreement", "panCard"].forEach(
      (key) => {
        const file = formData[key];
        if (file instanceof File) data.append(key, file);
      }
    );

    try {
      await axiosInstance.post("/superadmin/create-hubadmin", data);

      alert("Hub Admin Registered Successfully 🎉");
      setFormData(initialState);
      setPhotoPreview(null);
      setStep(1);
    } catch (error) {
      const respData = error.response?.data;
      const status = error.response?.status;
      let msg = null;
      if (respData) {
        if (typeof respData === "string") msg = respData;
        else
          msg =
            respData.message ||
            respData.error ||
            (respData.data &&
              (typeof respData.data === "string"
                ? respData.data
                : typeof respData.data === "object"
                  ? Object.entries(respData.data)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join("\n")
                  : String(respData.data)));
      }
      if (!msg) msg = "Error registering hub admin";

      alert(msg);
    }
  };

  const inputStyle =
    "w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 rounded-xl transition-all outline-none";

  const errorText = "text-red-500 text-sm mt-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-5xl p-10">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
          Create Hub Admin
        </h2>

        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-10">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Profile Photo */}
            <div className="md:col-span-2 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full border-4 border-indigo-200 overflow-hidden mb-3 shadow-md">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No Photo
                  </div>
                )}
              </div>

              <input
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={handleChange}
                className="text-sm"
              />
              {errors.profilePhoto && (
                <p className={errorText}>{errors.profilePhoto}</p>
              )}
            </div>

            <div>
              <input
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className={inputStyle}
              />
              {errors.name && <p className={errorText}>{errors.name}</p>}
            </div>

            <div>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={inputStyle}
              />
              {errors.dob && <p className={errorText}>{errors.dob}</p>}
            </div>

            <div className="md:col-span-2">
              <input
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className={inputStyle}
              />
              {errors.address && <p className={errorText}>{errors.address}</p>}
            </div>

            <div>
              <input
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className={inputStyle}
              />
              {errors.phone && <p className={errorText}>{errors.phone}</p>}
            </div>

            <div>
              <input
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={inputStyle}
              />
              {errors.email && <p className={errorText}>{errors.email}</p>}
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={nextStep}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="grid md:grid-cols-2 gap-6">
            {["aadhar", "policeVerification", "agreement", "panCard"].map(
              (doc) => (
                <div key={doc}>
                  <label className="block mb-2 font-medium capitalize">
                    {doc.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input
                    type="file"
                    name={doc}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                  {errors[doc] && (
                    <p className={errorText}>{errors[doc]}</p>
                  )}
                </div>
              )
            )}

            <div className="md:col-span-2 flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-xl"
              >
                ← Back
              </button>

              <button
                onClick={nextStep}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Hub Admin Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Enter new hub admin username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="off"
                className={inputStyle}
              />
              {errors.username && (
                <p className={errorText}>{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Assign to Hub
              </label>
              <select
                name="hubId"
                value={formData.hubId}
                onChange={handleChange}
                className={inputStyle + " bg-white"}
              >
                <option value="" disabled>Select a Hub</option>
                {hubs.map((hub) => (
                  <option key={hub.id} value={hub.hubId}>
                    {hub.name} ({hub.city}) - {hub.hubId}
                  </option>
                ))}
              </select>
              {errors.hubId && (
                <p className={errorText}>{errors.hubId}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Hub Admin Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter new hub admin password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={inputStyle}
              />
              {errors.password && <p className={errorText}>{errors.password}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                className={inputStyle}
              />
              {errors.confirmPassword && (
                <p className={errorText}>{errors.confirmPassword}</p>
              )}
            </div>

            <div className="md:col-span-2 flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-xl"
              >
                ← Back
              </button>

              <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg transition duration-200"
              >
                Register 🎉
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterHubAdmin;
