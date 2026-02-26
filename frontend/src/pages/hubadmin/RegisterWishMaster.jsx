import { useState } from "react";
import axiosInstance from "../../services/axiosInstance";

const RegisterWishMaster = () => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    email: "",
    phone: "",
    permanentAddress: "",
    city: "",
    state: "",
    country: "",
    profilePhoto: null,

    dl: null,
    aadhar: null,
    panCard: null,
    policeVerification: null,
    agreement: null,
    bikeRegistration: null,

    username: "",
    password: "",
    confirmPassword: "",
    vehicleNumber: "",
    rate: "",
  });

  const [uploading, setUploading] = useState(false);

  // ✅ Age Validation (18+ Proper Check)
  const isAdult = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 18;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setFormData({ ...formData, [name]: files[0] });

      if (name === "profilePhoto") {
        setPreview(URL.createObjectURL(files[0]));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setErrors({ ...errors, [name]: "" });
  };

  const validateStep = () => {
    let newErrors = {};

    const requiredFields = {
      1: [
        "name",
        "dob",
        "phone",
        "permanentAddress",
        "city",
        "state",
        "country",
        "profilePhoto",
      ],
      2: [
        "dl",
        "aadhar",
        "panCard",
        "policeVerification",
        "agreement",
        "bikeRegistration",
      ],
      3: [
        "username",
        "password",
        "confirmPassword",
        "vehicleNumber",
        "rate",
      ],
    };

    requiredFields[step].forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    if (step === 1 && formData.dob && !isAdult(formData.dob)) {
      newErrors.dob = "Wish Master must be 18+";
    }

    if (step === 3 && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const uploadFile = async (file) => {
    if (!file) return null;
    const uploadData = new FormData();
    uploadData.append("file", file);
    const res = await axiosInstance.post("/upload/document", uploadData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.fileUrl; // "documents/uuid.ext"
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      setUploading(true);

      // 1. Upload all files
      const documentMap = {};
      const fileMappings = {
        profilePhoto: "PHOTO",
        dl: "DRIVING_LICENSE",
        aadhar: "AADHAAR",
        panCard: "PAN",
        policeVerification: "POLICE_VERIFICATION",
        agreement: "AGREEMENT",
        bikeRegistration: "BIKE_REGISTRATION",
      };

      for (const [key, backendEnum] of Object.entries(fileMappings)) {
        if (formData[key]) {
          const fileUrl = await uploadFile(formData[key]);
          if (fileUrl) documentMap[backendEnum] = fileUrl;
        }
      }

      // 2. Build JSON payload matching WishMasterRegistrationRequestDto
      const payload = {
        employeeId: formData.username,
        name: formData.name || "",
        phone: formData.phone || "",
        address: formData.permanentAddress || "",
        vehicleNumber: formData.vehicleNumber || "",
        proposedRate: parseFloat(formData.rate),
        password: formData.password,
        documents: documentMap
      };

      // 3. Create Wish Master
      await axiosInstance.post("/hubadmin/create-wishmaster", payload);

      alert("Approval request sent to Super Admin with all documents! 🚀");

      // Reset form
      setStep(1);
      setFormData({
        name: "", dob: "", email: "", phone: "", permanentAddress: "",
        city: "", state: "", country: "", profilePhoto: null,
        dl: null, aadhar: null, panCard: null, policeVerification: null,
        agreement: null, bikeRegistration: null,
        username: "", password: "", confirmPassword: "",
        vehicleNumber: "", rate: "",
      });
      setPreview(null);
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      const data = error.response?.data;
      if (data && typeof data === "object" && !data.message) {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
        alert("Validation errors:\n" + msgs);
      } else {
        alert(data?.error || data?.message || "Error submitting request");
      }
    } finally {
      setUploading(false);
    }
  };

  const inputStyle =
    "w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 rounded-lg transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed";

  const errorText = "text-red-500 text-sm mt-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-5xl p-8">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
          Create Wish Master
        </h2>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
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
              <label className="block mb-2 font-medium">
                Profile Photo
              </label>

              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 shadow-md">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <input
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={handleChange}
                className="mt-3"
              />
              {errors.profilePhoto && (
                <p className={errorText}>{errors.profilePhoto}</p>
              )}
            </div>

            <div>
              <input name="name" placeholder="Full Name" onChange={handleChange} className={inputStyle} />
              {errors.name && <p className={errorText}>{errors.name}</p>}
            </div>

            <div>
              <input type="date" name="dob" onChange={handleChange} className={inputStyle} />
              {errors.dob && <p className={errorText}>{errors.dob}</p>}
            </div>

            <div>
              <input name="phone" placeholder="Phone Number" onChange={handleChange} className={inputStyle} />
              {errors.phone && <p className={errorText}>{errors.phone}</p>}
            </div>

            <div>
              <input name="email" placeholder="Email (Optional)" onChange={handleChange} className={inputStyle} />
            </div>

            <div className="md:col-span-2">
              <input name="permanentAddress" placeholder="Permanent Address" onChange={handleChange} className={inputStyle} />
              {errors.permanentAddress && <p className={errorText}>{errors.permanentAddress}</p>}
            </div>

            <div>
              <input name="city" placeholder="City" onChange={handleChange} className={inputStyle} />
              {errors.city && <p className={errorText}>{errors.city}</p>}
            </div>

            <div>
              <input name="state" placeholder="State" onChange={handleChange} className={inputStyle} />
              {errors.state && <p className={errorText}>{errors.state}</p>}
            </div>

            <div>
              <input name="country" placeholder="Country" onChange={handleChange} className={inputStyle} />
              {errors.country && <p className={errorText}>{errors.country}</p>}
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg shadow-lg transition">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="grid md:grid-cols-2 gap-6">
            {["dl", "aadhar", "panCard", "policeVerification", "agreement", "bikeRegistration"].map(
              (doc) => (
                <div key={doc}>
                  <label className="block mb-2 font-medium capitalize">
                    {doc}
                  </label>
                  <input type="file" name={doc} onChange={handleChange} className={inputStyle} />
                  {errors[doc] && <p className={errorText}>{errors[doc]}</p>}
                </div>
              )
            )}

            <div className="md:col-span-2 flex justify-between mt-4">
              <button onClick={prevStep} className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-lg">
                ← Back
              </button>

              <button onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg shadow-lg">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="grid md:grid-cols-2 gap-6">
            {["username", "password", "confirmPassword", "vehicleNumber", "rate"].map(
              (field) => (
                <div key={field}>
                  <input
                    type={field.toLowerCase().includes("password") ? "password" : "text"}
                    name={field}
                    placeholder={field.replace(/([A-Z])/g, " $1")}
                    value={formData[field] ?? ""}
                    onChange={handleChange}
                    autoComplete={
                      field === "username"
                        ? "off"
                        : field.toLowerCase().includes("password")
                          ? "new-password"
                          : "off"
                    }
                    className={inputStyle}
                  />
                  {errors[field] && <p className={errorText}>{errors[field]}</p>}
                </div>
              )
            )}

            <div className="md:col-span-2 flex justify-between mt-4">
              <button onClick={prevStep} className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-lg">
                ← Back
              </button>

              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading Documents...
                  </>
                ) : (
                  "Request Approval 🚀"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterWishMaster;
