import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLE_META = {
  "Insurance Agent": { hex: "#0d6efd", icon: "🤝" },
  "Claims Officer":  { hex: "#dc3545", icon: "⚖️"  },
  "Policy Officer":  { hex: "#198754", icon: "📋" }
};

export default function TeamOverview() {
  const navigate = useNavigate();
  const [team,    setTeam]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res  = await fetch("http://localhost:5000/hr/employees");
        const data = await res.json();
        // Branch Manager sees the staff below them
        setTeam(data.filter(e => ["Insurance Agent", "Claims Officer", "Policy Officer"].includes(e.employeeRole)));
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetchTeam();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>👔 Team Overview</h2>
          <p className="text-muted mb-0">Your agents and officers</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>← Dashboard</button>
      </div>

      {/* Role count */}
      <div className="row mb-4">
        {Object.entries(ROLE_META).map(([role, meta]) => (
          <div className="col-md-4 mb-2" key={role}>
            <div className="card text-white text-center p-3" style={{ backgroundColor: meta.hex }}>
              <div style={{ fontSize: 28 }}>{meta.icon}</div>
              <h3 className="mb-0">{team.filter(e => e.employeeRole === role).length}</h3>
              <small>{role}s</small>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center"><div className="spinner-border text-primary" /></div>
      ) : team.length === 0 ? (
        <div className="alert alert-info">No team members found. Ask HR to hire staff.</div>
      ) : (
        <div className="row">
          {team.map(emp => {
            const meta = ROLE_META[emp.employeeRole];
            return (
              <div className="col-md-4 mb-3" key={emp._id}>
                <div className="card shadow p-3" style={{ borderTop: `4px solid ${meta?.hex}` }}>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle text-white d-flex align-items-center justify-content-center me-3"
                      style={{ width: 44, height: 44, backgroundColor: meta?.hex, fontSize: 20 }}>
                      {meta?.icon}
                    </div>
                    <div>
                      <strong>{emp.fullName}</strong><br />
                      <small className="text-muted">{emp.email}</small>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="badge text-white" style={{ backgroundColor: meta?.hex }}>
                      {meta?.icon} {emp.employeeRole}
                    </span>
                    <span className="ms-2 text-muted small">
                      Since {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}