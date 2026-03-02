import React from "react";

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="container text-center">
      <h2 className="mb-3">Admin Dashboard</h2>
      <p>Welcome, <strong>{user?.name || "Admin"}</strong></p>

      {/* IMAGE 
      <img
        src="/images/admin.png"
        alt="Admin"
        className="img-fluid mb-4"
        style={{ maxWidth: "250px" }}
      />*/}
      




      <div className="row">
        <div className="col-md-4">
          <div className="card bg-primary text-white mb-3">
            <div className="card-body">
              <h5>Manage Policies</h5>
              <p>Create and manage insurance policies</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-success text-white mb-3">
            <div className="card-body">
              <h5>Manage Employees</h5>
              <p>View employee information</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-dark text-white mb-3">
            <div className="card-body">
              <h5>Reports</h5>
              <p>Monitor system activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
