import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InsuranceAgentDashboard() {
  const navigate = useNavigate();
  const [user,       setUser]       = useState(null);
  const [stats,      setStats]      = useState({ clients: 0, applications: 0, newThisWeek: 0 });
  const [recentClients, setRecentClients] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedUser || loggedUser.employeeRole !== "Insurance Agent") {
      navigate("/login");
    } else { setUser(loggedUser); }

    const fetchData = async () => {
      try {
        const [usersRes, appsRes] = await Promise.all([
          fetch("http://localhost:5000/admin/users"),
          fetch("http://localhost:5000/admin/applications")
        ]);
        const users = await usersRes.json();
        const apps  = await appsRes.json();
        const clients = users.filter(u => u.role === "client");

        const now       = new Date();
        const weekAgo   = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const newThisWeek = clients.filter(c => new Date(c.createdAt) > weekAgo).length;

        setStats({ clients: clients.length, applications: apps.length, newThisWeek });
        setRecentClients(clients.slice(0, 4));
      } catch (e) { console.log(e); }
    };
    fetchData();
  }, [navigate]);

  // Poll unread chat count
  useEffect(() => {
    if (!user?.email) return;
    const checkUnread = async () => {
      try {
        const res  = await fetch(`http://localhost:5000/chat/unread/${encodeURIComponent(user.email)}`);
        const data = await res.json();
        setUnreadCount(data.unread || 0);
      } catch (e) { console.log(e); }
    };
    checkUnread();
    const t = setInterval(checkUnread, 6000);
    return () => clearInterval(t);
  }, [user]);

  if (!user) return null;

  const cards = [
    { title: "Browse Policies",    desc: "View all available insurance policy types",     icon: "📋", path: "/policies",               border: "#0d6efd" },
    { title: "View Clients",       desc: "Browse registered client accounts",             icon: "👥", path: "/employee/clients",        border: "#6f42c1" },
    { title: "New Applications",   desc: "See latest policy applications",                icon: "📝", path: "/employee/agent-applications", border: "#198754" },
    { title: "Client Assistance",  desc: "Look up client profiles and their policies",   icon: "🤝", path: "/employee/client-assistance",  border: "#fd7e14" },
    {
      title: unreadCount > 0 ? `Chat with Clients 🔴${unreadCount}` : "Chat with Clients",
      desc:  unreadCount > 0 ? `${unreadCount} new message(s) waiting` : "Reply to client queries",
      icon:  "💬",
      path:  "/employee/agent-chat",
      border: unreadCount > 0 ? "#dc3545" : "#0dcaf0"
    },
    { title: "Announcements",      desc: "Read notices and updates from Admin",          icon: "📢", path: "/employee/agent-announcements", border: "#ffc107" }
  ];

  return (
    <div className="container mt-4">

      <div className="text-center mb-4">
        <h2 className="mb-1">🤝 Insurance Agent Dashboard</h2>
        <p className="text-muted mb-2">Welcome, <strong>{user.fullName}</strong></p>
        <span className="badge px-3 py-2 text-white" style={{ backgroundColor: "#0d6efd", fontSize: "0.95rem" }}>
          🤝 Insurance Agent
        </span>
      </div>

      <div className="alert py-2 mb-4" style={{ backgroundColor: "#0d6efd18", border: "1px solid #0d6efd" }}>
        <strong>Your Responsibilities:</strong> Assist clients with policy applications, explain policies, help with claims, and respond to client queries via chat.
      </div>

      {/* Stats */}
      <div className="row mb-4">
        {[
          { label: "Total Clients",   value: stats.clients,      color: "#0d6efd", icon: "👥" },
          { label: "Applications",    value: stats.applications, color: "#198754", icon: "📝" },
          { label: "New This Week",   value: stats.newThisWeek,  color: "#6f42c1", icon: "🆕" },
          { label: "Unread Messages", value: unreadCount,        color: unreadCount > 0 ? "#dc3545" : "#6c757d", icon: "💬" }
        ].map((s, i) => (
          <div className="col-md-3 col-6 mb-2" key={i}>
            <div className="card text-white text-center p-3" style={{ backgroundColor: s.color }}>
              <div style={{ fontSize: 24 }}>{s.icon}</div>
              <h3 className="mb-0 mt-1">{s.value}</h3>
              <small>{s.label}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Recent clients preview */}
      {recentClients.length > 0 && (
        <div className="card p-3 mb-4 shadow-sm">
          <h6 className="mb-2">👥 Recently Joined Clients</h6>
          {recentClients.map(c => (
            <div key={c._id} className="d-flex justify-content-between align-items-center border-bottom py-2">
              <div>
                <strong>{c.fullName}</strong>
                <span className="text-muted ms-2" style={{ fontSize: 12 }}>{c.email}</span>
              </div>
              <small className="text-muted">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</small>
            </div>
          ))}
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