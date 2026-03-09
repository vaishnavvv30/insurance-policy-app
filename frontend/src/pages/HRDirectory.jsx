import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLE_META = {
  "Branch Manager":  { hex: "#343a40", icon: "🏢" },
  "Insurance Agent": { hex: "#0d6efd", icon: "🤝" },
  "Claims Officer":  { hex: "#dc3545", icon: "⚖️"  },
  "Policy Officer":  { hex: "#198754", icon: "📋" }
};

export default function HRDirectory() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("all");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res  = await fetch("http://localhost:5000/hr/employees");
        const data = await res.json();
        setEmployees(data);
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const filtered = employees.filter(e => {
    const matchRole   = filter === "all" || e.employeeRole === filter;
    const matchSearch = !search ||
      e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>📒 Employee Directory</h2>
          <p className="text-muted mb-0">All staff records managed by HR</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>← Dashboard</button>
      </div>

      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input className="form-control" style={{ maxWidth: 280 }} placeholder="🔍 Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {["all", ...Object.keys(ROLE_META)].map(role => (
          <button key={role}
            className={`btn btn-sm ${filter === role ? "btn-dark" : "btn-outline-secondary"}`}
            onClick={() => setFilter(role)}>
            {role === "all" ? "All" : `${ROLE_META[role].icon} ${role}`}
          </button>
        ))}
      </div>

      <div className="mb-2">
        <span className="badge bg-primary me-2">Total: {employees.length}</span>
        <span className="badge bg-secondary">Showing: {filtered.length}</span>
      </div>

      {loading ? (
        <div className="text-center mt-4"><div className="spinner-border text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-info">No employees found.</div>
      ) : (
        <div className="row">
          {filtered.map(emp => {
            const meta = ROLE_META[emp.employeeRole];
            return (
              <div className="col-md-4 mb-3" key={emp._id}>
                <div className="card shadow p-3 h-100"
                  style={{ borderTop: `4px solid ${meta?.hex || "#ccc"}` }}>
                  <div className="d-flex align-items-center mb-2">
                    <div className="rounded-circle text-white d-flex align-items-center justify-content-center me-3"
                      style={{ width: 44, height: 44, backgroundColor: meta?.hex || "#ccc", fontSize: 20 }}>
                      {meta?.icon || "👤"}
                    </div>
                    <div>
                      <strong>{emp.fullName}</strong><br />
                      <small className="text-muted">{emp.email}</small>
                    </div>
                  </div>
                  <span className="badge text-white" style={{ backgroundColor: meta?.hex || "#999" }}>
                    {meta?.icon} {emp.employeeRole}
                  </span>
                  <p className="text-muted small mt-2 mb-0">
                    Joined: {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}