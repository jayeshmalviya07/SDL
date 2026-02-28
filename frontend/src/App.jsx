import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Auth
const Login = lazy(() => import("./pages/auth/Login"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));

// Super Admin
const SuperDashboard = lazy(() => import("./pages/superadmin/Dashboard"));
const Reports = lazy(() => import("./pages/superadmin/Reports"));
const RegisterSuperAdmin = lazy(() => import("./pages/superadmin/RegisterSuperAdmin"));
const RegisterHubAdmin = lazy(() => import("./pages/superadmin/RegisterHubAdmin"));
const AddHub = lazy(() => import("./pages/superadmin/AddHub"));
const WishMasterApprovals = lazy(() => import("./pages/superadmin/WishMasterApprovals"));
const HubList = lazy(() => import("./pages/superadmin/HubList"));
const HubAdminList = lazy(() => import("./pages/superadmin/HubAdminList"));
const HubAdminDetails = lazy(() => import("./pages/superadmin/HubAdminDetails"));
const WishMasterPerformance = lazy(() => import("./pages/superadmin/WishMasterPerformance"));
const InactiveUsers = lazy(() => import("./pages/superadmin/InactiveUsers"));

// Hub Admin
const HubDashboard = lazy(() => import("./pages/hubadmin/Dashboard").then(m => ({ default: m.HubDashboard })));
const RegisterWishMaster = lazy(() => import("./pages/hubadmin/RegisterWishMaster"));
const WishMasterList = lazy(() => import("./pages/hubadmin/WishMasterList"));
const HubWishMasterPerformance = lazy(() => import("./pages/hubadmin/WishMasterPerformance"));
const HubReports = lazy(() => import("./pages/hubadmin/Reports"));

// Wish Master
const WishMasterDailyEntry = lazy(() => import("./pages/wishmaster/WishMasterDailyEntry"));
const MyEntries = lazy(() => import("./pages/wishmaster/MyEntries"));
const UniversalReports = lazy(() => import("./pages/wishmaster/UniversalReports"));

// Components
const DashboardLayout = lazy(() => import("./components/layout/DashboardLayout").then(m => ({ default: m.DashboardLayout })));

const PrivateRoute = ({ children, role }) => {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Loading experience...</p>
        </div>
      </div>
    }>
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
        <Route
          path="/InactiveUsers"
          element={
            <PrivateRoute role="SUPER_ADMIN">
              <DashboardLayout>
                <InactiveUsers />
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
    </Suspense>
  );
}

export default App;
