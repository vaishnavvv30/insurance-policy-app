import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeStatistics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0, totalApplications: 0, totalClaims: 0,
    pendingClaims: 0, approvedClaims: 0, rejectedClaims: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [claimsRes, appsRes, usersRes] = await Promise.all([
          fetch("http://localhost:5000/admin/claims"),
          fetch("http://localhost:5000/admin/applications"),
          fetch("http://localhost:5000/admin/users")   // returns ALL users
        ]);
        const claims = await claimsRes.json();
        const apps   = await appsRes.json();
        const users  = await usersRes.json();

        // Count only role === "client" for Total Clients
        const clientsOnly = users.filter((u) => u.role === "client");

        setStats({
          totalClients:      clientsOnly.length,
          totalApplications: apps.length,
          totalClaims:       claims.length,
          pendingClaims:     claims.filter((c) => c.status === "Pending").length,
          approvedClaims:    claims.filter((c) => c.status === "Approved").length,
          rejectedClaims:    claims.filter((c) => c.status === "Rejected").length
        });
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Clients",      value: stats.totalClients,      color: "bg-primary" },
    { label: "Total Applications", value: stats.totalApplications, color: "bg-info text-dark" },
    { label: "Total Claims",       value: stats.totalClaims,       color: "bg-secondary" },
    { label: "Pending Claims",     value: stats.pendingClaims,     color: "bg-warning text-dark" },
    { label: "Approved Claims",    value: stats.approvedClaims,    color: "bg-success" },
    { label: "Rejected Claims",    value: stats.rejectedClaims,    color: "bg-danger" }
  ];

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Statistics</h2>
          <p className="text-muted mb-0">Overview of claims and policy activity</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>
          ← Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <>
          <div className="row">
            {cards.map((card, i) => (
              <div className="col-md-4 mb-3" key={i}>
                <div className={`card ${card.color} text-center p-4`}
                  style={{ color: card.color.includes("text-dark") ? "#000" : "#fff" }}>
                  <h2 className="mb-1">{card.value}</h2>
                  <p className="mb-0 fw-semibold">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Approval rate progress bar */}
          {stats.totalClaims > 0 && (
            <div className="card p-4 mt-2 shadow-sm">
              <h5 className="mb-3">Claim Approval Rate</h5>
              <div className="progress" style={{ height: 28 }}>
                {stats.approvedClaims > 0 && (
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${Math.round((stats.approvedClaims / stats.totalClaims) * 100)}%` }}
                  >
                    {Math.round((stats.approvedClaims / stats.totalClaims) * 100)}% Approved
                  </div>
                )}
                {stats.rejectedClaims > 0 && (
                  <div
                    className="progress-bar bg-danger"
                    style={{ width: `${Math.round((stats.rejectedClaims / stats.totalClaims) * 100)}%` }}
                  >
                    {Math.round((stats.rejectedClaims / stats.totalClaims) * 100)}% Rejected
                  </div>
                )}
                {stats.pendingClaims > 0 && (
                  <div
                    className="progress-bar bg-warning"
                    style={{ width: `${Math.round((stats.pendingClaims / stats.totalClaims) * 100)}%` }}
                  >
                    {Math.round((stats.pendingClaims / stats.totalClaims) * 100)}% Pending
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}