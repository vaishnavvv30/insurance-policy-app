import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Each role now has its own dedicated dashboard component.
// This file simply reads the employeeRole and redirects.

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user || user.role !== "employee") {
      navigate("/login");
      return;
    }

    switch (user.employeeRole) {
      case "HR":               navigate("/employee/hr-dashboard",     { replace: true }); break;
      case "Branch Manager":   navigate("/employee/bm-dashboard",     { replace: true }); break;
      case "Claims Officer":   navigate("/employee/co-dashboard",     { replace: true }); break;
      case "Policy Officer":   navigate("/employee/po-dashboard",     { replace: true }); break;
      case "Insurance Agent":  navigate("/employee/agent-dashboard",  { replace: true }); break;
      default:
        // No role assigned yet — show warning
        break;
    }
  }, [navigate]);

  // Shown only when employeeRole is null/unassigned
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  return (
    <div className="container mt-5 text-center">
      <h2>👤 Employee Dashboard</h2>
      <p className="text-muted">Welcome, <strong>{user?.fullName || user?.email}</strong></p>
      <span className="badge bg-secondary px-3 py-2 mb-3" style={{ fontSize: "1rem" }}>
        ⚠️ No Role Assigned — Contact Admin or HR
      </span>
      <div className="alert alert-warning mt-3 mx-auto" style={{ maxWidth: 500 }}>
        Your account has not been assigned a job role yet.<br />
        Please contact <strong>Admin</strong> or <strong>HR</strong> to get your role assigned.
      </div>
    </div>
  );
}