import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Login             from "./pages/Login.jsx";
import Register          from "./pages/Register.jsx";
import ForgotPassword    from "./pages/ForgotPassword";
import PolicyList        from "./pages/PolicyList.jsx";
import About             from "./pages/About.jsx";
import Contact           from "./pages/Contact.jsx";
import PolicyDetails     from "./pages/PolicyDetails";
import NewPolicyDetails  from "./pages/NewPolicyDetails";
import ApplicationForm   from "./pages/ApplicationForm";
import PremiumCalculator from "./pages/PremiumCalculator";

/* ── CLIENT ───────────────────────────────────────── */
import ClientDashboard from "./pages/ClientDashboard.jsx";
import SubmitClaim     from "./pages/SubmitClaim";
import TrackClaims     from "./pages/TrackClaims";
import MyPolicies      from "./pages/MyPolicies";
import ClientChat      from "./pages/ClientChat";
import Payment         from "./pages/Payment";
/* ── ADMIN ────────────────────────────────────────── */
import AdminDashboard      from "./pages/AdminDashboard.jsx";
import AdminManagePolicies from "./pages/AdminManagePolicies";
import ViewEmployees       from "./pages/ViewEmployees";
import ManageUsers         from "./pages/ManageUsers";
import SystemReport        from "./pages/SystemReport";
import AuditLog            from "./pages/AuditLog";
import SystemSettings      from "./pages/SystemSettings";
import AdminAnnouncements  from "./pages/AdminAnnouncements.jsx";

/* ── EMPLOYEE ROUTER ──────────────────────────────── */
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";

/* ── HR ───────────────────────────────────────────── */
import HRDashboard       from "./pages/HRDashboard";
import HRManageEmployees from "./pages/HRManageEmployees";
import HRDirectory       from "./pages/HRDirectory";
import HRReports         from "./pages/HRReports";

/* ── BRANCH MANAGER ───────────────────────────────── */
import BranchManagerDashboard from "./pages/BranchManagerDashboard";
import BMBranchReport         from "./pages/BMBranchReport";
import TeamOverview           from "./pages/TeamOverview";
import EmployeeViewClients    from "./pages/EmployeeViewClients";
import EmployeeStatistics     from "./pages/EmployeeStatistics";

/* ── CLAIMS OFFICER ───────────────────────────────── */
import ClaimsOfficerDashboard from "./pages/ClaimsOfficerDashboard";
import EmployeeProcessClaims  from "./pages/EmployeeProcessClaims";
import ClaimsHistory          from "./pages/ClaimsHistory";

/* ── POLICY OFFICER ───────────────────────────────── */
import PolicyOfficerDashboard from "./pages/PolicyOfficerDashboard";
import POInsurancePolicies    from "./pages/POInsurancePolicies";
import POApplications         from "./pages/POApplications";

/* ── INSURANCE AGENT ──────────────────────────────── */
import InsuranceAgentDashboard from "./pages/InsuranceAgentDashboard";
import ClientAssistance        from "./pages/ClientAssistance";
import EmployeeManagePolicies  from "./pages/EmployeeManagePolicies";
import AgentChat               from "./pages/AgentChat";

/* ── SHARED ───────────────────────────────────────── */
import AnnouncementsView     from "./pages/AnnouncementsView";
import EmployeeNotifications from "./pages/EmployeeNotifications";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mt-4 main-content">
        <Routes>

          {/* Public */}
          <Route path="/"                     element={<PolicyList />} />
          <Route path="/login"                element={<Login />} />
          <Route path="/register"             element={<Register />} />
          <Route path="/forgot-password"      element={<ForgotPassword />} />
          <Route path="/policies"             element={<PolicyList />} />
          <Route path="/about"                element={<About />} />
          <Route path="/contact"              element={<Contact />} />
          <Route path="/policy/:policyId"     element={<PolicyDetails />} />
          <Route path="/new-policy/:policyId" element={<NewPolicyDetails />} />
          <Route path="/premium-calculator"   element={<PremiumCalculator />} />

          {/* Client */}
          <Route path="/client"          element={<ClientDashboard />} />
          <Route path="/apply/:policyId" element={<ApplicationForm />} />
          <Route path="/submit-claim"    element={<SubmitClaim />} />
          <Route path="/track-claims"    element={<TrackClaims />} />
          <Route path="/my-policies"     element={<MyPolicies />} />
          <Route path="/client-chat"     element={<ClientChat />} />
          <Route path="/payment/:applicationId" element={<Payment />} />
          
          {/* Admin */}
          <Route path="/admin"                   element={<AdminDashboard />} />
          <Route path="/admin/policies"          element={<AdminManagePolicies />} />
          <Route path="/admin/announcements"     element={<AdminAnnouncements />} />
          <Route path="/employees"               element={<ViewEmployees />} />
          <Route path="/manage-users"            element={<ManageUsers />} />
          <Route path="/system-report"           element={<SystemReport />} />
          <Route path="/admin/audit-log"         element={<AuditLog />} />
          <Route path="/admin/settings"          element={<SystemSettings />} />

          {/* Employee router */}
          <Route path="/employee" element={<EmployeeDashboard />} />

          {/* HR */}
          <Route path="/employee/hr-dashboard"     element={<HRDashboard />} />
          <Route path="/employee/hr-manage"        element={<HRManageEmployees />} />
          <Route path="/employee/hr-directory"     element={<HRDirectory />} />
          <Route path="/employee/hr-reports"       element={<HRReports />} />
          <Route path="/employee/hr-announcements" element={<AnnouncementsView />} />

          {/* Branch Manager */}
          <Route path="/employee/bm-dashboard"     element={<BranchManagerDashboard />} />
          <Route path="/employee/bm-announcements" element={<AnnouncementsView />} />
          <Route path="/employee/team-overview"    element={<TeamOverview />} />
          <Route path="/employee/clients"          element={<EmployeeViewClients />} />
          <Route path="/employee/statistics"       element={<EmployeeStatistics />} />
          <Route path="/employee/bm-report"        element={<BMBranchReport />} />

          {/* Claims Officer */}
          <Route path="/employee/co-dashboard"     element={<ClaimsOfficerDashboard />} />
          <Route path="/employee/process-claims"   element={<EmployeeProcessClaims />} />
          <Route path="/employee/claims-history"   element={<ClaimsHistory />} />
          <Route path="/employee/claims-stats"     element={<EmployeeStatistics />} />
          <Route path="/employee/co-announcements" element={<AnnouncementsView />} />

          {/* Policy Officer */}
          <Route path="/employee/po-dashboard"          element={<PolicyOfficerDashboard />} />
          <Route path="/employee/po-insurance-policies" element={<POInsurancePolicies />} />
          <Route path="/employee/po-applications"       element={<POApplications />} />
          <Route path="/employee/policy-reports"        element={<EmployeeStatistics />} />
          <Route path="/employee/po-announcements"      element={<AnnouncementsView />} />

          {/* Insurance Agent */}
          <Route path="/employee/agent-dashboard"     element={<InsuranceAgentDashboard />} />
          <Route path="/employee/agent-applications"  element={<EmployeeManagePolicies />} />
          <Route path="/employee/client-assistance"   element={<ClientAssistance />} />
          <Route path="/employee/agent-chat"          element={<AgentChat />} />
          <Route path="/employee/agent-announcements" element={<AnnouncementsView />} />
          <Route path="/employee/manage-policies"     element={<EmployeeManagePolicies />} />

          {/* Shared */}
          <Route path="/employee/notifications" element={<EmployeeNotifications />} />

        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}