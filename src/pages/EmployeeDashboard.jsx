import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedUser || loggedUser.role !== "employee") {
      navigate("/login");
    } else {
      setUser(loggedUser);
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-1">Employee Dashboard</h2>
      <p className="text-center text-muted mb-4">
        Welcome, <strong>{user.fullName || user.email}</strong>
      </p>

      <div className="row justify-content-center">

        {/* MANAGE POLICIES */}
        <div className="col-md-4 mb-3">
          <div
            className="card shadow p-4 text-center h-100"
            style={{ cursor: "pointer", borderTop: "4px solid #0d6efd" }}
            onClick={() => navigate("/employee/manage-policies")}
          >
            <div style={{ fontSize: 36 }}>📋</div>
            <h5 className="mt-2">Manage Policies</h5>
            <p className="text-muted">View all customer policy applications</p>
          </div>
        </div>

        {/* PROCESS CLAIMS */}
        <div className="col-md-4 mb-3">
          <div
            className="card shadow p-4 text-center h-100"
            style={{ cursor: "pointer", borderTop: "4px solid #198754" }}
            onClick={() => navigate("/employee/process-claims")}
          >
            <div style={{ fontSize: 36 }}>⚖️</div>
            <h5 className="mt-2">Process Claims</h5>
            <p className="text-muted">Review and approve insurance claims</p>
          </div>
        </div>

        {/* VIEW CLIENTS */}
        <div className="col-md-4 mb-3">
          <div
            className="card shadow p-4 text-center h-100"
            style={{ cursor: "pointer", borderTop: "4px solid #6f42c1" }}
            onClick={() => navigate("/employee/clients")}
          >
            <div style={{ fontSize: 36 }}>👥</div>
            <h5 className="mt-2">View Clients</h5>
            <p className="text-muted">See all registered client accounts</p>
          </div>
        </div>

        {/* CLAIM STATISTICS */}
        <div className="col-md-4 mb-3">
          <div
            className="card shadow p-4 text-center h-100"
            style={{ cursor: "pointer", borderTop: "4px solid #fd7e14" }}
            onClick={() => navigate("/employee/statistics")}
          >
            <div style={{ fontSize: 36 }}>📊</div>
            <h5 className="mt-2">Statistics</h5>
            <p className="text-muted">View claim and policy statistics</p>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="col-md-4 mb-3">
          <div
            className="card shadow p-4 text-center h-100"
            style={{ cursor: "pointer", borderTop: "4px solid #dc3545" }}
            onClick={() => navigate("/employee/notifications")}
          >
            <div style={{ fontSize: 36 }}>🔔</div>
            <h5 className="mt-2">Notifications</h5>
            <p className="text-muted">View pending tasks and alerts</p>
          </div>
        </div>

      </div>
    </div>
  );
}