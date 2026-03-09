import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HRDashboard() {
  const navigate = useNavigate();
  const [user,          setUser]          = useState(null);
  const [staffCount,    setStaffCount]    = useState({ total: 0, byRole: {} });
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedUser || loggedUser.role !== "employee" || loggedUser.employeeRole !== "HR") {
      navigate("/login");
    } else {
      setUser(loggedUser);
    }

    const fetchData = async () => {
      try {
        const [empRes, annRes] = await Promise.all([
          fetch("http://localhost:5000/hr/employees"),
          fetch("http://localhost:5000/announcements")
        ]);
        const empData = await empRes.json();
        const annData = await annRes.json();

        const byRole = {};
        empData.forEach(e => { byRole[e.employeeRole] = (byRole[e.employeeRole] || 0) + 1; });
        setStaffCount({ total: empData.length, byRole });
        setAnnouncements(annData.slice(0, 3));
      } catch (e) { console.log(e); }
    };
    fetchData();
  }, [navigate]);

  if (!user) return null;

  const cards = [
    { title: "Manage Employees", desc: "Hire Branch Managers, Agents, Claims & Policy Officers", icon: "👥", path: "/employee/hr-manage",       border: "#6f42c1" },
    { title: "Employee Directory",desc: "View all staff records and contact info",               icon: "📒", path: "/employee/hr-directory",    border: "#0d6efd" },
    { title: "HR Reports",        desc: "View hiring activity and staff statistics",             icon: "📊", path: "/employee/hr-reports",      border: "#fd7e14" },
    { title: "Announcements",     desc: "Read notices from Admin",                              icon: "📢", path: "/employee/hr-announcements", border: "#ffc107" }
  ];

  const roleColors = {
    "Branch Manager":  "#343a40",
    "Insurance Agent": "#0d6efd",
    "Claims Officer":  "#dc3545",
    "Policy Officer":  "#198754"
  };

  return (
    <div className="container mt-4">

      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="mb-1">🧑‍💼 HR Dashboard</h2>
        <p className="text-muted mb-2">Welcome, <strong>{user.fullName}</strong></p>
        <span className="badge px-3 py-2 text-white" style={{ backgroundColor: "#6f42c1", fontSize: "0.95rem" }}>
          🧑‍💼 Human Resources
        </span>
      </div>

      {/* Responsibility banner */}
      <div className="alert py-2 mb-4 text-center"
        style={{ backgroundColor: "#6f42c115", border: "1px solid #6f42c1" }}>
        <strong>Your Responsibilities:</strong> Hire employees, maintain employee records, and assign job roles within the organisation.
      </div>

      {/* Announcements from Admin */}
      {announcements.length > 0 && (
        <div className="mb-4">
          <h6 className="text-muted mb-2">📢 Latest Announcements from Admin</h6>
          {announcements.map(ann => (
            <div key={ann._id} className="alert alert-warning py-2 px-3 mb-2">
              <strong>{ann.title}:</strong> {ann.message}
            </div>
          ))}
        </div>
      )}

      {/* Staff stats */}
      <div className="row mb-4">
        <div className="col-md-3 col-6 mb-2">
          <div className="card text-white text-center p-3" style={{ backgroundColor: "#6f42c1" }}>
            <h3 className="mb-0">{staffCount.total}</h3>
            <small>Total Staff Hired</small>
          </div>
        </div>
        {Object.entries(roleColors).map(([role, color]) => (
          <div className="col-md-3 col-6 mb-2" key={role}>
            <div className="card text-white text-center p-3" style={{ backgroundColor: color }}>
              <h3 className="mb-0">{staffCount.byRole[role] || 0}</h3>
              <small>{role}s</small>
            </div>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div className="row justify-content-center">
        {cards.map((card, i) => (
          <div className="col-md-6 mb-3" key={i}>
            <div className="card shadow p-4 text-center h-100"
              style={{ cursor: "pointer", borderTop: `4px solid ${card.border}` }}
              onClick={() => navigate(card.path)}>
              <div style={{ fontSize: 36 }}>{card.icon}</div>
              <h5 className="mt-2">{card.title}</h5>
              <p className="text-muted mb-0">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}