import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLE_META = {
  "Branch Manager":  { hex: "#343a40", icon: "🏢" },
  "Insurance Agent": { hex: "#0d6efd", icon: "🤝" },
  "Claims Officer":  { hex: "#dc3545", icon: "⚖️"  },
  "Policy Officer":  { hex: "#198754", icon: "📋" }
};

export default function HRReports() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res  = await fetch("http://localhost:5000/hr/employees");
        const data = await res.json();
        setEmployees(data);
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const countByRole = (role) => employees.filter(e => e.employeeRole === role).length;

  // Monthly hiring (last 6 months)
  const monthlyHiring = () => {
    const months = {};
    employees.forEach(e => {
      if (!e.createdAt) return;
      const d = new Date(e.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months).sort().slice(-6);
  };

  const maxMonthCount = Math.max(...monthlyHiring().map(([, v]) => v), 1);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>📊 HR Reports</h2>
          <p className="text-muted mb-0">Hiring statistics and staff breakdown</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>← Dashboard</button>
      </div>

      {loading ? (
        <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <>
          {/* Role breakdown */}
          <h5 className="mb-3">👥 Staff by Role</h5>
          <div className="row mb-4">
            {Object.entries(ROLE_META).map(([role, meta]) => (
              <div className="col-md-3 col-6 mb-3" key={role}>
                <div className="card text-white text-center p-4" style={{ backgroundColor: meta.hex }}>
                  <div style={{ fontSize: 32 }}>{meta.icon}</div>
                  <h2 className="mb-0 mt-1">{countByRole(role)}</h2>
                  <p className="mb-0 small fw-semibold">{role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Distribution progress bar */}
          {employees.length > 0 && (
            <div className="card p-4 shadow-sm mb-4">
              <h5 className="mb-3">📈 Staff Distribution</h5>
              {Object.entries(ROLE_META).map(([role, meta]) => {
                const count = countByRole(role);
                const pct   = employees.length ? Math.round((count / employees.length) * 100) : 0;
                return (
                  <div key={role} className="mb-2">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>{meta.icon} {role}</span>
                      <span>{count} staff ({pct}%)</span>
                    </div>
                    <div className="progress" style={{ height: 18 }}>
                      <div className="progress-bar" role="progressbar"
                        style={{ width: `${pct}%`, backgroundColor: meta.hex }}>
                        {pct > 10 ? `${pct}%` : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Monthly hiring chart */}
          {monthlyHiring().length > 0 && (
            <div className="card p-4 shadow-sm mb-4">
              <h5 className="mb-3">📅 Monthly Hiring Activity</h5>
              <div className="d-flex align-items-end gap-2" style={{ height: 120 }}>
                {monthlyHiring().map(([month, count]) => (
                  <div key={month} className="text-center flex-fill">
                    <small className="d-block mb-1 text-muted fw-bold">{count}</small>
                    <div className="rounded-top"
                      style={{
                        height: `${(count / maxMonthCount) * 90}px`,
                        backgroundColor: "#6f42c1",
                        minHeight: 8
                      }} />
                    <small className="text-muted" style={{ fontSize: "0.7rem" }}>{month}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently hired */}
          <div className="card p-4 shadow-sm">
            <h5 className="mb-3">🆕 Recently Hired Staff</h5>
            {employees.length === 0 ? (
              <p className="text-muted">No employees hired yet.</p>
            ) : (
              [...employees]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map(emp => {
                  const meta = ROLE_META[emp.employeeRole];
                  return (
                    <div key={emp._id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                      <div>
                        <strong>{emp.fullName}</strong>
                        <span className="badge ms-2 text-white" style={{ backgroundColor: meta?.hex || "#999" }}>
                          {meta?.icon} {emp.employeeRole}
                        </span>
                      </div>
                      <small className="text-muted">{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "—"}</small>
                    </div>
                  );
                })
            )}
          </div>
        </>
      )}
    </div>
  );
}