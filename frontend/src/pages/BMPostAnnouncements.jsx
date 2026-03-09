import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BMPostAnnouncements() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [title,   setTitle]   = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const res  = await fetch("http://localhost:5000/announcements");
      const data = await res.json();
      setAnnouncements(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const postAnnouncement = async () => {
    if (!title || !message) { alert("Please fill in both fields"); return; }
    try {
      const res = await fetch("http://localhost:5000/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message })
      });
      if (!res.ok) { alert("Failed to post announcement"); return; }
      setTitle(""); setMessage("");
      fetchAnnouncements();
    } catch (e) { console.log(e); }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await fetch(`http://localhost:5000/announcements/${id}`, { method: "DELETE" });
      fetchAnnouncements();
    } catch (e) { console.log(e); }
  };

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>📢 Announcements</h2>
          <p className="text-muted mb-0">Post notices visible to clients and all staff</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>
          ← Dashboard
        </button>
      </div>

      {/* Post form */}
      <div className="card p-4 mb-4 shadow-sm" style={{ borderLeft: "4px solid #ffc107" }}>
        <h5 className="mb-3">➕ Post New Announcement</h5>
        <input
          className="form-control mb-2"
          placeholder="Title *"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="form-control mb-3"
          placeholder="Message *"
          rows={3}
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button className="btn btn-warning" onClick={postAnnouncement}>
          📢 Post Announcement
        </button>
      </div>

      {/* Announcements list */}
      <h5 className="mb-3">All Announcements ({announcements.length})</h5>

      {loading ? (
        <div className="text-center mt-4"><div className="spinner-border text-warning" /></div>
      ) : announcements.length === 0 ? (
        <div className="alert alert-info">No announcements posted yet.</div>
      ) : (
        announcements.map(ann => (
          <div key={ann._id} className="card mb-3 p-3 border-start border-warning border-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6 className="mb-1">{ann.title}</h6>
                <p className="mb-1 text-muted">{ann.message}</p>
                <small className="text-muted">
                  {new Date(ann.createdAt).toLocaleDateString()} {new Date(ann.createdAt).toLocaleTimeString()}
                </small>
              </div>
              <button className="btn btn-danger btn-sm ms-3"
                onClick={() => deleteAnnouncement(ann._id)}>
                🗑 Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}