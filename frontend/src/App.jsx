import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PolicyList from "./pages/PolicyList.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import ClientDashboard from "./pages/ClientDashboard.jsx";
import Footer from "./components/Footer.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Layout from "./layout/layout";
import PolicyDetails from "./pages/PolicyDetails";
import NewPolicyDetails from "./pages/NewPolicyDetails";
import ApplicationForm from "./pages/ApplicationForm";
import PremiumCalculator from "./pages/PremiumCalculator";
import SubmitClaim from "./pages/SubmitClaim";
import TrackClaims from "./pages/TrackClaims";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mt-4 main-content">
        <Routes>
          <Route path="/" element={<PolicyList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/policies" element={<PolicyList />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
	  <Route path="/policy/:policyId" element={<PolicyDetails />} />
    <Route path="/new-policy/:policyId" element={<PolicyDetails />} />
<Route path="/apply/:policyId" element={<ApplicationForm />} />
<Route path="/premium-calculator" element={<PremiumCalculator />} />
<Route path="/submit-claim" element={<SubmitClaim />} />
<Route path="/track-claims" element={<TrackClaims />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}