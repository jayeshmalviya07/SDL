import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import { toast } from "react-toastify";
import EmployeeDetailsSection from "../../components/common/EmployeeDetailsSection";

const InactiveUsers = () => {
    const [inactiveUsers, setInactiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [selecteduserDetails, setSelectedUserDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const fetchInactiveUsers = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get("/superadmin/inactive-employees");
            setInactiveUsers(res.data);
        } catch (error) {
            console.error("Error fetching inactive users:", error);
            toast.error("Failed to load inactive users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInactiveUsers();
    }, []);

    const fetchUserDetails = async (user) => {
        try {
            setDetailsLoading(true);
            const endpoint = user.role === "HUB_ADMIN"
                ? `/hub-admins/${user.id}`
                : `/delivery/${user.id}`;
            const res = await axiosInstance.get(endpoint);
            setSelectedUserDetails(res.data);
            setSelectedUser(user);
        } catch (error) {
            console.error("Error fetching user details:", error);
            toast.error("Failed to load registration details");
        } finally {
            setDetailsLoading(false);
        }
    };

    const filteredUsers = inactiveUsers.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.hubName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            Inactive Users
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Review soft-deleted Hub Admins and Wish Masters
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search by Name, ID, Hub, Role..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-inter"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="w-6 h-6 text-slate-400 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="bg-white p-16 rounded-3xl shadow-sm text-center border border-slate-200">
                        <div className="text-6xl mb-4">🧤</div>
                        <h3 className="text-2xl font-bold text-slate-900">No Inactive Users</h3>
                        <p className="text-slate-500 mt-2">All employees are currently active.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* List Section */}
                        <div className="space-y-4">
                            {filteredUsers.map((user) => (
                                <div
                                    key={`${user.role}-${user.id}`}
                                    onClick={() => fetchUserDetails(user)}
                                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${selectedUser?.id === user.id && selectedUser?.role === user.role
                                        ? "bg-indigo-50 border-indigo-200 shadow-md ring-1 ring-indigo-200"
                                        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-slate-900 text-lg">{user.name}</h3>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${user.role === 'HUB_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-slate-400 text-[10px] font-bold uppercase">Employee ID</span>
                                            <span className="text-slate-700 font-medium">{user.employeeId}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-400 text-[10px] font-bold uppercase">Hub Name</span>
                                            <span className="text-slate-700 font-medium">{user.hubName}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-400 text-[10px] font-bold uppercase">City</span>
                                            <span className="text-slate-700 font-medium">{user.city}</span>
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <span className="text-indigo-600 font-bold text-xs group-hover:underline">View Full Details →</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Details Section */}
                        <div className="lg:sticky lg:top-8 h-fit">
                            {detailsLoading ? (
                                <div className="bg-white p-20 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                                    <p className="text-slate-500 font-medium italic">Loading Full Profile...</p>
                                </div>
                            ) : selecteduserDetails ? (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <EmployeeDetailsSection employee={selecteduserDetails} />
                                </div>
                            ) : (
                                <div className="bg-indigo-50/50 p-20 rounded-3xl border border-dashed border-indigo-200 flex flex-col items-center justify-center text-center">
                                    <div className="text-5xl mb-4 opacity-50">👤</div>
                                    <h3 className="text-xl font-bold text-slate-900">Select an Employee</h3>
                                    <p className="text-slate-500 max-w-xs mt-2">Click on any inactive card to view their complete registration and document details.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InactiveUsers;
