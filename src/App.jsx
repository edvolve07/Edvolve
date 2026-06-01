import { LogOut, Menu, Sparkles } from "lucide-react";
import { Navigate, Outlet, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import AccessRevoked from "@/src/pages/AccessRevoked";
import AdminsList from "@/src/pages/admin/AdminsList";
import AptitudePage from "@/src/pages/AptitudePage";
import DashboardPage from "@/src/pages/DashboardPage";
import InterviewPage from "@/src/pages/InterviewPage";
import ReportPage from "@/src/pages/ReportPage";
import ReportsResultsPage from "@/src/pages/ReportsResultsPage";
import ResultDetails from "@/src/pages/aptitude/ResultDetails";
import AdminAptitudeAnalytics from "@/src/pages/admin/AdminAptitudeAnalytics";
import AdminInterviewAnalytics from "@/src/pages/admin/AdminInterviewAnalytics";
import AiUsagePage from "@/src/pages/admin/AiUsagePage";
import CreateAdmin from "@/src/pages/admin/CreateAdmin";
import CreateUser from "@/src/pages/admin/CreateUser";
import MasterAdminDashboard from "@/src/pages/admin/MasterAdminDashboard";
import MasterAdminsList from "@/src/pages/admin/MasterAdminsList";
import PrepupAdminDashboard from "@/src/pages/admin/PrepupAdminDashboard";
import StudentsList from "@/src/pages/admin/StudentsList";
import UserManagement from "@/src/pages/admin/UserManagement";
import AppSidebar from "../components/Sidebar";
import { APP_NAME } from "./constants";
import RoleGuard from "./portal/components/RoleGuard";
import PortalSidebar from "./portal/components/Sidebar";
import PortalLoadingSkeleton from "./portal/components/LoadingSkeleton";
import { useAuth } from "./portal/context/AuthContext";
import ForgotPassword from "./portal/pages/ForgotPassword";
import PortalLogin from "./portal/pages/Login";
import ResetPassword from "./portal/pages/ResetPassword";
import PortalSignup from "./portal/pages/Signup";
import AdminAssessments from "./portal/pages/admin/AdminAssessments";
import AssessmentResults from "./portal/pages/admin/AssessmentResults";
import CreateAssessment from "./portal/pages/admin/CreateAssessment";
import QuestionReview from "./portal/pages/admin/QuestionReview";
import PortalResultDetails from "./portal/pages/student/ResultDetails";
import PortalStartAssessment from "./portal/pages/student/StartAssessment";
import PortalStudentAssessments from "./portal/pages/student/StudentAssessments";
import StudentDashboard from "./portal/pages/student/StudentDashboard";
import PortalStudentResults from "./portal/pages/student/StudentResults";

function AppShell({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[1px]"
        />
      ) : null}
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-100 bg-white/90 px-3 backdrop-blur sm:px-4">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <Menu size={20} />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-brand">
            <Sparkles size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold leading-none text-slate-900">
              {APP_NAME}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Unified prep workspace</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600 sm:px-3"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        <main className="min-h-screen min-w-0 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

function RequireSession() {
  const { user, loading, revoked } = useAuth();
  if (loading) return <PortalLoadingSkeleton label="Checking session" />;
  if (revoked) return <Navigate to="/access-revoked" replace />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AuthLanding() {
  const { user, loading } = useAuth();
  if (loading) return <PortalLoadingSkeleton label="Checking session" />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homeForRole(user.role)} replace />;
}

function ReportsResultDetailsRoute() {
  const { attemptId } = useParams();
  return <ResultDetails attemptId={attemptId} backPath="/reports" />;
}

function homeForRole(role) {
  if (role === "master_admin") return "/master-admin-dashboard";
  if (role === "admin") return "/admin-dashboard";
  return "/dashboard";
}

function RequireRole({ roles }) {
  const { user, loading, revoked } = useAuth();
  if (loading) return <PortalLoadingSkeleton label="Checking session" />;
  if (revoked) return <Navigate to="/access-revoked" replace />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeForRole(user.role)} replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthLanding />} />
      <Route path="/login" element={<PortalLogin />} />
      <Route path="/access-revoked" element={<AccessRevoked />} />
      <Route path="/signup" element={<PortalSignup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<RequireSession />}>
        <Route path="/dashboard" element={<AppShell><DashboardPage /></AppShell>} />
        <Route path="/interview" element={<AppShell><InterviewPage /></AppShell>} />
        <Route path="/aptitude" element={<AppShell><AptitudePage /></AppShell>} />
        <Route path="/aptitude/:assessmentId/start" element={<AppShell><AptitudePage /></AppShell>} />
        <Route path="/aptitude/results" element={<AppShell><AptitudePage /></AppShell>} />
        <Route path="/aptitude/results/:attemptId" element={<AppShell><AptitudePage /></AppShell>} />
        <Route path="/report" element={<AppShell><ReportPage /></AppShell>} />
        <Route path="/reports" element={<AppShell><ReportsResultsPage /></AppShell>} />
        <Route path="/reports/results/:attemptId" element={<AppShell><ReportsResultDetailsRoute /></AppShell>} />
      </Route>

      <Route element={<RequireRole roles={["admin"]} />}>
        <Route path="/admin-dashboard" element={<AppShell><PrepupAdminDashboard /></AppShell>} />
        <Route path="/admin/dashboard" element={<Navigate to="/admin-dashboard" replace />} />
        <Route path="/admin/analytics/aptitude" element={<AppShell><AdminAptitudeAnalytics /></AppShell>} />
        <Route path="/admin/analytics/interviews" element={<AppShell><AdminInterviewAnalytics /></AppShell>} />
        <Route path="/admin/assessments" element={<AppShell><AdminAssessments /></AppShell>} />
        <Route path="/admin/assessments/create" element={<AppShell><CreateAssessment /></AppShell>} />
        <Route path="/admin/assessments/:id/questions" element={<AppShell><QuestionReview /></AppShell>} />
        <Route path="/admin/assessments/:id/results" element={<AppShell><AssessmentResults /></AppShell>} />
      </Route>

      <Route element={<RequireRole roles={["master_admin"]} />}>
        <Route path="/master-admin-dashboard" element={<AppShell><MasterAdminDashboard /></AppShell>} />
        <Route path="/master-admin/students" element={<AppShell><StudentsList /></AppShell>} />
        <Route path="/master-admin/admins" element={<AppShell><AdminsList /></AppShell>} />
        <Route path="/master-admin/master-admins" element={<AppShell><MasterAdminsList /></AppShell>} />
        <Route path="/master-admin/create-admin" element={<AppShell><CreateAdmin /></AppShell>} />
        <Route path="/master-admin/create-user" element={<AppShell><CreateUser /></AppShell>} />

        <Route path="/master-admin/ai-usage" element={<AppShell><AiUsagePage /></AppShell>} />
      </Route>

      <Route element={<RoleGuard role="student" />}>
        <Route element={<PortalSidebar role="student" />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/assessments" element={<PortalStudentAssessments />} />
          <Route path="/student/assessments/:id/start" element={<PortalStartAssessment />} />
          <Route path="/student/results" element={<PortalStudentResults />} />
          <Route path="/student/results/:attemptId" element={<PortalResultDetails />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
