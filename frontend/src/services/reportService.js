import axiosInstance from "./axiosInstance";

const API_BASE = "/api";

/**
 * Super Admin: Download general report (CSV)
 */
export const downloadReport = async (start, end) => {
  const response = await axiosInstance.get(
    `/reports?start=${start}&end=${end}`,
    { responseType: "blob" }
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = `report_${start}_${end}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Wish Master: Download daily-entry report by type (pdf/excel)
 */
export const downloadDailyEntryReport = async (type, startDate, endDate) => {
  const token = localStorage.getItem("token");
  const url = `${API_BASE}/reports/daily-entry/${type}?startDate=${startDate}&endDate=${endDate}`;
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Report download failed");
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `daily-entry-${type}_${startDate}_${endDate}.${type === "pdf" ? "pdf" : "xlsx"}`;
  link.click();
  window.URL.revokeObjectURL(downloadUrl);
};

/**
 * Wish Master: Get detailed report data (JSON) for on-screen display
 */
export const getWishMasterDetailedReport = async (startDate, endDate) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/reports/wish-master/detailed?startDate=${startDate}&endDate=${endDate}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Failed to fetch detailed report");
  return response.json();
};
