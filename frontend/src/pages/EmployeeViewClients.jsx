import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeViewClients() {
  const navigate = useNavigate();
  const [clients, setClients]       = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        /* /admin/users returns ALL users (all roles).
           We filter role === "client" on the frontend.
           This also picks up users registered AFTER the
           employee account was created. */
        const res  = await fetch("http://localhost:5000/admin/users");
        const data = await res.json();
        const clientsOnly = data.filter((u) => u.role === "client");
        setClients(clientsOnly);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filtered = clients.filter((c) =>
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>View Clients</h2>
          <p className="text-muted mb-0">All registered client accounts</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>
          ← Back to Dashboard
        </button>
      </div>

      <input
        className="form-control mb-3"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="mb-3">
        <span className="badge bg-primary">Total Clients: {clients.length}</span>
        {searchTerm && (
          <span className="badge bg-secondary ms-2">Showing: {filtered.length}</span>
        )}
      </div>

      {loading ? (
        <div className="text-center mt-4">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading clients...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-info">No clients found.</div>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client, index) => (
              <tr key={client._id}>
                <td>{index + 1}</td>
                <td>{client.fullName}</td>
                <td>{client.email}</td>
                <td><span className="badge bg-primary">{client.role}</span></td>
                <td>{client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}