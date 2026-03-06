import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* Helper: turn "housing" → "Housing Insurance" */
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

export default function EmployeeManagePolicies() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm]     = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res  = await fetch("http://localhost:5000/admin/applications");
        const data = await res.json();
        setApplications(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchApplications();
  }, []);

  const filtered = applications.filter((app) => {
    const name = `${app.firstName} ${app.lastName}`.toLowerCase();
    const term = searchTerm.toLowerCase();
    return (
      name.includes(term) ||
      app.email?.toLowerCase().includes(term) ||
      app.policyId?.toLowerCase().includes(term) ||
      formatPolicyName(app.policyTypeName).toLowerCase().includes(term)
    );
  });

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Manage Policies</h2>
          <p className="text-muted mb-0">All customer policy applications</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>
          ← Back to Dashboard
        </button>
      </div>

      <input
        className="form-control mb-3"
        placeholder="Search by name, email, policy name or policy ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="mb-3">
        <span className="badge bg-primary me-2">Total: {applications.length}</span>
        <span className="badge bg-secondary">Showing: {filtered.length}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="alert alert-info">No applications found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Policy Name</th>
                <th>Policy ID</th>
                <th>City</th>
                <th>Annual Income</th>
                <th>Nominee</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, index) => (
                <tr key={app._id}>
                  <td>{index + 1}</td>
                  <td>{app.firstName} {app.lastName}</td>
                  <td>{app.email}</td>
                  <td>{app.phone}</td>
                  <td>
                    <span className="badge bg-info text-dark">
                      {formatPolicyName(app.policyTypeName)}
                    </span>
                  </td>
                  <td><span className="badge bg-secondary">{app.policyId}</span></td>
                  <td>{app.city}, {app.state}</td>
                  <td>₹{app.annualIncome}</td>
                  <td>{app.nomineeName} ({app.nomineeRelation})</td>
                  <td>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}