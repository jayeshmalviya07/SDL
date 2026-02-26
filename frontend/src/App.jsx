import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SuperDashboard from "./pages/superadmin/Dashboard";
import { HubDashboard } from "./pages/hubadmin/Dashboard";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import WishMasterDailyEntry from "./pages/wishmaster/WishMasterDailyEntry";
import Reports from "./pages/superadmin/Reports";
import RegisterSuperAdmin from "./pages/superadmin/RegisterSuperAdmin";
import RegisterWishMaster from "./pages/hubadmin/RegisterWishMaster";
import RegisterHubAdmin from "./pages/superadmin/RegisterHubAdmin";
import AddHub from "./pages/superadmin/AddHub";
import WishMasterApprovals from "./pages/superadmin/WishMasterApprovals";
import HubList from "./pages/superadmin/HubList";
import HubAdminList from "./pages/superadmin/HubAdminList";
import HubAdminDetails from "./pages/superadmin/HubAdminDetails";
import WishMasterPerformance from "./pages/superadmin/WishMasterPerformance";
import WishMasterList from "./pages/hubadmin/WishMasterList";
import HubWishMasterPerformance from "./pages/hubadmin/WishMasterPerformance";
import HubReports from "./pages/hubadmin/Reports";
import MyEntries from "./pages/wishmaster/MyEntries";
import UniversalReports from "./pages/wishmaster/UniversalReports";

const PrivateRoute = ({ children, role }) => {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* SUPER_ADMIN protected routes */}
      <Route
        path="/super"
        element={
          <PrivateRoute role="SUPER_ADMIN">
            <DashboardLayout>
              <SuperDashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/RegisterHubAdmin"
        element={
          <PrivateRoute role="SUPER_ADMIN">
            <DashboardLayout>
              <RegisterHubAdmin />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/HubAdminList"
        element={
          <PrivateRoute role="SUPER_ADMIN">
            <DashboardLayout>
              <HubAdminList />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/HubAdminDetails/:adminId"
        element={
          <PrivateRoute role="SUPER_ADMIN">
            <DashboardLayout>
              <HubAdminDetails />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/WishMasterPerformance/:wmId"
        element={
          <PrivateRoute role="SUPER_ADMIN">
            <DashboardLayout>
              <WishMasterPerformance />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/HubList"
        element={
          <PrivateRoute role="SUPER_ADMIN">
            <DashboardLayout>
              <HubList />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/AddHub"
        element={
          <PrivateRoute role="SUPER_ADMIN">
            <DashboardLayout>
              <AddHub />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ApproveWishMaster"
        element={
          <PrivateRoute role="SUPER_ADMIN">
            <DashboardLayout>
              <WishMasterApprovals />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/Reports"
        element={
          <PrivateRoute role="SUPER_ADMIN">
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route path="/RegisterSuperAdmin" element={<RegisterSuperAdmin />} />

      {/* HUB_ADMIN protected routes */}
      <Route
        path="/hub"
        element={
          <PrivateRoute role="HUB_ADMIN">
            <DashboardLayout>
              <HubDashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/RegisterWishMaster"
        element={
          <PrivateRoute role="HUB_ADMIN">
            <DashboardLayout>
              <RegisterWishMaster />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/WishMasterList"
        element={
          <PrivateRoute role="HUB_ADMIN">
            <DashboardLayout>
              <WishMasterList />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hub/wishmasters/:wmId/performance"
        element={
          <PrivateRoute role="HUB_ADMIN">
            <DashboardLayout>
              <HubWishMasterPerformance />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hub/reports"
        element={
          <PrivateRoute role="HUB_ADMIN">
            <DashboardLayout>
              <HubReports />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* WISH_MASTER protected routes */}
      <Route
        path="/wish"
        element={<Navigate to="/DailyEntry" replace />}
      />

      <Route
        path="/wish/submit"
        element={
          <PrivateRoute role="WISH_MASTER">
            <DashboardLayout>
              <WishMasterDailyEntry />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/DailyEntry"
        element={
          <PrivateRoute role="WISH_MASTER">
            <DashboardLayout>
              <WishMasterDailyEntry />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/MyEntry"
        element={
          <PrivateRoute role="WISH_MASTER">
            <DashboardLayout>
              <MyEntries />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/UniversalReports"
        element={
          <PrivateRoute role="WISH_MASTER">
            <DashboardLayout>
              <UniversalReports />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

    </Routes>
  );
}

export default App;
