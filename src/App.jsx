import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Login            from "./pages/Login.jsx";
import Register         from "./pages/Register.jsx";
import PolicyList       from "./pages/PolicyList.jsx";
import About            from "./pages/About.jsx";
import Contact          from "./pages/Contact.jsx";
import PolicyDetails    from "./pages/PolicyDetails";
import NewPolicyDetails from "./pages/NewPolicyDetails";
import ApplicationForm  from "./pages/ApplicationForm";
import PremiumCalculator from "./pages/PremiumCalculator";

// Client
import ClientDashboard  from "./pages/ClientDashboard.jsx";
import SubmitClaim      from "./pages/SubmitClaim";
import TrackClaims      from "./pages/TrackClaims";
import MyPolicies       from "./pages/MyPolicies";          // NEW

// Admin
import AdminDashboard       from "./pages/AdminDashboard.jsx";
import ManagePolicies       from "./pages/ManagePolicies";
import ViewEmployees        from "./pages/ViewEmployees";
import ManageUsers          from "./pages/ManageUsers";
import SystemReport         from "./pages/SystemReport";
import AdminAnnouncements   from "./pages/AdminAnnouncements"; // NEW

// Employee
import EmployeeDashboard        from "./pages/EmployeeDashboard.jsx";
import EmployeeManagePolicies   from "./pages/EmployeeManagePolicies";
import EmployeeProcessClaims    from "./pages/EmployeeProcessClaims";
import EmployeeViewClients      from "./pages/EmployeeViewClients";
import EmployeeStatistics       from "./pages/EmployeeStatistics";
import EmployeeNotifications    from "./pages/EmployeeNotifications";

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
          <Route path="/policies"             element={<PolicyList />} />
          <Route path="/about"                element={<About />} />
          <Route path="/contact"              element={<Contact />} />
          <Route path="/policy/:policyId"     element={<PolicyDetails />} />
          <Route path="/new-policy/:policyId" element={<NewPolicyDetails />} />
          <Route path="/premium-calculator"   element={<PremiumCalculator />} />

          {/* Client */}
          <Route path="/client"               element={<ClientDashboard />} />
          <Route path="/apply/:policyId"      element={<ApplicationForm />} />
          <Route path="/submit-claim"         element={<SubmitClaim />} />
          <Route path="/track-claims"         element={<TrackClaims />} />
          <Route path="/my-policies"          element={<MyPolicies />} />

          {/* Admin */}
          <Route path="/admin"                    element={<AdminDashboard />} />
          <Route path="/manage-policies"          element={<ManagePolicies />} />
          <Route path="/employees"                element={<ViewEmployees />} />
          <Route path="/manage-users"             element={<ManageUsers />} />
          <Route path="/system-report"            element={<SystemReport />} />
          <Route path="/admin/announcements"      element={<AdminAnnouncements />} />

          {/* Employee */}
          <Route path="/employee"                  element={<EmployeeDashboard />} />
          <Route path="/employee/manage-policies"  element={<EmployeeManagePolicies />} />
          <Route path="/employee/process-claims"   element={<EmployeeProcessClaims />} />
          <Route path="/employee/clients"          element={<EmployeeViewClients />} />
          <Route path="/employee/statistics"       element={<EmployeeStatistics />} />
          <Route path="/employee/notifications"    element={<EmployeeNotifications />} />

        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}