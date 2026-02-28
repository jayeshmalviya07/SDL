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
};/**
 * Super Admin: Get all hubs for selection dropdown
 */
export const getAllHubs = async () => {
  const response = await axiosInstance.get("/reports/super-admin/hubs");
  return response.data || [];
};

/**
 * Super Admin: Get wish masters for a specific hub with optional date filtering
 */
export const getSuperAdminWishMastersByHub = async (hubId, startDate, endDate) => {
  let url = `/reports/super-admin/hubs/${hubId}/wish-masters`;
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  if (params.toString()) url += `?${params.toString()}`;
  const response = await axiosInstance.get(url);
  return response.data || [];
};

/**
 * Super Admin: Search wish masters across all hubs with optional date filtering
 */
export const searchSuperAdminWishMasters = async (employeeId, startDate, endDate) => {
  let url = `/reports/super-admin/wish-masters/search?employeeId=${employeeId}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;

  const response = await axiosInstance.get(url);
  return response.data || [];
};
/**
 * Super Admin: Get detailed report data (JSON) for a specific wish master
 */
export const getSuperAdminWishMasterDetailedReport = async (wmId, startDate, endDate) => {
  let url = `/reports/super-admin/wish-masters/${wmId}/detailed`;
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  if (params.toString()) url += `?${params.toString()}`;
  const response = await axiosInstance.get(url);
  return response.data || {};
};

/**
 * Hub Admin: Get detailed report data (JSON) for a specific wish master
 */
export const getHubWishMasterDetailedReport = async (wmId, startDate, endDate) => {
  const token = localStorage.getItem("token");
  const url = `${API_BASE}/reports/hub-admin/wish-masters/${wmId}/detailed?startDate=${startDate}&endDate=${endDate}`;
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Failed to fetch Hub Admin detailed report");
  return response.json();
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
export const downloadPdfReport = async (startDate, endDate, existingData = null, userInfo = null) => {
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
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">
        ${day.screenshotUrl ? `<a href="${day.screenshotUrl.startsWith('/') ? window.location.origin + day.screenshotUrl : day.screenshotUrl}" target="_blank" style="color:#4f46e5;text-decoration:none;font-weight:600;">View 🖼️</a>` : '<span style="color:#e5e7eb;">—</span>'}
      </td>
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
        .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #4338ca; padding-bottom: 12px; }
        h1 { color: #4338ca; font-size: 22px; margin: 0; }
        .emp-info { text-align: right; }
        .emp-name { font-weight: 700; color: #111827; font-size: 16px; }
        .emp-id { color: #6b7280; font-size: 13px; }
        .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 24px; font-weight: 500; }
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
      <div class="header-top">
        <div>
          <h1>Shree Digambara Logistics</h1>
          <div style="color: #4338ca; font-weight: 600; font-size: 14px;">Performance Report</div>
        </div>
        ${userInfo ? `
        <div class="emp-info">
          <div class="emp-name">${userInfo.name}</div>
          <div class="emp-id">Employee ID: ${userInfo.employeeId}</div>
        </div>
        ` : ""}
      </div>
      
      <div class="subtitle" style="margin-bottom: 5px;">Hub: ${data.hubName || "N/A"}</div>
      <div class="subtitle">Reporting Period: ${formatDate(startDate)} to ${formatDate(endDate)}</div>

      <div class="summary">
        <div class="card card-blue"><div class="label">Total Taken</div><div class="value">${gt.totalParcelsReceived || 0}</div></div>
        <div class="card card-green"><div class="label">Delivered</div><div class="value">${gt.totalParcelsDelivered || 0}</div></div>
        <div class="card card-red"><div class="label">Failed</div><div class="value">${gt.totalParcelsFailed || 0}</div></div>
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
            <th style="text-align:center;">Screenshot</th>
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
export const downloadExcelReport = async (startDate, endDate, existingData = null, userInfo = null) => {
  const data = existingData || await getWishMasterDetailedReport(startDate, endDate);

  let csvContent = "sep=,\n";
  if (userInfo) {
    csvContent += `"Employee Name","${userInfo.name}"\n`;
    csvContent += `"Employee ID","${userInfo.employeeId}"\n`;
    csvContent += `"Hub Name","${data.hubName || "N/A"}"\n`;
    csvContent += `"Report Period","${startDate} to ${endDate}"\n\n`;
  }

  const headers = ["#", "Date", "Total Taken", "Parcels Delivered", "Parcels Failed", "Screenshot URL", "Earnings (₹)"];
  csvContent += headers.map(h => `"${h}"`).join(",") + "\n";

  const rows = (data.dailyPerformances || []).map((day, i) => [
    `"${i + 1}"`,
    `"${day.date}"`,
    `"${day.parcelsReceived}"`,
    `"${day.parcelsDelivered}"`,
    `"${day.parcelsFailed}"`,
    `"${day.screenshotUrl || ""}"`,
    `"${day.amount}"`,
  ]);

  const gt = data.grandTotal || {};
  rows.push([]);  // empty row
  rows.push([
    `""`,
    `"TOTAL"`,
    `"${gt.totalParcelsReceived || 0}"`,
    `"${gt.totalParcelsDelivered || 0}"`,
    `"${gt.totalParcelsFailed || 0}"`,
    `""`, // Screenshot URL column
    `"${gt.totalAmount || 0}"`,
  ]);

  csvContent += rows.map(row => row.join(",")).join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `performance_report_${startDate}_${endDate}.csv`;
  link.click();
  window.URL.revokeObjectURL(downloadUrl);
};

/**
 * Hub Admin: Download the currently viewed Wish Master list as CSV
 */
export const downloadWishMasterList = (data) => {
  const hubName = data[0]?.hubName || "N/A";
  let csvContent = "sep=,\n";
  csvContent += `"Hub Name","${hubName}"\n`;
  csvContent += `"Report Date","${new Date().toLocaleDateString()}"\n\n`;

  const headers = ["Name", "Employee ID", "Total Taken", "Total Delivered", "Total Failed", "Total Amount (₹)", "Per Parcel Rate (₹)"];
  csvContent += headers.map(h => `"${h}"`).join(",") + "\n";

  const rows = data.map(wm => {
    const totalTaken = wm.totalParcelsReceived ?? ((wm.totalParcelsDelivered || 0) + (wm.totalParcelsFailed || 0));
    return [
      `"${wm.wishMasterName || ''}"`,
      `"${wm.employeeId || ''}"`,
      `"${totalTaken}"`,
      `"${wm.totalParcelsDelivered || 0}"`,
      `"${wm.totalParcelsFailed || 0}"`,
      `"${wm.totalAmount || 0}"`,
      `"${wm.perParcelRate ?? wm.approvedRate ?? wm.proposedRate ?? wm.per_parcel_rate ?? (wm.totalAmount > 0 && wm.totalParcelsDelivered > 0 ? (wm.totalAmount / wm.totalParcelsDelivered).toFixed(2) : 0)}"`
    ];
  });

  const grandTotal = {
    taken: data.reduce((acc, wm) => acc + (wm.totalParcelsReceived ?? ((wm.totalParcelsDelivered || 0) + (wm.totalParcelsFailed || 0))), 0),
    delivered: data.reduce((acc, wm) => acc + (wm.totalParcelsDelivered || 0), 0),
    failed: data.reduce((acc, wm) => acc + (wm.totalParcelsFailed || 0), 0),
    amount: data.reduce((acc, wm) => acc + (wm.totalAmount || 0), 0)
  };

  rows.push([]); // Empty spacing row
  rows.push([
    `"GRAND TOTAL (ALL)"`,
    `""`,
    `"${grandTotal.taken}"`,
    `"${grandTotal.delivered}"`,
    `"${grandTotal.failed}"`,
    `"${grandTotal.amount}"`,
    `""`
  ]);

  csvContent += rows.map(row => row.join(",")).join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `wish_master_list_${hubName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Hub Admin: Download the currently viewed Wish Master list as PDF
 */
export const downloadWishMasterListPdf = (data, startDate, endDate) => {
  if (!data || data.length === 0) return;

  const dateRange = startDate && endDate ? `${startDate} to ${endDate}` : "All Time";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Wish Master performance Summary</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4F46E5; padding-bottom: 15px; }
        .header h1 { color: #4F46E5; margin: 0; font-size: 24px; }
        .header p { color: #666; margin: 5px 0 0; }
        .summary-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; background: #F3F4F6; padding: 10px; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #4F46E5; color: white; font-weight: 600; text-align: left; padding: 12px 8px; }
        td { padding: 10px 8px; border-bottom: 1px solid #E2E8F0; font-size: 13px; }
        tr:nth-child(even) { background-color: #F9FAFB; }
        .text-right { text-align: right; }
        .amount { color: #4F46E5; font-weight: 600; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Wish Master Performance Summary</h1>
        <div style="font-weight: 700; color: #4F46E5; font-size: 18px; margin-top: 10px;">Hub: ${data[0]?.hubName || 'N/A'}</div>
        <p>Period: ${dateRange}</p>
      </div>
      
      <div class="summary-info">
        <span>Generated on: ${new Date().toLocaleString()}</span>
        <span>Total Wish Masters: ${data.length}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Employee ID</th>
            <th class="text-right">Total Taken</th>
            <th class="text-right">Delivered</th>
            <th class="text-right">Failed</th>
            <th class="text-right">Total Amount</th>
            <th class="text-right">Rate</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(wm => {
    const totalTaken = wm.totalParcelsReceived ?? ((wm.totalParcelsDelivered || 0) + (wm.totalParcelsFailed || 0));
    return `
            <tr>
              <td>${wm.wishMasterName || '-'}</td>
              <td>${wm.employeeId || '-'}</td>
              <td class="text-right">${totalTaken}</td>
              <td class="text-right" style="color:#059669">${wm.totalParcelsDelivered ?? 0}</td>
              <td class="text-right" style="color:#DC2626">${wm.totalParcelsFailed ?? 0}</td>
              <td class="text-right amount">₹${(wm.totalAmount ?? 0).toLocaleString()}</td>
              <td class="text-right font-bold">${wm.perParcelRate != null ? '₹' + wm.perParcelRate : wm.approvedRate != null ? '₹' + wm.approvedRate : wm.proposedRate != null ? '₹' + wm.proposedRate : wm.per_parcel_rate != null ? '₹' + wm.per_parcel_rate : (wm.totalAmount > 0 && wm.totalParcelsDelivered > 0) ? '₹' + (wm.totalAmount / wm.totalParcelsDelivered).toFixed(2) : '-'}</td>
            </tr>
          `}).join('')}
          <tr style="background-color: #EEF2FF; font-weight: bold; border-top: 2px solid #4F46E5;">
            <td colspan="2">GRAND TOTAL (ALL)</td>
            <td class="text-right">${data.reduce((acc, wm) => acc + (wm.totalParcelsReceived ?? ((wm.totalParcelsDelivered || 0) + (wm.totalParcelsFailed || 0))), 0)}</td>
            <td class="text-right">${data.reduce((acc, wm) => acc + (wm.totalParcelsDelivered || 0), 0)}</td>
            <td class="text-right">${data.reduce((acc, wm) => acc + (wm.totalParcelsFailed || 0), 0)}</td>
            <td class="text-right">₹${data.reduce((acc, wm) => acc + (wm.totalAmount || 0), 0).toLocaleString()}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p>Generated by Shree Digambara Logistics Delivery Management System</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Pop-up blocked. Please allow pop-ups to download the PDF.");
    return;
  }
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    // printWindow.close();
  }, 500);
};
