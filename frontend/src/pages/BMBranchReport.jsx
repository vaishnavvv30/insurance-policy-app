import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BMBranchReport() {
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [usersRes, appsRes, claimsRes, empRes, policiesRes] = await Promise.all([
          fetch("http://localhost:5000/admin/users"),
          fetch("http://localhost:5000/admin/applications"),
          fetch("http://localhost:5000/admin/claims"),
          fetch("http://localhost:5000/admin/all-employees"),
          fetch("http://localhost:5000/admin/policies")
        ]);
        const users    = await usersRes.json();
        const apps     = await appsRes.json();
        const claims   = await claimsRes.json();
        const emp      = await empRes.json();
        const policies = await policiesRes.json();

        // Policy type breakdown
        const policyBreakdown = apps.reduce((acc, a) => {
          const name = a.policyTypeName || "Unknown";
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {});

        setData({
          totalClients:      users.filter(u => u.role === "client").length,
          totalEmployees:    emp.length,
          totalPolicies:     policies.length,
          totalApplications: apps.length,
          pendingApps:       apps.filter(a => !a.status || a.status === "Pending").length,
          approvedApps:      apps.filter(a => a.status === "Approved").length,
          rejectedApps:      apps.filter(a => a.status === "Rejected").length,
          totalClaims:       claims.length,
          pendingClaims:     claims.filter(c => c.status === "Pending").length,
          approvedClaims:    claims.filter(c => c.status === "Approved").length,
          rejectedClaims:    claims.filter(c => c.status === "Rejected").length,
          totalClaimAmount:  claims.filter(c => c.status === "Approved").reduce((s, c) => s + Number(c.claimAmount || 0), 0),
          policyBreakdown,
          generatedAt:       new Date().toLocaleString()
        });
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="container mt-4 text-center">
      <div className="spinner-border text-success mt-5" />
      <p className="mt-2 text-muted">Generating report...</p>
    </div>
  );

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <div>
          <h2>📄 Branch Report</h2>
          <p className="text-muted mb-0">Complete branch performance summary</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={handlePrint}>🖨️ Print / Save PDF</button>
          <button className="btn btn-outline-secondary" onClick={() => navigate("/employee/bm-dashboard")}>← Dashboard</button>
        </div>
      </div>

      {/* Print header */}
      <div className="text-center mb-4 print-only" style={{ display: "none" }}>
        <h3>PolicyNest — Branch Report</h3>
        <p className="text-muted">Generated: {data?.generatedAt}</p>
      </div>

      {/* Overview cards */}
      <h5 className="mb-3 text-muted">📊 Overview</h5>
      <div className="row mb-4">
        {[
          { label: "Total Clients",      value: data.totalClients,      color: "#0d6efd" },
          { label: "Total Employees",    value: data.totalEmployees,    color: "#198754" },
          { label: "Insurance Policies", value: data.totalPolicies,     color: "#6f42c1" },
          { label: "Total Applications", value: data.totalApplications, color: "#fd7e14" },
        ].map((s, i) => (
          <div className="col-md-3 col-6 mb-2" key={i}>
            <div className="card text-white text-center p-3" style={{ backgroundColor: s.color }}>
              <h3 className="mb-0">{s.value}</h3>
              <small>{s.label}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="row mb-4">

        {/* Applications breakdown */}
        <div className="col-md-6 mb-3">
          <div className="card p-4 shadow-sm h-100">
            <h6 className="mb-3">📋 Applications Breakdown</h6>
            {[
              { label: "Pending",  value: data.pendingApps,  color: "#fd7e14" },
              { label: "Approved", value: data.approvedApps, color: "#198754" },
              { label: "Rejected", value: data.rejectedApps, color: "#dc3545" },
            ].map((s, i) => (
              <div key={i} className="d-flex justify-content-between align-items-center border-bottom py-2">
                <span>{s.label}</span>
                <span className="badge text-white px-3 py-2" style={{ backgroundColor: s.color }}>{s.value}</span>
              </div>
            ))}
            <div className="d-flex justify-content-between align-items-center pt-2">
              <strong>Total</strong>
              <strong>{data.totalApplications}</strong>
            </div>
          </div>
        </div>

        {/* Claims breakdown */}
        <div className="col-md-6 mb-3">
          <div className="card p-4 shadow-sm h-100">
            <h6 className="mb-3">⚖️ Claims Breakdown</h6>
            {[
              { label: "Pending",  value: data.pendingClaims,  color: "#fd7e14" },
              { label: "Approved", value: data.approvedClaims, color: "#198754" },
              { label: "Rejected", value: data.rejectedClaims, color: "#dc3545" },
            ].map((s, i) => (
              <div key={i} className="d-flex justify-content-between align-items-center border-bottom py-2">
                <span>{s.label}</span>
                <span className="badge text-white px-3 py-2" style={{ backgroundColor: s.color }}>{s.value}</span>
              </div>
            ))}
            <div className="d-flex justify-content-between align-items-center border-bottom py-2">
              <strong>Total Claims</strong>
              <strong>{data.totalClaims}</strong>
            </div>
            <div className="d-flex justify-content-between align-items-center pt-2 text-success">
              <strong>Total Approved Amount</strong>
              <strong>₹{data.totalClaimAmount.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Policy type breakdown */}
      <div className="card p-4 shadow-sm mb-4">
        <h6 className="mb-3">🗂️ Applications by Policy Type</h6>
        {Object.keys(data.policyBreakdown).length === 0 ? (
          <p className="text-muted">No applications yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-dark">
                <tr><th>Policy Type</th><th>Applications</th><th>Share</th></tr>
              </thead>
              <tbody>
                {Object.entries(data.policyBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, count], i) => (
                    <tr key={i}>
                      <td>{name.charAt(0).toUpperCase() + name.slice(1)}</td>
                      <td>{count}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: 8 }}>
                            <div className="progress-bar bg-primary"
                              style={{ width: `${Math.round((count / data.totalApplications) * 100)}%` }} />
                          </div>
                          <span style={{ fontSize: 12 }}>
                            {Math.round((count / data.totalApplications) * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-muted text-end small">Report generated: {data.generatedAt}</p>

      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  );
}