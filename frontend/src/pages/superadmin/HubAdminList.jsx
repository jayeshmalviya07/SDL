import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { toast } from "react-toastify";

const HubAdminList = () => {
    const [hubAdmins, setHubAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const fetchHubAdmins = async () => {
        try {
            const res = await axiosInstance.get("/hub-admins");
            console.log("Hub Admins API Response:", res.data);
            const data = res.data?.data || res.data || [];
            if (Array.isArray(data)) {
                setHubAdmins(data);
            } else {
                console.error("Expected array but got:", typeof data);
                setHubAdmins([]);
            }
        } catch (error) {
            console.error("Error fetching hub admins:", error);
            toast.error("Failed to load hub admins");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHubAdmins();
    }, []);

    const filteredAdmins = hubAdmins.filter(
        (admin) =>
            (admin.name && admin.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (admin.username && admin.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (admin.city && admin.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (admin.hubId && admin.hubId.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
            (admin.id && admin.id.toString().includes(searchTerm.toLowerCase())) ||
            (admin.email && admin.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleRowClick = (admin) => {
        navigate(`/HubAdminDetails/${admin.id}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-4 sm:px-6 lg:px-10 py-8 relative">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-800">
                            Hub Admin List
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Manage all registered Hub Admins
                        </p>
                    </div>

                    <div className="relative w-72">
                        <input
                            type="text"
                            placeholder="Search by City, ID, Name..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-inter"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                </div>

                {/* List Area */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredAdmins.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
                        <p className="text-xl text-gray-500">No Hub Admins found.</p>
                        {searchTerm && <p className="text-gray-400 mt-2">Try adjusting your search.</p>}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hub Admin ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hub ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hub Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        City
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAdmins.map((admin) => (
                                    <tr
                                        key={admin.id}
                                        className="hover:bg-indigo-50 transition-colors cursor-pointer"
                                        onClick={() => handleRowClick(admin)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                            #{admin.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {admin.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {admin.username || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {admin.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {admin.hubId || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {admin.hubName || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium whitespace-break-spaces">
                                            {admin.city || "N/A"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HubAdminList;
