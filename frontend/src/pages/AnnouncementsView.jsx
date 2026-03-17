import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AnnouncementsView() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res  = await fetch("http://localhost:5000/announcements?audience=employees");
        const data = await res.json();
        setAnnouncements(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>📢 Announcements</h2>
          <p className="text-muted mb-0">Notices posted by Admin</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>
          ← Back to Dashboard
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="alert alert-info">No announcements posted yet.</div>
      ) : (
        announcements.map((ann) => (
          <div key={ann._id} className="card mb-3 p-3 border-start border-warning border-3">
            <h6 className="mb-1">{ann.title}</h6>
            <p className="mb-1 text-muted">{ann.message}</p>
            <small className="text-muted">
              {new Date(ann.createdAt).toLocaleDateString()}{" "}
              {new Date(ann.createdAt).toLocaleTimeString()}
            </small>
          </div>
        ))
      )}
    </div>
  );
}