import React, { useEffect, useState } from "react";

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

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState("users");
  const [users,        setUsers]        = useState([]);
  const [applications, setApplications] = useState([]);
  const [claims,       setClaims]       = useState([]);

  const fetchUsers = async () => {
    try {
      const res  = await fetch("http://localhost:5000/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) { console.log(error); }
  };

  const fetchApplications = async () => {
    try {
      const res  = await fetch("http://localhost:5000/admin/applications");
      const data = await res.json();
      setApplications(data);
    } catch (error) { console.log(error); }
  };

  const fetchClaims = async () => {
    try {
      const res  = await fetch("http://localhost:5000/admin/claims");
      const data = await res.json();
      setClaims(data);
    } catch (error) { console.log(error); }
  };

  useEffect(() => {
    fetchUsers();
    fetchApplications();
    fetchClaims();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await fetch(`http://localhost:5000/admin/delete-user/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch (error) { console.log(error); }
  };

  const updateClaimStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/admin/update-claim/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchClaims();
    } catch (error) { console.log(error); }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Manage Users</h2>

      {/* TABS */}
      <ul className="nav nav-tabs mb-4">
        {[
          { key: "users",        label: "👥 View Users" },
          { key: "applications", label: "📋 View Application Forms" },
          { key: "claims",       label: "📝 View Claim Forms" }
        ].map((tab) => (
          <li className="nav-item" key={tab.key}>
            <button
              className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* ============================
          TAB 1 — VIEW USERS
      ============================= */}
      {activeTab === "users" && (
        <div>
          <h5 className="mb-3">All Registered Users</h5>
          {users.length === 0 ? (
            <div className="alert alert-info">No users found.</div>
          ) : (
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>#</th><th>Full Name</th><th>Email</th>
                  <th>Role</th><th>Joined</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user._id}>
                    <td>{i + 1}</td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${
                        user.role === "admin"    ? "bg-danger" :
                        user.role === "employee" ? "bg-success" : "bg-primary"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteUser(user._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ============================
          TAB 2 — VIEW APPLICATION FORMS
          Added: Policy Name column
      ============================= */}
      {activeTab === "applications" && (
        <div>
          <h5 className="mb-3">Policy Application Forms Submitted by Users</h5>
          {applications.length === 0 ? (
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
                    <th>DOB</th>
                    <th>Gender</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Annual Income</th>
                    <th>Nominee</th>
                    <th>Relation</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, i) => (
                    <tr key={app._id}>
                      <td>{i + 1}</td>
                      <td>{app.firstName} {app.lastName}</td>
                      <td>{app.email}</td>
                      <td>{app.phone}</td>
                      <td>
                        <span className="badge bg-info text-dark">
                          {formatPolicyName(app.policyTypeName)}
                        </span>
                      </td>
                      <td><span className="badge bg-secondary">{app.policyId}</span></td>
                      <td>{app.dob}</td>
                      <td>{app.gender}</td>
                      <td>{app.city}</td>
                      <td>{app.state}</td>
                      <td>₹{app.annualIncome}</td>
                      <td>{app.nomineeName}</td>
                      <td>{app.nomineeRelation}</td>
                      <td>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================
          TAB 3 — VIEW CLAIM FORMS
      ============================= */}
      {activeTab === "claims" && (
        <div>
          <h5 className="mb-3">Claim Forms Submitted by Users</h5>
          {claims.length === 0 ? (
            <div className="alert alert-info">No claims found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>#</th><th>Policy ID</th><th>Claim Type</th>
                    <th>Incident Date</th><th>Amount (₹)</th>
                    <th>Description</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim, i) => (
                    <tr key={claim._id}>
                      <td>{i + 1}</td>
                      <td>{claim.policyId}</td>
                      <td>{claim.claimType}</td>
                      <td>{new Date(claim.incidentDate).toLocaleDateString()}</td>
                      <td>₹{claim.claimAmount}</td>
                      <td>{claim.description}</td>
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
                            <button className="btn btn-success btn-sm" onClick={() => updateClaimStatus(claim._id, "Approved")}>
                              Approve
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => updateClaimStatus(claim._id, "Rejected")}>
                              Reject
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
      )}
    </div>
  );
}