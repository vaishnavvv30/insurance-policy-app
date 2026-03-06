import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  const cards = [
    { title: "Manage Policies",   desc: "Create, edit and delete insurance policies",    color: "bg-primary",          icon: "📋", path: "/manage-policies"       },
    { title: "Manage Employees",  desc: "Add, view and remove employee accounts",         color: "bg-success",          icon: "👔", path: "/employees"             },
    { title: "Manage Users",      desc: "View users, applications & claim forms",         color: "bg-dark",             icon: "👥", path: "/manage-users"          },
    { title: "System Report",     desc: "Monitor platform-wide statistics",               color: "bg-info text-dark",   icon: "📊", path: "/system-report"         },
    { title: "Announcements",     desc: "Post notices visible to all users on login",     color: "bg-warning text-dark",icon: "📢", path: "/admin/announcements"   }
  ];

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-1">Admin Dashboard</h2>
      <p className="text-center text-muted mb-4">
        Welcome, <strong>{user?.name || user?.email || "Admin"}</strong>
      </p>

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