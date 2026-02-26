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

/**
 * Wish Master: Download PDF report (client-side via print dialog)
 * Fetches data from the working /wish-master/detailed endpoint and generates a styled HTML report
 */
export const downloadPdfReport = async (startDate, endDate, existingData = null) => {
  const data = existingData || await getWishMasterDetailedReport(startDate, endDate);

  const formatCurrency = (amount) => {
    if (amount == null) return "₹0.00";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(dateStr));
  };

  const dailyRows = (data.dailyPerformances || []).map((day, i) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280;">${i + 1}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${formatDate(day.date)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#2563eb;">${day.parcelsReceived}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#059669;">${day.parcelsDelivered}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#dc2626;">${day.parcelsFailed}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#d97706;">${day.parcelsReturned}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#4f46e5;font-weight:600;">${formatCurrency(day.amount)}</td>
    </tr>
  `).join("");

  const gt = data.grandTotal || {};
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Performance Report ${formatDate(startDate)} - ${formatDate(endDate)}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 24px; color: #1f2937; }
        h1 { color: #4338ca; font-size: 22px; margin-bottom: 4px; }
        .subtitle { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
        .summary { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
        .card { flex: 1; min-width: 120px; padding: 14px; border-radius: 10px; text-align: center; }
        .card .label { font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
        .card .value { font-size: 22px; font-weight: 700; }
        .card-blue { background: #eff6ff; color: #2563eb; }
        .card-green { background: #ecfdf5; color: #059669; }
        .card-red { background: #fef2f2; color: #dc2626; }
        .card-amber { background: #fffbeb; color: #d97706; }
        .card-indigo { background: #eef2ff; color: #4338ca; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        thead th { background: #f9fafb; padding: 10px 12px; text-align: left; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb; font-size: 11px; text-transform: uppercase; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <h1>Shree Digambara Logistics — Performance Report</h1>
      <div class="subtitle">${formatDate(startDate)} to ${formatDate(endDate)}</div>

      <div class="summary">
        <div class="card card-blue"><div class="label">Total Taken</div><div class="value">${gt.totalParcelsReceived || 0}</div></div>
        <div class="card card-green"><div class="label">Delivered</div><div class="value">${gt.totalParcelsDelivered || 0}</div></div>
        <div class="card card-red"><div class="label">Failed</div><div class="value">${gt.totalParcelsFailed || 0}</div></div>
        <div class="card card-amber"><div class="label">Returned</div><div class="value">${gt.totalParcelsReturned || 0}</div></div>
        <div class="card card-indigo"><div class="label">Total Earned</div><div class="value">${formatCurrency(gt.totalAmount)}</div></div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align:center;width:40px;">#</th>
            <th>Date</th>
            <th style="text-align:center;">Taken</th>
            <th style="text-align:center;">Delivered</th>
            <th style="text-align:center;">Failed</th>
            <th style="text-align:center;">Returned</th>
            <th style="text-align:right;">Earnings</th>
          </tr>
        </thead>
        <tbody>
          ${dailyRows || '<tr><td colspan="7" style="padding:20px;text-align:center;color:#9ca3af;">No entries found</td></tr>'}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (!printWindow) throw new Error("Pop-up blocked. Please allow pop-ups and try again.");
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 400);
};

/**
 * Wish Master: Download Excel/CSV report (client-side)
 * Fetches data from the working /wish-master/detailed endpoint and generates a CSV file
 */
export const downloadExcelReport = async (startDate, endDate, existingData = null) => {
  const data = existingData || await getWishMasterDetailedReport(startDate, endDate);

  const headers = ["#", "Date", "Parcels Taken", "Parcels Delivered", "Parcels Failed", "Parcels Returned", "Earnings (₹)"];

  const rows = (data.dailyPerformances || []).map((day, i) => [
    i + 1,
    day.date,
    day.parcelsReceived,
    day.parcelsDelivered,
    day.parcelsFailed,
    day.parcelsReturned,
    day.amount,
  ]);

  const gt = data.grandTotal || {};
  rows.push([]);  // empty row
  rows.push([
    "", "TOTAL",
    gt.totalParcelsReceived || 0,
    gt.totalParcelsDelivered || 0,
    gt.totalParcelsFailed || 0,
    gt.totalParcelsReturned || 0,
    gt.totalAmount || 0,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `performance_report_${startDate}_${endDate}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};
