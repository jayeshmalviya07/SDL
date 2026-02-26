import axios from "axios";

const API_BASE = "/api";

/**
 * Login with email or employee ID and password.
 * Backend expects: { emailOrEmpId, password }
 */
export const login = async (emailOrEmpId, password) => {
  const res = await axios.post(
    `${API_BASE}/auth/login`,
    { emailOrEmpId, password },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
};

/**
 * Request OTP for password reset.
 * Backend expects: { emailOrEmpId }
 */
export const forgotPassword = async (emailOrEmpId) => {
  const res = await axios.post(
    `${API_BASE}/auth/forgot-password`,
    { emailOrEmpId },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
};

/**
 * Reset password using OTP.
 * Backend expects: { emailOrEmpId, otp, newPassword }
 */
export const resetPassword = async (emailOrEmpId, otp, newPassword) => {
  const res = await axios.post(
    `${API_BASE}/auth/reset-password`,
    { emailOrEmpId, otp, newPassword },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
};
