import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BranchManagerDashboard() {
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
      <h2 className="text-center mb-1">Branch Manager Dashboard</h2>
      <p className="text-center text-muted mb-4">
        Welcome, <strong>{user.fullName || user.email}</strong>
      </p>

      <div className="row justify-content-center">

        {/* TEAM OVERVIEW */}
        <div className="col-md-4 mb-3">
          <div
            className="card shadow p-4 text-center h-100"
            style={{ cursor: "pointer", borderTop: "4px solid #0d6efd" }}
            onClick={() => navigate("/employee/team-overview")}
          >
            <h5 className="mt-2">Team Overview</h5>
            <p className="text-muted">View agents and officers in your branch</p>
          </div>
        </div>

        {/* VIEW CLIENTS */}
        <div className="col-md-4 mb-3">
          <div
            className="card shadow p-4 text-center h-100"
            style={{ cursor: "pointer", borderTop: "4px solid #198754" }}
            onClick={() => navigate("/employee/clients")}
          >
            <h5 className="mt-2">View Clients</h5>
            <p className="text-muted">Browse all registered client accounts</p>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="col-md-4 mb-3">
          <div
            className="card shadow p-4 text-center h-100"
            style={{ cursor: "pointer", borderTop: "4px solid #fd7e14" }}
            onClick={() => navigate("/employee/statistics")}
          >
            <h5 className="mt-2">Statistics</h5>
            <p className="text-muted">View branch-level analytics</p>
          </div>
        </div>

        {/* ANNOUNCEMENTS */}
        <div className="col-md-4 mb-3">
          <div
            className="card shadow p-4 text-center h-100"
            style={{ cursor: "pointer", borderTop: "4px solid #ffc107" }}
            onClick={() => navigate("/employee/bm-announcements")}
          >
            <h5 className="mt-2">Announcements</h5>
            <p className="text-muted">Read notices posted by Admin</p>
          </div>
        </div>

        {/* BRANCH REPORT */}
        <div className="col-md-4 mb-3">
          <div
            className="card shadow p-4 text-center h-100"
            style={{ cursor: "pointer", borderTop: "4px solid #20c997" }}
            onClick={() => navigate("/employee/bm-report")}
          >
            <h5 className="mt-2">Branch Report</h5>
            <p className="text-muted">View and download branch performance data</p>
          </div>
        </div>

      </div>
    </div>
  );
}