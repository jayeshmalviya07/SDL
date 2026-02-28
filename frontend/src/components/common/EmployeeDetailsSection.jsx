import { useState } from "react";
import { formatCurrency } from "../../utils/formatHelper";

const EmployeeDetailsSection = ({ details }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    if (!details) return null;

    const documents = details.documents || {};

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300">
            {/* Header / Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full px-8 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <h2 className="text-xl font-bold text-gray-800">Employee Profile Details</h2>
                        <p className="text-sm text-gray-500">View registration documents and personal information</p>
                    </div>
                </div>
                <div className={`p-2 rounded-full bg-gray-100 text-gray-500 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Content */}
            <div className={`transition-all duration-500 ease-in-out ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"}`}>
                <div className="px-8 pb-8 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-gray-50">

                    {/* Sidebar / Photo */}
                    <div className="lg:col-span-3 flex flex-col items-center">
                        <div
                            className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-indigo-50 shadow-inner bg-gray-50 mb-4 group relative cursor-pointer"
                            onClick={() => {
                                if (details.profilePhotoUrl) {
                                    const url = details.profilePhotoUrl.startsWith('http') || details.profilePhotoUrl.startsWith('/')
                                        ? details.profilePhotoUrl
                                        : `/api/uploads/${details.profilePhotoUrl}`;
                                    window.open(url, "_blank");
                                }
                            }}
                        >
                            {details.profilePhotoUrl ? (
                                <img
                                    src={details.profilePhotoUrl.startsWith('http') || details.profilePhotoUrl.startsWith('/')
                                        ? details.profilePhotoUrl
                                        : `/api/uploads/${details.profilePhotoUrl}`}
                                    alt={details.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            {details.profilePhotoUrl && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">View Full Photo</span>
                                </div>
                            )}
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${details.approvalStatus === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            }`}>
                            {details.approvalStatus}
                        </span>
                    </div>

                    {/* Main Info */}
                    <div className="lg:col-span-9 space-y-8">
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <section>
                                <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">Personal Information</h3>
                                <div className="space-y-4">
                                    <InfoItem label="Full Name" value={details.name} />
                                    <InfoItem label="Employee ID" value={details.employeeId} />
                                    <InfoItem label="Contact Number" value={details.phone} />
                                    <InfoItem label="Permanent Address" value={details.address} />
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">Professional Details</h3>
                                <div className="space-y-4">
                                    <InfoItem label="Assigned Hub" value={details.hubName || "N/A"} />
                                    <InfoItem label="Vehicle Number" value={details.vehicleNumber || "N/A"} />
                                    <InfoItem label="Hired Rate (Per Parcel)" value={formatCurrency(details.approvedRate || details.proposedRate)} isHighlight />
                                </div>
                            </section>
                        </div>

                        {/* Documents Section */}
                        <section>
                            <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">Registered Documents</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Object.entries(documents).filter(([type]) => type !== "PHOTO").map(([type, url]) => (
                                    <DocCard key={type} type={type} url={url} />
                                ))}
                                {Object.keys(documents).length === 0 && (
                                    <p className="text-sm text-gray-400 italic">No documents uploaded during registration.</p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ label, value, isHighlight }) => (
    <div className="flex flex-col">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{label}</span>
        <span className={`${isHighlight ? "text-lg font-bold text-indigo-600" : "text-sm font-medium text-gray-700"}`}>
            {value || "Not Provided"}
        </span>
    </div>
);

const DocCard = ({ type, url }) => {
    const formattedType = type.split('_').join(' ');
    const normalizedUrl = url.startsWith('http') || url.startsWith('/') ? url : `/api/uploads/${url}`;

    return (
        <a
            href={normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
        >
            <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">{formattedType}</span>
                <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600">View File</span>
            </div>
        </a>
    );
};

export default EmployeeDetailsSection;
