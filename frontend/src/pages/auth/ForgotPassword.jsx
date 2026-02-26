import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword, resetPassword } from "../../services/authService";

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [emailOrEmpId, setEmailOrEmpId] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!emailOrEmpId.trim()) {
            setError("Email or Employee ID is required");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const res = await forgotPassword(emailOrEmpId.trim());
            setSuccess(res.message || "OTP generated successfully. Check server console.");
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || err.message || "Failed to request OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp.trim() || !newPassword) {
            setError("OTP and new password are required");
            return;
        }
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const res = await resetPassword(emailOrEmpId.trim(), otp.trim(), newPassword);
            setSuccess(res.message || "Password reset successfully!");
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || err.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent mb-2">
                        Reset Password
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {step === 1 ? "Enter your email or employee ID to receive an OTP." : "Enter the OTP and your new password."}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm mb-6 border border-emerald-100 font-medium">
                        {success}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email or Employee ID</label>
                            <input
                                type="text"
                                value={emailOrEmpId}
                                onChange={(e) => setEmailOrEmpId(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none"
                                placeholder="Enter email or employee ID"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-orange-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Requesting OTP..." : "Get OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">OTP Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none"
                                placeholder="Enter 6-digit OTP"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none"
                                placeholder="Enter new password"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-amber-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setStep(1);
                                setSuccess("");
                                setError("");
                                setOtp("");
                                setNewPassword("");
                            }}
                            className="w-full py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98]"
                            disabled={loading}
                        >
                            Back
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
                        &larr; Back to Login
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default ForgotPassword;
