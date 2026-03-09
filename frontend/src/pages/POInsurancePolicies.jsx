import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function POInsurancePolicies() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res  = await fetch("http://localhost:5000/admin/policies");
        const data = await res.json();
        setPolicies(data);
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetchPolicies();
  }, []);

  const filtered = policies.filter(p =>
    !search ||
    (p.policyName || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.coverage   || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>🗂️ Insurance Policies</h2>
          <p className="text-muted mb-0">All available insurance policy types on the platform</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>
          ← Dashboard
        </button>
      </div>

      <input
        className="form-control mb-3"
        placeholder="🔍 Search by policy name or coverage..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="mb-3">
        <span className="badge bg-success me-2">Total Policies: {policies.length}</span>
        {search && <span className="badge bg-secondary">Showing: {filtered.length}</span>}
      </div>

      {loading ? (
        <div className="text-center mt-5"><div className="spinner-border text-success" /></div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-info">No policies found.</div>
      ) : (
        <div className="row">
          {filtered.map((policy, i) => (
            <div className="col-md-4 mb-3" key={policy._id || i}>
              <div className="card shadow h-100 p-3" style={{ borderTop: "4px solid #198754" }}>
                <h5 className="mb-2">{policy.policyName || policy.title}</h5>
                {policy.description && (
                  <p className="text-muted small mb-2">{policy.description}</p>
                )}
                <table className="table table-sm table-borderless mb-0">
                  <tbody>
                    {policy.coverage && (
                      <tr>
                        <td className="text-muted fw-semibold" style={{ width: 110 }}>Coverage:</td>
                        <td>{policy.coverage}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="text-muted fw-semibold">Premium:</td>
                      <td>₹{policy.premiumAmount}</td>
                    </tr>
                    {policy.duration && (
                      <tr>
                        <td className="text-muted fw-semibold">Duration:</td>
                        <td>{policy.duration}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <span className="badge bg-success mt-2 align-self-start">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}