import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const isMongoId = (s) => /^[a-f0-9]{24}$/i.test((s || "").trim());

const formatPolicyName = (typeName, resolvedName) => {
  if (!typeName) return "—";
  // If it looks like a MongoDB _id, use the resolved name if available
  if (isMongoId(typeName)) return resolvedName || "Insurance Policy";
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

  const [policyNameMap, setPolicyNameMap] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) { navigate("/login"); return; }

    const fetchPolicies = async () => {
      try {
        const [appRes, polRes] = await Promise.all([
          fetch(`http://localhost:5000/my-policies/${user.email}`),
          fetch("http://localhost:5000/admin/policies")
        ]);
        const data    = await appRes.json();
        const polData = await polRes.json();
        // Build a map of _id -> policyName for admin-created policies
        const nameMap = {};
        polData.forEach(p => { if (p._id && p.policyName) nameMap[p._id] = p.policyName; });
        setPolicyNameMap(nameMap);
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
          {policies.map((policy) => {

            const isApproved  = policy.status === "Approved";
            const isPaid      = policy.paymentStatus === "Successful";

            return (
              <div className="col-md-6 mb-3" key={policy._id}>
                <div className="card shadow p-3 h-100" style={{ borderLeft: `4px solid ${isApproved ? "#0d6efd" : "#adb5bd"}` }}>

                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0">{formatPolicyName(policy.policyTypeName, policyNameMap[policy.policyTypeName])}</h5>
                    <span className={`badge ${isApproved ? "bg-success" : policy.status === "Rejected" ? "bg-danger" : "bg-warning text-dark"}`}>
                      {policy.status || "Pending"}
                    </span>
                  </div>

                  <p className="text-muted small mb-2">
                    Policy ID: <span className="badge bg-secondary">{policy.policyId}</span>
                  </p>

                  {/* Policy details */}
                  <table className="table table-sm table-borderless mb-2">
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

                  {/* Payment status — only show after approval */}
                  {isApproved && (
                    <div className={`d-flex align-items-center gap-2 px-3 py-2 rounded mb-2`}
                      style={{ backgroundColor: isPaid ? "#d1e7dd" : "#fff3cd" }}>
                      <span style={{ fontSize: 18 }}>{isPaid ? "✅" : "⏳"}</span>
                      <div>
                        <strong style={{ fontSize: 13 }}>Payment:</strong>{" "}
                        <span className={`badge ${isPaid ? "bg-success" : "bg-warning text-dark"}`}>
                          {isPaid ? "Successful" : "Pending"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="d-flex flex-column gap-2 mt-1">

                    {/* Pay Now — only if approved and not yet paid */}
                    {isApproved && !isPaid && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => navigate(`/payment/${policy._id}`)}
                      >
                        💳 Pay Now
                      </button>
                    )}

                    {/* Submit Claim — only if approved and paid */}
                    {isApproved && isPaid && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate("/submit-claim")}
                      >
                        Submit Claim for this Policy
                      </button>
                    )}

                    {/* Not approved yet */}
                    {!isApproved && policy.status !== "Rejected" && (
                      <p className="text-muted small mb-0">
                        ⏳ Awaiting approval before payment can be made.
                      </p>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}