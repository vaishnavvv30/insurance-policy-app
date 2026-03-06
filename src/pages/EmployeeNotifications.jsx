import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* Helper: turn "housing" → "Housing Insurance" */
const formatPolicyName = (typeName) => {
  if (!typeName) return null;
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

export default function EmployeeNotifications() {
  const navigate = useNavigate();
  const [pendingClaims, setPendingClaims] = useState([]);
  const [recentApps,    setRecentApps]    = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [claimsRes, appsRes] = await Promise.all([
          fetch("http://localhost:5000/admin/claims"),
          fetch("http://localhost:5000/admin/applications")
        ]);
        const claims = await claimsRes.json();
        const apps   = await appsRes.json();

        setPendingClaims(claims.filter((c) => c.status === "Pending"));

        // Applications submitted in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        setRecentApps(apps.filter((a) => new Date(a.createdAt) > sevenDaysAgo));
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Notifications</h2>
          <p className="text-muted mb-0">Pending tasks and recent activity</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>
          ← Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <>
          {/* Alert banner */}
          {pendingClaims.length > 0 ? (
            <div className="alert alert-warning d-flex justify-content-between align-items-center">
              <span>⚠️ <strong>{pendingClaims.length} claim(s)</strong> are waiting for your review.</span>
              <button className="btn btn-sm btn-warning" onClick={() => navigate("/employee/process-claims")}>
                Review Now →
              </button>
            </div>
          ) : (
            <div className="alert alert-success">✅ No pending claims. You're all caught up!</div>
          )}

          {/* PENDING CLAIMS */}
          <h5 className="mt-4 mb-3">🕐 Pending Claims ({pendingClaims.length})</h5>
          {pendingClaims.length === 0 ? (
            <p className="text-muted">No pending claims.</p>
          ) : (
            pendingClaims.map((claim) => (
              <div key={claim._id} className="card mb-2 p-3 border-start border-warning border-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Policy ID: </strong>
                    <span className="badge bg-secondary me-2">{claim.policyId}</span>
                    <strong>Type: </strong>{claim.claimType}
                    <span className="ms-3 text-muted small">
                      ₹{claim.claimAmount} — {new Date(claim.incidentDate).toLocaleDateString()}
                    </span>
                  </div>
                  <button className="btn btn-sm btn-outline-warning" onClick={() => navigate("/employee/process-claims")}>
                    Process
                  </button>
                </div>
                <p className="mb-0 mt-1 text-muted small">{claim.description}</p>
              </div>
            ))
          )}

          {/* NEW APPLICATIONS */}
          <h5 className="mt-4 mb-3">🆕 New Applications — Last 7 Days ({recentApps.length})</h5>
          {recentApps.length === 0 ? (
            <p className="text-muted">No new applications in the last 7 days.</p>
          ) : (
            recentApps.map((app) => {
              const policyLabel = formatPolicyName(app.policyTypeName);
              return (
                <div key={app._id} className="card mb-2 p-3 border-start border-primary border-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{app.firstName} {app.lastName}</strong>
                      <span className="ms-2 text-muted small">{app.email}</span>

                      {/* Show policy name if available, fallback to POL-id */}
                      {policyLabel ? (
                        <span className="ms-2 badge bg-info text-dark">{policyLabel}</span>
                      ) : (
                        <span className="ms-2 badge bg-secondary">{app.policyId}</span>
                      )}
                    </div>
                    <span className="text-muted small">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
}