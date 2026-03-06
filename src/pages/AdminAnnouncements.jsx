import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminAnnouncements() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [title,   setTitle]   = useState("");
  const [message, setMessage] = useState("");

  const fetchAnnouncements = async () => {
    try {
      const res  = await fetch("http://localhost:5000/announcements");
      const data = await res.json();
      setAnnouncements(data);
    } catch (error) { console.log(error); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const addAnnouncement = async () => {
    if (!title || !message) { alert("Please fill in both fields"); return; }
    try {
      await fetch("http://localhost:5000/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message })
      });
      setTitle(""); setMessage("");
      fetchAnnouncements();
    } catch (error) { console.log(error); }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await fetch(`http://localhost:5000/announcements/${id}`, { method: "DELETE" });
      fetchAnnouncements();
    } catch (error) { console.log(error); }
  };

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>📢 Announcements</h2>
          <p className="text-muted mb-0">Post notices visible to clients on their dashboard</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/admin")}>
          ← Back to Dashboard
        </button>
      </div>

      {/* ADD FORM */}
      <div className="card p-3 mb-4 shadow-sm">
        <h5 className="mb-3">Post New Announcement</h5>
        <input
          className="form-control mb-2"
          placeholder="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="form-control mb-2"
          placeholder="Message *"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="btn btn-warning" onClick={addAnnouncement}>
          📢 Post Announcement
        </button>
      </div>

      {/* LIST */}
      {announcements.length === 0 ? (
        <div className="alert alert-info">No announcements posted yet.</div>
      ) : (
        announcements.map((ann) => (
          <div key={ann._id} className="card mb-3 p-3 border-start border-warning border-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6 className="mb-1">{ann.title}</h6>
                <p className="mb-1 text-muted">{ann.message}</p>
                <small className="text-muted">
                  {new Date(ann.createdAt).toLocaleDateString()} {new Date(ann.createdAt).toLocaleTimeString()}
                </small>
              </div>
              <button className="btn btn-danger btn-sm ms-3" onClick={() => deleteAnnouncement(ann._id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}