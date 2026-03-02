import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));

    // 🔒 Protect route
    if (!loggedUser || loggedUser.role !== "employee") {
      navigate("/login");
    } else {
      setUser(loggedUser);
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="container text-center mt-5">
      <h2 className="mb-3">Employee Dashboard</h2>
      <p>Welcome, <strong>{user.role}</strong></p>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card shadow p-4 mb-3">
            <h5>Manage Policies</h5>
            <p>View and manage customer policies</p>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow p-4 mb-3">
            <h5>Process Claims</h5>
            <p>Review and approve insurance claims</p>
          </div>
        </div>
      </div>
    </div>
  );
}