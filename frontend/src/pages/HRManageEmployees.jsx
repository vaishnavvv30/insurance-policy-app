import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLE_META = {
  "Branch Manager":  { hex: "#343a40", icon: "🏢", desc: "Supervises branch operations, approves policy applications, oversees claim processing" },
  "Insurance Agent": { hex: "#0d6efd", icon: "🤝", desc: "Explains policies, assists clients with applications, helps submit claims" },
  "Claims Officer":  { hex: "#dc3545", icon: "⚖️",  desc: "Reviews claims, verifies documents, approves or rejects claims" },
  "Policy Officer":  { hex: "#198754", icon: "📋", desc: "Verifies applications, maintains policy records, assists with policy updates" }
};

const ALL_ROLES = Object.keys(ROLE_META);

export default function HRManageEmployees() {
  const navigate = useNavigate();
  const [employees,    setEmployees]    = useState([]);
  const [showForm,     setShowForm]     = useState(false);
  const [filterRole,   setFilterRole]   = useState("all");
  const [editRoleId,   setEditRoleId]   = useState(null);
  const [editRoleVal,  setEditRoleVal]  = useState("");

  // Add form
  const [fullName,     setFullName]     = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [employeeRole, setEmployeeRole] = useState("");

  /* ── FETCH ──────────────────────────────── */
  const fetchEmployees = async () => {
    try {
      const res  = await fetch("http://localhost:5000/hr/employees");
      const data = await res.json();
      setEmployees(data);
    } catch (e) { console.log(e); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  /* ── ADD EMPLOYEE ───────────────────────── */
  const addEmployee = async () => {
    if (!fullName || !email || !password || !employeeRole) {
      alert("Please fill all fields and select a role");
      return;
    }
    try {
      const res  = await fetch("http://localhost:5000/hr/add-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, employeeRole })
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      alert(data.message);
      setFullName(""); setEmail(""); setPassword(""); setEmployeeRole("");
      setShowForm(false);
      fetchEmployees();
    } catch (e) { alert("Error adding employee"); }
  };

  /* ── UPDATE ROLE ────────────────────────── */
  const saveRole = async (id) => {
    try {
      const res  = await fetch(`http://localhost:5000/hr/update-employee-role/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeRole: editRoleVal })
      });
      const data = await res.json();
      alert(data.message);
      setEditRoleId(null);
      fetchEmployees();
    } catch (e) { console.log(e); }
  };

  /* ── DELETE EMPLOYEE ────────────────────── */
  const deleteEmployee = async (id) => {
    if (!window.confirm("Remove this employee?")) return;
    try {
      await fetch(`http://localhost:5000/hr/delete-employee/${id}`, { method: "DELETE" });
      fetchEmployees();
    } catch (e) { console.log(e); }
  };

  const countByRole = (role) => employees.filter(e => e.employeeRole === role).length;
  const filtered = filterRole === "all" ? employees : employees.filter(e => e.employeeRole === filterRole);

  return (
    <div className="container mt-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>👥 Manage Employees</h2>
          <p className="text-muted mb-0">As HR, hire and manage Branch Managers, Agents, Officers</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "+ Hire Employee"}
          </button>
          <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Role summary cards */}
      <div className="row mb-4">
        {ALL_ROLES.map((role) => {
          const meta = ROLE_META[role];
          return (
            <div className="col-md-3 col-sm-6 mb-2" key={role}>
              <div
                className="card text-white text-center p-3"
                style={{
                  backgroundColor: meta.hex,
                  cursor: "pointer",
                  border: filterRole === role ? "3px solid #000" : "2px solid transparent",
                  transform: filterRole === role ? "scale(1.03)" : "scale(1)",
                  transition: "all 0.2s"
                }}
                onClick={() => setFilterRole(filterRole === role ? "all" : role)}
              >
                <div style={{ fontSize: 26 }}>{meta.icon}</div>
                <div className="fw-bold small mt-1">{role}</div>
                <div style={{ fontSize: 24, fontWeight: "bold" }}>{countByRole(role)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Employee Form */}
      {showForm && (
        <div className="card p-4 mb-4 shadow-sm border-primary">
          <h5 className="mb-3">➕ Hire New Employee</h5>
          <div className="row">
            <div className="col-md-6">
              <input className="form-control mb-2" placeholder="Full Name *"   value={fullName}  onChange={(e) => setFullName(e.target.value)} />
              <input className="form-control mb-2" type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="form-control mb-2" type="password" placeholder="Password *" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Job Role *</label>
              <select className="form-control mb-2" value={employeeRole} onChange={(e) => setEmployeeRole(e.target.value)}>
                <option value="">-- Select Role --</option>
                {ALL_ROLES.map(r => (
                  <option key={r} value={r}>{ROLE_META[r].icon} {r}</option>
                ))}
              </select>
              {employeeRole && (
                <div className="alert py-2 mt-2 small"
                  style={{ backgroundColor: ROLE_META[employeeRole].hex + "18", border: `1px solid ${ROLE_META[employeeRole].hex}` }}>
                  <strong>{ROLE_META[employeeRole].icon} {employeeRole}:</strong> {ROLE_META[employeeRole].desc}
                </div>
              )}
            </div>
          </div>
          <button className="btn btn-success mt-2" onClick={addEmployee}>💾 Save Employee</button>
        </div>
      )}

      {/* Employee Table */}
      {filtered.length === 0 ? (
        <div className="alert alert-info">
          No employees found{filterRole !== "all" ? ` with role: ${filterRole}` : ""}. Use <strong>+ Hire Employee</strong> to add staff.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th><th>Full Name</th><th>Email</th><th>Job Role</th>
                <th>Responsibilities</th><th>Joined</th><th>Actions</th>
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
                      {editRoleId === emp._id ? (
                        <div className="d-flex gap-1 align-items-center">
                          <select className="form-control form-control-sm" value={editRoleVal}
                            onChange={(e) => setEditRoleVal(e.target.value)}>
                            {ALL_ROLES.map(r => (
                              <option key={r} value={r}>{ROLE_META[r].icon} {r}</option>
                            ))}
                          </select>
                          <button className="btn btn-success btn-sm" onClick={() => saveRole(emp._id)}>✔</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditRoleId(null)}>✕</button>
                        </div>
                      ) : meta ? (
                        <span className="badge text-white px-2 py-1" style={{ backgroundColor: meta.hex, fontSize: "0.82rem" }}>
                          {meta.icon} {emp.employeeRole}
                        </span>
                      ) : (
                        <span className="badge bg-secondary">Unassigned</span>
                      )}
                    </td>
                    <td><small className="text-muted">{meta ? meta.desc : "—"}</small></td>
                    <td>{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "—"}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-warning btn-sm"
                          onClick={() => { setEditRoleId(emp._id); setEditRoleVal(emp.employeeRole || ""); }}>
                          ✏️ Role
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteEmployee(emp._id)}>
                          🗑 Remove
                        </button>
                      </div>
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