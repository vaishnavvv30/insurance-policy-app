import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeProcessClaims() {

  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClaims = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/claims");
      const data = await res.json();
      setClaims(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  /* ===============================
     UPDATE CLAIM STATUS
  ================================= */

  const updateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/admin/update-claim/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      alert(`Claim ${status} successfully!`);
      fetchClaims();
    } catch (error) {
      console.log(error);
      alert("Error updating claim");
    }
  };

  // Filter claims
  const filtered = claims.filter((claim) => {
    const matchStatus = filterStatus === "all" || claim.status === filterStatus;
    const matchSearch =
      claim.policyId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claimType?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Count by status
  const pendingCount  = claims.filter(c => c.status === "Pending").length;
  const approvedCount = claims.filter(c => c.status === "Approved").length;
  const rejectedCount = claims.filter(c => c.status === "Rejected").length;

  return (
    <div className="container mt-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Process Claims</h2>
          <p className="text-muted mb-0">Review and action insurance claims</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-warning text-white text-center p-3">
            <h3>{pendingCount}</h3>
            <p className="mb-0">Pending</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white text-center p-3">
            <h3>{approvedCount}</h3>
            <p className="mb-0">Approved</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-danger text-white text-center p-3">
            <h3>{rejectedCount}</h3>
            <p className="mb-0">Rejected</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input
          className="form-control"
          style={{ maxWidth: 280 }}
          placeholder="Search by policy ID or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {["all", "Pending", "Approved", "Rejected"].map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${filterStatus === s ? "btn-dark" : "btn-outline-secondary"}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {/* Claims Table */}
      {filtered.length === 0 ? (
        <div className="alert alert-info">No claims found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Policy ID</th>
                <th>Claim Type</th>
                <th>Incident Date</th>
                <th>Amount (₹)</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((claim, index) => (
                <tr key={claim._id}>
                  <td>{index + 1}</td>
                  <td>
                    <span className="badge bg-secondary">{claim.policyId}</span>
                  </td>
                  <td>{claim.claimType}</td>
                  <td>{new Date(claim.incidentDate).toLocaleDateString()}</td>
                  <td>₹{claim.claimAmount}</td>
                  <td style={{ maxWidth: 200, wordBreak: "break-word" }}>
                    {claim.description}
                  </td>
                  <td>
                    <span className={`badge ${
                      claim.status === "Approved" ? "bg-success" :
                      claim.status === "Rejected" ? "bg-danger" : "bg-warning"
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                  <td>
                    {claim.status === "Pending" ? (
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => updateStatus(claim._id, "Approved")}
                        >
                          ✔ Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => updateStatus(claim._id, "Rejected")}
                        >
                          ✘ Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted small">Reviewed</span>
                    )}
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