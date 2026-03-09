import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SystemSettings() {
  const navigate = useNavigate();
  const [siteName,    setSiteName]    = useState("PolicyNest");
  const [contactEmail,setContactEmail]= useState("support@insurance.com");
  const [contactPhone,setContactPhone]= useState("+91 98765 43210");
  const [maxClaim,    setMaxClaim]    = useState("500000");
  const [saved,       setSaved]       = useState(false);

  const handleSave = () => {
    // In a real app this would POST to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>⚙️ System Settings</h2>
          <p className="text-muted mb-0">Configure platform-wide preferences</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/admin")}>← Dashboard</button>
      </div>

      {saved && <div className="alert alert-success">✅ Settings saved successfully!</div>}

      <div className="row">
        {/* General */}
        <div className="col-md-6 mb-4">
          <div className="card p-4 shadow-sm h-100">
            <h5 className="mb-3">🏢 General Settings</h5>
            <label className="form-label fw-semibold">Platform Name</label>
            <input className="form-control mb-3" value={siteName} onChange={e => setSiteName(e.target.value)} />
            <label className="form-label fw-semibold">Support Email</label>
            <input className="form-control mb-3" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
            <label className="form-label fw-semibold">Support Phone</label>
            <input className="form-control" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
          </div>
        </div>

        {/* Policy Rules */}
        <div className="col-md-6 mb-4">
          <div className="card p-4 shadow-sm h-100">
            <h5 className="mb-3">📋 Policy & Claims Rules</h5>
            <label className="form-label fw-semibold">Maximum Claim Amount (₹)</label>
            <input className="form-control mb-3" type="number" value={maxClaim} onChange={e => setMaxClaim(e.target.value)} />
            <label className="form-label fw-semibold">Default Policy Status</label>
            <select className="form-control mb-3">
              <option>Active</option>
              <option>Pending Review</option>
            </select>
            <label className="form-label fw-semibold">Claim Processing Time</label>
            <select className="form-control">
              <option>7 Days</option>
              <option>14 Days</option>
              <option>30 Days</option>
            </select>
          </div>
        </div>

        {/* Role Access */}
        <div className="col-md-12 mb-4">
          <div className="card p-4 shadow-sm">
            <h5 className="mb-3">🔐 Role Access Summary</h5>
            <table className="table table-bordered table-sm">
              <thead className="table-dark">
                <tr><th>Role</th><th>Hire Employees</th><th>Manage Policies</th><th>Process Claims</th><th>View Clients</th></tr>
              </thead>
              <tbody>
                {[
                  { role: "Admin",          hire: "HR Only", policy: "✅", claims: "✅ (oversight)", clients: "✅" },
                  { role: "HR",             hire: "Branch Manager, Agent, Officers", policy: "❌", claims: "❌", clients: "❌" },
                  { role: "Branch Manager", hire: "❌", policy: "✅", claims: "✅", clients: "✅" },
                  { role: "Claims Officer", hire: "❌", policy: "❌", claims: "✅", clients: "❌" },
                  { role: "Policy Officer", hire: "❌", policy: "✅", claims: "❌", clients: "✅" },
                  { role: "Insurance Agent",hire: "❌", policy: "View only", claims: "❌", clients: "✅" }
                ].map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.role}</strong></td>
                    <td>{r.hire}</td><td>{r.policy}</td><td>{r.claims}</td><td>{r.clients}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <button className="btn btn-primary px-4" onClick={handleSave}>💾 Save Settings</button>
    </div>
  );
}