import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
        <Navbar />
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </div>
    </div>
  );
};
