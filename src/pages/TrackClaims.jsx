import React, { useEffect, useState } from "react";

export default function TrackClaims() {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    fetch(`http://localhost:5000/my-claims/${user._id}`)
      .then(res => res.json())
      .then(data => setClaims(data));
  }, []);

  return (
    <div className="container mt-5">
      <h3 className="mb-4 text-center">My Claims</h3>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Policy ID</th>
            <th>Incident Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {claims.map((claim) => (
            <tr key={claim._id}>
              <td>{claim.policyId}</td>
              <td>{new Date(claim.incidentDate).toLocaleDateString()}</td>
              <td>{claim.claimType}</td>
              <td>₹{claim.claimAmount}</td>
              <td>
                <span className="badge bg-warning">
                  {claim.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}