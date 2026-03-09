import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [user,          setUser]          = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedUser || loggedUser.role !== "client") {
      navigate("/login");
    } else {
      setUser(loggedUser);
    }

    const fetchAnnouncements = async () => {
      try {
        const res  = await fetch("http://localhost:5000/announcements");
        const data = await res.json();
        setAnnouncements(data.slice(0, 3));
      } catch (error) { console.log(error); }
    };
    fetchAnnouncements();
  }, [navigate]);

  if (!user) return null;

  const cards = [
    { title: "View Policies",    desc: "Browse available insurance policies",      icon: "📋", path: "/policies",           border: "#0d6efd" },
    { title: "My Policies",      desc: "View your active applied policies",         icon: "🗂️",  path: "/my-policies",        border: "#6f42c1" },
    { title: "Submit Claim",     desc: "Submit an insurance claim easily",          icon: "📝", path: "/submit-claim",       border: "#198754" },
    { title: "Track Claims",     desc: "Track the status of your claims",           icon: "🔍", path: "/track-claims",       border: "#fd7e14" },
    { title: "Premium Calc",     desc: "Estimate your annual premium cost",         icon: "🧮", path: "/premium-calculator", border: "#dc3545" },
    { title: "Chat with Agent",  desc: "Get help from an insurance agent instantly",icon: "💬", path: "/client-chat",        border: "#0dcaf0" }
  ];

  return (
    <div className="container mt-4">

      <h2 className="text-center mb-1">Welcome, <strong>{user.fullName}</strong> 👋</h2>
      <p className="text-center text-muted mb-4">Your Insurance Dashboard</p>

      {/* ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <div className="mb-4">
          <h6 className="text-muted mb-2">📢 Announcements</h6>
          {announcements.map((ann) => (
            <div key={ann._id} className="alert alert-warning py-2 px-3 mb-2">
              <strong>{ann.title}:</strong> {ann.message}
            </div>
          ))}
        </div>
      )}

      {/* FEATURE CARDS */}
      <div className="row justify-content-center">
        {cards.map((card, i) => (
          <div className="col-md-4 mb-3" key={i}>
            <div
              className="card shadow p-4 text-center h-100"
              style={{ cursor: "pointer", borderTop: `4px solid ${card.border}` }}
              onClick={() => navigate(card.path)}
            >
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