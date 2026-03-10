import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const [stats, setStats] = useState({ totalEmployees: 0, totalPolicies: 0, totalClaims: 0, totalUsers: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [empRes, reportRes] = await Promise.all([
          fetch("http://localhost:5000/admin/all-employees"),
          fetch("http://localhost:5000/admin/system-report")
        ]);
        const empData    = await empRes.json();
        const reportData = await reportRes.json();
        setStats({
          totalEmployees: empData.length,
          totalPolicies:  reportData.totalPolicies,
          totalClaims:    reportData.totalClaims,
          totalUsers:     reportData.totalUsers
        });
      } catch (e) { console.log(e); }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Manage Employees", 
      desc: "View, hire HR staff and oversee all employees",    color: "bg-success",        icon: "👔", path: "/employees"         },
    { title: "Manage Policies",  desc: "Create, edit and remove insurance policies",       color: "bg-primary",        icon: "🗂️",  path: "/admin/policies"    },
    { title: "System Report",    desc: "Monitor platform-wide statistics and activity",    color: "bg-info text-dark", icon: "📊", path: "/system-report"      },
    { title: "Audit Log",        desc: "Track all system activities and changes",          color: "bg-danger",           icon: "🔍", path: "/admin/audit-log"   },
    { title: "System Settings",  desc: "Configure platform preferences and access",        color: "bg-secondary",      icon: "⚙️",  path: "/admin/settings"    }
  ];

  const statCards = [
    { label: "Total Employees", value: stats.totalEmployees, color: "#0d6efd", icon: "👔" },
    { label: "Total Users",     value: stats.totalUsers,     color: "#198754", icon: "👥" },
    { label: "Total Policies",  value: stats.totalPolicies,  color: "#6f42c1", icon: "📋" },
    { label: "Total Claims",    value: stats.totalClaims,    color: "#dc3545", icon: "⚖️"  }
  ];

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-1">⚙️ Admin Dashboard</h2>
      <p className="text-center text-muted mb-4">
        Welcome, <strong>{user?.name || user?.email || "Admin"}</strong>
      </p>

      {/* Live Stats Bar */}
      <div className="row mb-4">
        {statCards.map((s, i) => (
          <div className="col-md-3 col-6 mb-2" key={i}>
            <div className="card text-white text-center p-3" style={{ backgroundColor: s.color }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <h3 className="mb-0 mt-1">{s.value ?? "—"}</h3>
              <small>{s.label}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="row justify-content-center">
        {cards.map((card, i) => (
          <div className="col-md-4 mb-3" key={i}>
            <div
              className={`card ${card.color} h-100`}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(card.path)}
            >
              <div className="card-body text-center py-4">
                <div style={{ fontSize: 40 }}>{card.icon}</div>
                <h5 className="mt-2 mb-1">{card.title}</h5>
                <p className="mb-0 small">{card.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}