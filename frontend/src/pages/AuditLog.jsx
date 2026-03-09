import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuditLog() {
  const navigate = useNavigate();
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const [usersRes, claimsRes, appsRes] = await Promise.all([
          fetch("http://localhost:5000/admin/users"),
          fetch("http://localhost:5000/admin/claims"),
          fetch("http://localhost:5000/admin/applications")
        ]);
        const users  = await usersRes.json();
        const claims = await claimsRes.json();
        const apps   = await appsRes.json();

        const entries = [
          ...users.map(u => ({
            type: "User Registration", icon: "👤", color: "#0d6efd",
            description: `${u.fullName} (${u.email}) registered as ${u.role}`,
            date: u.createdAt
          })),
          ...claims.map(c => ({
            type: "Claim Submitted", icon: "⚖️", color: c.status === "Approved" ? "#198754" : c.status === "Rejected" ? "#dc3545" : "#fd7e14",
            description: `Claim of ₹${c.claimAmount} for Policy ${c.policyId} — Status: ${c.status}`,
            date: c.createdAt
          })),
          ...apps.map(a => ({
            type: "Policy Application", icon: "📋", color: "#6f42c1",
            description: `${a.firstName} ${a.lastName} applied for policy ${a.policyId}`,
            date: a.createdAt
          }))
        ];

        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        setLogs(entries.slice(0, 50));
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetchLogs();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>🔍 Audit Log</h2>
          <p className="text-muted mb-0">Track all recent system activities (latest 50)</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/admin")}>← Dashboard</button>
      </div>

      {loading ? (
        <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>
      ) : logs.length === 0 ? (
        <div className="alert alert-info">No activity recorded yet.</div>
      ) : (
        <div className="timeline">
          {logs.map((log, i) => (
            <div key={i} className="card mb-2 p-3 border-start border-3"
              style={{ borderColor: log.color + " !important", borderLeftColor: log.color }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="badge me-2 text-white" style={{ backgroundColor: log.color }}>
                    {log.icon} {log.type}
                  </span>
                  <span className="text-muted small">{log.description}</span>
                </div>
                <small className="text-muted text-nowrap ms-3">
                  {log.date ? new Date(log.date).toLocaleDateString() + " " + new Date(log.date).toLocaleTimeString() : "—"}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}