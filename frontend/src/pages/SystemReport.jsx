import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SystemReport() {
  const navigate = useNavigate();
  const [report,  setReport]  = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res  = await fetch("http://localhost:5000/admin/system-report");
        const data = await res.json();
        setReport(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const cards = [
    { label: "Total Users",        value: report.totalUsers,        color: "bg-primary",   icon: "👥" },
    { label: "Total Policies",     value: report.totalPolicies,     color: "bg-success",   icon: "📋" },
    { label: "Total Claims",       value: report.totalClaims,       color: "bg-dark",      icon: "⚖️" },
    { label: "Total Applications", value: report.totalApplications, color: "bg-info text-dark", icon: "📝" }
  ];

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>System Report</h2>
          <p className="text-muted mb-0">Live overview of platform activity</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/admin")}>
          ← Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <div className="row">
          {cards.map((card, i) => (
            <div className="col-md-3 mb-3" key={i}>
              <div className={`card ${card.color} text-center p-4`}
                style={{ color: card.color.includes("text-dark") ? "#000" : "#fff" }}>
                <div style={{ fontSize: 36 }}>{card.icon}</div>
                <h2 className="mt-2 mb-1">{card.value ?? "—"}</h2>
                <p className="mb-0 fw-semibold">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}