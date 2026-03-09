import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ClaimsHistory() {
  const navigate = useNavigate();
  const [claims,  setClaims]  = useState([]);
  const [filter,  setFilter]  = useState("all");
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res  = await fetch("http://localhost:5000/admin/claims");
        const data = await res.json();
        setClaims(data);
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetchClaims();
  }, []);

  const filtered = claims.filter(c => {
    const matchStatus = filter === "all" || c.status === filter;
    const matchSearch = !search ||
      c.policyId?.toLowerCase().includes(search.toLowerCase()) ||
      c.claimType?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>📂 Claims History</h2>
          <p className="text-muted mb-0">All insurance claims — reviewed and pending</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>← Dashboard</button>
      </div>

      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input className="form-control" style={{ maxWidth: 280 }} placeholder="🔍 Search policy ID or type..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {["all", "Pending", "Approved", "Rejected"].map(s => (
          <button key={s}
            className={`btn btn-sm ${filter === s ? "btn-dark" : "btn-outline-secondary"}`}
            onClick={() => setFilter(s)}>
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      <div className="mb-2">
        <span className="badge bg-primary me-2">Total: {claims.length}</span>
        <span className="badge bg-secondary">Showing: {filtered.length}</span>
      </div>

      {loading ? (
        <div className="text-center mt-4"><div className="spinner-border text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-info">No claims found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr><th>#</th><th>Policy ID</th><th>Claim Type</th><th>Incident Date</th><th>Amount (₹)</th><th>Description</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((claim, i) => (
                <tr key={claim._id}>
                  <td>{i + 1}</td>
                  <td><span className="badge bg-secondary">{claim.policyId}</span></td>
                  <td>{claim.claimType}</td>
                  <td>{new Date(claim.incidentDate).toLocaleDateString()}</td>
                  <td>₹{claim.claimAmount}</td>
                  <td style={{ maxWidth: 180, wordBreak: "break-word" }}>{claim.description}</td>
                  <td>
                    <span className={`badge ${claim.status === "Approved" ? "bg-success" : claim.status === "Rejected" ? "bg-danger" : "bg-warning"}`}>
                      {claim.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}