import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedUser || loggedUser.role !== "client") {
      navigate("/login");
    } else {
      setUser(loggedUser);
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="container mt-5 text-center">

      {/* ✅ Welcome with Name */}
      <h1 className="mb-4">
        Welcome, <strong>{user.fullName}</strong>
      </h1>

      <div className="row justify-content-center">

        {/* ✅ View Policies */}
        <div className="col-md-4">
          <div 
            className="card shadow p-4 mb-3"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/policies")}
          >
            <h5>View Policies</h5>
            <p>Manage your insurance policies.</p>
          </div>
        </div>

        {/* ✅ Submit Claim */}
        <div className="col-md-4">
          <div 
            className="card shadow p-4 mb-3"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/submit-claim")}
          >
            <h5>Submit Claim</h5>
            <p>Submit insurance claims easily.</p>
          </div>
        </div>

        {/* ✅ Track Claims */}
        <div className="col-md-4">
          <div 
            className="card shadow p-4 mb-3"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/track-claims")}
          >
            <h5>Track Claims</h5>
            <p>Track the status of your submitted claims.</p>
          </div>
        </div>

      </div>
    </div>
  );
}