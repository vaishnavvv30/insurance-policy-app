import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const formatPolicyName = (typeName) => {
  if (!typeName) return "—";
  const map = {
    housing:    "Housing Insurance",
    health:     "Health Insurance",
    vehicle:    "Vehicle Insurance",
    life:       "Life Insurance",
    travel:     "Travel Insurance",
    retirement: "Retirement & Pension Plan",
    child:      "Child Education Plan",
    business:   "Business Insurance"
  };
  return map[typeName.toLowerCase()] || typeName.charAt(0).toUpperCase() + typeName.slice(1);
};

export default function MyPolicies() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) { navigate("/login"); return; }

    const fetchPolicies = async () => {
      try {
        const res  = await fetch(`http://localhost:5000/my-policies/${user.email}`);
        const data = await res.json();
        setPolicies(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, [navigate]);

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>🗂️ My Policies</h2>
          <p className="text-muted mb-0">Your applied insurance policies</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/client")}>
          ← Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading your policies...</p>
        </div>
      ) : policies.length === 0 ? (
        <div className="text-center mt-5">
          <p className="text-muted mb-3">You haven't applied for any policies yet.</p>
          <button className="btn btn-primary" onClick={() => navigate("/policies")}>
            Browse Policies
          </button>
        </div>
      ) : (
        <div className="row">
          {policies.map((policy) => (
            <div className="col-md-6 mb-3" key={policy._id}>
              <div className="card shadow p-3 h-100" style={{ borderLeft: "4px solid #0d6efd" }}>
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="mb-1">{formatPolicyName(policy.policyTypeName)}</h5>
                  <span className="badge bg-success">Active</span>
                </div>
                <p className="text-muted small mb-2">
                  Policy ID: <span className="badge bg-secondary">{policy.policyId}</span>
                </p>
                <table className="table table-sm table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="text-muted">Name:</td>
                      <td>{policy.firstName} {policy.lastName}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Annual Income:</td>
                      <td>₹{policy.annualIncome}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Nominee:</td>
                      <td>{policy.nomineeName} ({policy.nomineeRelation})</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Applied:</td>
                      <td>{policy.createdAt ? new Date(policy.createdAt).toLocaleDateString() : "—"}</td>
                    </tr>
                  </tbody>
                </table>
                <button
                  className="btn btn-sm btn-outline-primary mt-2"
                  onClick={() => navigate("/submit-claim")}
                >
                  Submit Claim for this Policy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}