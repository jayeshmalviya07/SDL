import { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";

const WishMasterApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvedRate, setApprovedRate] = useState("");

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const res = await axiosInstance.get("/superadmin/pending-registrations");
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching registration requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, approved) => {
    try {
      const rateToSubmit = approved ? (approvedRate || selectedRequest.proposedRate) : null;

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const superAdminId = user.entityId;

      await axiosInstance.post(`/superadmin/pending-registrations/${id}/approve?approved=${approved}${approved ? `&approvedRate=${rateToSubmit}` : ""}&superAdminId=${superAdminId}`);

      setRequests((prev) => prev.filter((r) => r.id !== id));
      setSelectedRequest(null);
      setApprovedRate("");
      alert(approved ? "✅ Wish Master approved successfully!" : "❌ Wish Master rejected.");
    } catch (err) {
      console.error("Action error:", err);
      alert(err.response?.data?.message || "Error processing request");
    }
  };

  const getFileUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith("/api/uploads/")) return url;
    if (url.startsWith("/api/files/")) {
      return url.replace("/api/files/", "/api/uploads/");
    }
    return `/api/uploads/${url}`;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Registration <span className="text-indigo-600">Requests</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Review and approve delivery partner registrations</p>
        </header>

        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-24 text-center">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
            <p className="text-slate-500 mt-1">No pending registration requests to review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-400 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all"
                      onClick={() => {
                        const photoUrl = request.documents?.PHOTO;
                        if (photoUrl) window.open(getFileUrl(photoUrl), "_blank");
                      }}
                    >
                      {request.documents?.PHOTO ? (
                        <img src={getFileUrl(request.documents.PHOTO)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-indigo-600 font-black text-2xl uppercase">
                          {request.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-widest">
                      ID: {request.employeeId}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {request.name}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {request.phone}
                  </p>
                  <p className="text-slate-400 text-xs mt-3 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {request.hubName} ({request.hubCity})
                  </p>

                  <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Proposed Rate</p>
                      <p className="text-lg font-black text-slate-900">₹{request.proposedRate}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setApprovedRate(request.proposedRate.toString());
                      }}
                      className="bg-indigo-600 hover:bg-black text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{selectedRequest.name}</h2>
                    <p className="text-slate-500 font-medium">Review registration details</p>
                  </div>
                  <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Employee ID</p>
                      <p className="font-bold text-slate-800">{selectedRequest.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Contact</p>
                      <p className="font-bold text-slate-800">{selectedRequest.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Hub</p>
                      <p className="font-bold text-slate-800">{selectedRequest.hubName} ({selectedRequest.hubCity})</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Address</p>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed">{selectedRequest.address || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Documents</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedRequest.documents && Object.entries(selectedRequest.documents).map(([key, url]) => (
                        <a
                          key={key}
                          href={getFileUrl(url)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-300 hover:bg-white transition-all group"
                        >
                          <svg className="w-6 h-6 text-slate-300 group-hover:text-indigo-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          <span className="text-[9px] font-black text-slate-500 truncate w-full text-center uppercase tracking-tighter">{key.replace('_', ' ')}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Adjust Approved Rate (per package)</p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={approvedRate}
                        onChange={(e) => setApprovedRate(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-200 outline-none font-black text-lg text-slate-900"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAction(selectedRequest.id, true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 whitespace-nowrap"
                    >
                      Approve Partner
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to reject this registration?"))
                          handleAction(selectedRequest.id, false);
                      }}
                      className="text-red-600 hover:text-red-700 font-bold text-sm px-4 py-2 transition-colors"
                    >
                      Reject Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishMasterApprovals;
