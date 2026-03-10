import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const formatPolicyName = (typeName) => {
  if (!typeName) return "—";
  const map = { housing: "Housing Insurance", health: "Health Insurance", vehicle: "Vehicle Insurance", life: "Life Insurance", travel: "Travel Insurance", retirement: "Retirement Plan", child: "Child Education Plan", business: "Business Insurance" };
  return map[typeName.toLowerCase()] || typeName.charAt(0).toUpperCase() + typeName.slice(1);
};

export default function PolicyOfficerDashboard() {
  const navigate = useNavigate();
  const [user,          setUser]          = useState(null);
  const [stats,         setStats]         = useState({ total: 0, thisMonth: 0, clients: 0 });
  const [recentApps,    setRecentApps]    = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedUser || loggedUser.employeeRole !== "Policy Officer") {
      navigate("/login");
    } else { setUser(loggedUser); }

    const fetchData = async () => {
      try {
        const [appsRes, usersRes, annRes] = await Promise.all([
          fetch("http://localhost:5000/admin/applications"),
          fetch("http://localhost:5000/admin/users"),
          fetch("http://localhost:5000/announcements")
        ]);
        const apps  = await appsRes.json();
        const users = await usersRes.json();
        const anns  = await annRes.json();

        const now       = new Date();
        const thisMonth = apps.filter(a => {
          const d = new Date(a.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        setStats({
          total:     apps.length,
          thisMonth: thisMonth.length,
          clients:   users.filter(u => u.role === "client").length
        });
        setRecentApps(apps.slice(0, 3));
        setAnnouncements(anns.slice(0, 2));
      } catch (e) { console.log(e); }
    };
    fetchData();
  }, [navigate]);

  if (!user) return null;

  const cards = [
    { title: "Insurance Policies",   desc: "View all available insurance policy types",      icon: "🗂️",  path: "/employee/po-insurance-policies",  border: "#198754" },
    { title: "Policy Applications",  desc: "Review and approve/reject client applications",  icon: "📝", path: "/employee/po-applications",         border: "#0d6efd" },
    { title: "View Clients",         desc: "Browse all registered client accounts",          icon: "👥", path: "/employee/clients",                 border: "#6f42c1" },
    { title: "Policy Reports",       desc: "Statistics and policy analytics",                icon: "📊", path: "/employee/policy-reports",          border: "#fd7e14" },
    { title: "Announcements",        desc: "Read notices and updates from Admin",            icon: "📢", path: "/employee/po-announcements",        border: "#ffc107" }
  ];

  return (
    <div className="container mt-4">

      <div className="text-center mb-4">
        <h2 className="mb-1">📋 Policy Officer Dashboard</h2>
        <p className="text-muted mb-2">Welcome, <strong>{user.fullName}</strong></p>
        <span className="badge px-3 py-2 text-white" style={{ backgroundColor: "#198754", fontSize: "0.95rem" }}>
          📋 Policy Officer
        </span>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="mb-4">
          <h6 className="text-muted mb-2">📢 Announcements</h6>
          {announcements.map(ann => (
            <div key={ann._id} className="alert alert-warning py-2 px-3 mb-2">
              <strong>{ann.title}:</strong> {ann.message}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="row mb-4">
        {[
          { label: "Total Applications", value: stats.total,     color: "#198754", icon: "📋" },
          { label: "This Month",         value: stats.thisMonth, color: "#0d6efd", icon: "📅" },
          { label: "Total Clients",      value: stats.clients,   color: "#6f42c1", icon: "👥" }
        ].map((s, i) => (
          <div className="col-md-4 mb-2" key={i}>
            <div className="card text-white text-center p-3" style={{ backgroundColor: s.color }}>
              <div style={{ fontSize: 26 }}>{s.icon}</div>
              <h3 className="mb-0 mt-1">{s.value}</h3>
              <small>{s.label}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Recent applications preview */}
      {recentApps.length > 0 && (
        <div className="card p-3 mb-4 shadow-sm">
          <h6 className="mb-2">🆕 Recent Policy Applications</h6>
          {recentApps.map(app => (
            <div key={app._id} className="d-flex justify-content-between align-items-center border-bottom py-2">
              <div>
                <strong>{app.firstName} {app.lastName}</strong>
                <span className="badge bg-info text-dark ms-2">{formatPolicyName(app.policyTypeName)}</span>
              </div>
              <small className="text-muted">{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"}</small>
            </div>
          ))}
          <button className="btn btn-sm btn-outline-success mt-2"
            onClick={() => navigate("/employee/po-applications")}>
            Review Applications →
          </button>
        </div>
      )}

      {/* Feature cards */}
      <div className="row justify-content-center">
        {cards.map((card, i) => (
          <div className="col-md-4 mb-3" key={i}>
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