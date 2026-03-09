import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLE_META = {
  "HR":               { hex: "#6f42c1", icon: "🧑‍💼", desc: "Hire employees, maintain records, assign roles" },
  "Branch Manager":   { hex: "#343a40", icon: "🏢",  desc: "Supervises branch operations and teams" },
  "Insurance Agent":  { hex: "#0d6efd", icon: "🤝",  desc: "Assists clients with policy applications" },
  "Claims Officer":   { hex: "#dc3545", icon: "⚖️",   desc: "Reviews and processes insurance claims" },
  "Policy Officer":   { hex: "#198754", icon: "📋",  desc: "Verifies applications, manages policy records" }
};

export default function ViewEmployees() {
  const navigate = useNavigate();
  const [employees,   setEmployees]   = useState([]);
  const [showForm,    setShowForm]    = useState(false);
  const [filterRole,  setFilterRole]  = useState("all");
  const [search,      setSearch]      = useState("");
  const [fullName,    setFullName]    = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [loading,     setLoading]     = useState(true);

  const fetchEmployees = async () => {
    try {
      const res  = await fetch("http://localhost:5000/admin/all-employees");
      const data = await res.json();
      setEmployees(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const addHR = async () => {
    if (!fullName || !email || !password) { alert("Please fill all fields"); return; }
    try {
      const res  = await fetch("http://localhost:5000/admin/add-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password })
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      alert("HR staff added successfully!");
      setFullName(""); setEmail(""); setPassword(""); setShowForm(false);
      fetchEmployees();
    } catch (e) { alert("Error adding HR"); }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Remove this employee?")) return;
    try {
      await fetch(`http://localhost:5000/admin/delete-employee/${id}`, { method: "DELETE" });
      fetchEmployees();
    } catch (e) { console.log(e); }
  };

  const countByRole = (role) => employees.filter(e => e.employeeRole === role).length;

  const filtered = employees.filter(e => {
    const matchRole   = filterRole === "all" || e.employeeRole === filterRole;
    const matchSearch = !search ||
      e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="container mt-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>👔 Manage Employees</h2>
          <p className="text-muted mb-0">View all staff. Admin directly hires HR only.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "+ Hire HR"}
          </button>
          <button className="btn btn-outline-secondary" onClick={() => navigate("/admin")}>
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Hierarchy banner */}
      <div className="alert alert-info py-2 mb-3">
        <strong>🏛️ Hiring Hierarchy:</strong>&nbsp;
        <span className="badge bg-danger me-1">Admin</span> hires
        <span className="badge ms-1 me-1 text-white" style={{ backgroundColor: "#6f42c1" }}>🧑‍💼 HR</span>
        → HR hires
        <span className="badge bg-dark ms-1 me-1">🏢 Branch Manager</span>
        <span className="badge bg-primary ms-1 me-1">🤝 Insurance Agent</span>
        <span className="badge bg-danger ms-1 me-1">⚖️ Claims Officer</span>
        <span className="badge bg-success ms-1">📋 Policy Officer</span>
      </div>

      {/* Role summary cards */}
      <div className="row mb-3">
        {["all", ...Object.keys(ROLE_META)].map((role) => {
          const meta  = role !== "all" ? ROLE_META[role] : null;
          const count = role === "all" ? employees.length : countByRole(role);
          const hex   = role === "all" ? "#6c757d" : meta.hex;
          const icon  = role === "all" ? "👥" : meta.icon;
          const label = role === "all" ? "All Staff" : role;
          return (
            <div className="col mb-2" key={role} style={{ cursor: "pointer" }}
              onClick={() => setFilterRole(role)}>
              <div className="card text-white text-center p-2"
                style={{
                  backgroundColor: hex,
                  border: filterRole === role ? "3px solid #000" : "2px solid transparent",
                  transform: filterRole === role ? "scale(1.04)" : "scale(1)",
                  transition: "all 0.15s"
                }}>
                <div style={{ fontSize: 20 }}>{icon}</div>
                <div className="fw-bold" style={{ fontSize: "0.75rem" }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: "bold" }}>{count}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <input className="form-control mb-3" placeholder="🔍 Search by name or email..."
        value={search} onChange={(e) => setSearch(e.target.value)} />

      {/* Add HR form */}
      {showForm && (
        <div className="card p-4 mb-4 shadow-sm" style={{ borderLeft: "4px solid #6f42c1" }}>
          <h5 className="mb-1">➕ Add New HR Employee</h5>
          <p className="text-muted small mb-3">HR will be responsible for hiring Branch Managers, Insurance Agents, Claims Officers, and Policy Officers.</p>
          <div className="row">
            <div className="col-md-4">
              <input className="form-control mb-2" placeholder="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="col-md-4">
              <input className="form-control mb-2" type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="col-md-4">
              <input className="form-control mb-2" type="password" placeholder="Password *" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-success" onClick={addHR}>💾 Save HR Employee</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center mt-4"><div className="spinner-border text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-warning">No employees found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th><th>Full Name</th><th>Email</th>
                <th>Job Role</th><th>Responsibilities</th><th>Joined</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => {
                const meta = emp.employeeRole ? ROLE_META[emp.employeeRole] : null;
                return (
                  <tr key={emp._id}>
                    <td>{i + 1}</td>
                    <td><strong>{emp.fullName}</strong></td>
                    <td>{emp.email}</td>
                    <td>
                      {meta ? (
                        <span className="badge text-white px-2 py-1"
                          style={{ backgroundColor: meta.hex, fontSize: "0.82rem" }}>
                          {meta.icon} {emp.employeeRole}
                        </span>
                      ) : (
                        <span className="badge bg-secondary">Unassigned</span>
                      )}
                    </td>
                    <td><small className="text-muted">{meta ? meta.desc : "—"}</small></td>
                    <td>{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "—"}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteEmployee(emp._id)}>
                        🗑 Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}