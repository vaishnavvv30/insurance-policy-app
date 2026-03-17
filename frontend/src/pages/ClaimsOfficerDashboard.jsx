import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ClaimsOfficerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [recentClaims, setRecentClaims] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedUser || loggedUser.employeeRole !== "Claims Officer") {
      navigate("/login");
    } else { setUser(loggedUser); }

    const fetchData = async () => {
      try {
        const [claimsRes, annRes] = await Promise.all([
          fetch("http://localhost:5000/admin/claims"),
          fetch("http://localhost:5000/announcements")
        ]);
        const claims = await claimsRes.json();
        const anns = await annRes.json();
        setStats({
          total: claims.length,
          pending: claims.filter(c => c.status === "Pending").length,
          approved: claims.filter(c => c.status === "Approved").length,
          rejected: claims.filter(c => c.status === "Rejected").length
        });
        setRecentClaims(claims.filter(c => c.status === "Pending").slice(0, 3));
        setAnnouncements(anns.slice(0, 2));
      } catch (e) { console.log(e); }
    };
    fetchData();
  }, [navigate]);

  if (!user) return null;

  const cards = [
    { title: "Process Claims", desc: "Review and approve or reject insurance claims", path: "/employee/process-claims", border: "#dc3545" },
    { title: "Claims History", desc: "View all reviewed and resolved claims", path: "/employee/claims-history", border: "#6f42c1" },
    { title: "Claims Statistics", desc: "Approval rates and claim analytics", path: "/employee/claims-stats", border: "#fd7e14" },
    { title: "Announcements", desc: "Read notices and updates from Admin", path: "/employee/co-announcements", border: "#ffc107" }
  ];

  return (
    <div className="container mt-4">

      <div className="text-center mb-4">
        <h2 className="mb-1">Claims Officer Dashboard</h2>
        <p className="text-muted mb-2">Welcome, <strong>{user.fullName}</strong></p>
        <span className="badge px-3 py-2 text-white" style={{ backgroundColor: "#dc3545", fontSize: "0.95rem" }}>
          Claims Officer
        </span>
      </div>

      {/* Pending alert */}
      {stats.pending > 0 && (
        <div className="alert alert-warning d-flex justify-content-between align-items-center mb-3">
          <span><strong>{stats.pending} claim(s)</strong> are waiting for your review.</span>
          <button className="btn btn-sm btn-warning" onClick={() => navigate("/employee/process-claims")}>
            Review Now →
          </button>
        </div>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="mb-4">
          <h6 className="text-muted mb-2 text-center">Announcements</h6>
          {announcements.map(ann => (
            <div key={ann._id} className="alert alert-warning py-2 px-3 mb-2">
              <strong>{ann.title}:</strong> {ann.message}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="row mb-4 text-center">
        {[
          { label: "Total Claims", value: stats.total, color: "#6c757d" },
          { label: "Pending", value: stats.pending, color: "#fd7e14" },
          { label: "Approved", value: stats.approved, color: "#198754" },
          { label: "Rejected", value: stats.rejected, color: "#dc3545" }
        ].map((s, i) => (
          <div className="col-md-3 col-6 mb-2" key={i}>
            <div className="card text-white text-center p-3" style={{ backgroundColor: s.color }}>
              <h3 className="mb-0 mt-1">{s.value}</h3>
              <small>{s.label}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Recent pending */}
      {recentClaims.length > 0 && (
        <div className="card p-3 mb-4 shadow-sm">
          <h6 className="mb-2 text-center">Pending Claims — Quick View</h6>
          {recentClaims.map(claim => (
            <div key={claim._id} className="d-flex justify-content-between align-items-center border-bottom py-2">
              <div>
                <span className="badge bg-secondary me-2">{claim.policyId}</span>
                <strong>{claim.claimType}</strong>
                <span className="ms-2 text-muted small">₹{claim.claimAmount}</span>
              </div>
              <span className="badge bg-warning text-dark">{claim.status}</span>
            </div>
          ))}
          <button className="btn btn-sm btn-outline-danger mt-2" onClick={() => navigate("/employee/process-claims")}>
            View All Pending →
          </button>
        </div>
      )}

      {/* Feature cards */}
      <div className="row justify-content-center text-center">
        {cards.map((card, i) => (
          <div className="col-md-6 mb-3" key={i}>
            <div
              className="card shadow p-4 h-100"
              style={{ cursor: "pointer", borderTop: `4px solid ${card.border}` }}
              onClick={() => navigate(card.path)}
            >
              <h5 className="mt-2">{card.title}</h5>
              <p className="text-muted mb-0">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}