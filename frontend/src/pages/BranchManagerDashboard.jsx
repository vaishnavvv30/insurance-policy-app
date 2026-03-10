import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BranchManagerDashboard() {
  const navigate = useNavigate();
  const [user,          setUser]          = useState(null);
  const [stats,         setStats]         = useState({ applications: 0, pending: 0, approved: 0, clients: 0 });
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedUser || loggedUser.employeeRole !== "Branch Manager") {
      navigate("/login");
    } else { setUser(loggedUser); }

    const fetchData = async () => {
      try {
        const [claimsRes, appsRes, usersRes, annRes] = await Promise.all([
          fetch("http://localhost:5000/admin/claims"),
          fetch("http://localhost:5000/admin/applications"),
          fetch("http://localhost:5000/admin/users"),
          fetch("http://localhost:5000/announcements")
        ]);
        const claims = await claimsRes.json();
        const apps   = await appsRes.json();
        const users  = await usersRes.json();
        const anns   = await annRes.json();
        setStats({
          applications: apps.length,
          pending:      claims.filter(c => c.status === "Pending").length,
          approved:     claims.filter(c => c.status === "Approved").length,
          clients:      users.filter(u => u.role === "client").length
        });
        setAnnouncements(anns.slice(0, 3));
      } catch (e) { console.log(e); }
    };
    fetchData();
  }, [navigate]);

  if (!user) return null;

  const cards = [
    { title: "View Clients",       desc: "See all registered client accounts",              icon: "👥", path: "/employee/clients",          border: "#6f42c1" },
    { title: "Team Overview",      desc: "View your team members and their roles",          icon: "👔", path: "/employee/team-overview",    border: "#343a40" },
    { title: "Statistics",         desc: "View claims, policies & performance metrics",     icon: "📊", path: "/employee/statistics",       border: "#fd7e14" },
    { title: "Post Announcement",  desc: "Post notices visible to all staff and clients",  icon: "📢", path: "/employee/bm-announcements", border: "#ffc107" },
    { title: "Chat with Clients",  desc: "Message clients directly via the chat panel",    icon: "💬", path: "/employee/agent-chat",       border: "#0d6efd" }
  ];

  return (
    <div className="container mt-4">

      <div className="text-center mb-4">
        <h2 className="mb-1">🏢 Branch Manager Dashboard</h2>
        <p className="text-muted mb-2">Welcome, <strong>{user.fullName}</strong></p>
        <span className="badge px-3 py-2 text-white" style={{ backgroundColor: "#343a40", fontSize: "0.95rem" }}>
          🏢 Branch Manager
        </span>
      </div>

      {announcements.length > 0 && (
        <div className="mb-4">
          <h6 className="text-muted mb-2">📢 Latest Announcements</h6>
          {announcements.map(ann => (
            <div key={ann._id} className="alert alert-warning py-2 px-3 mb-2">
              <strong>{ann.title}:</strong> {ann.message}
            </div>
          ))}
        </div>
      )}

      <div className="row mb-4">
        {[
          { label: "Total Clients",   value: stats.clients,      color: "#0d6efd", icon: "👥" },
          { label: "Applications",    value: stats.applications, color: "#6f42c1", icon: "📋" },
          { label: "Pending Claims",  value: stats.pending,      color: "#fd7e14", icon: "⏳" },
          { label: "Approved Claims", value: stats.approved,     color: "#198754", icon: "✅" }
        ].map((s, i) => (
          <div className="col-md-3 col-6 mb-2" key={i}>
            <div className="card text-white text-center p-3" style={{ backgroundColor: s.color }}>
              <div style={{ fontSize: 26 }}>{s.icon}</div>
              <h3 className="mb-0 mt-1">{s.value}</h3>
              <small>{s.label}</small>
            </div>
          </div>
        ))}
      </div>

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