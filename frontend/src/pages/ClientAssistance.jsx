import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const formatPolicyName = (typeName) => {
  if (!typeName) return "—";
  const map = { housing: "Housing Insurance", health: "Health Insurance", vehicle: "Vehicle Insurance", life: "Life Insurance", travel: "Travel Insurance", retirement: "Retirement Plan", child: "Child Education Plan", business: "Business Insurance" };
  return map[typeName.toLowerCase()] || typeName.charAt(0).toUpperCase() + typeName.slice(1);
};

export default function ClientAssistance() {
  const navigate = useNavigate();
  const [clients,  setClients]  = useState([]);
  const [apps,     setApps]     = useState([]);
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, appsRes] = await Promise.all([
          fetch("http://localhost:5000/admin/users"),
          fetch("http://localhost:5000/admin/applications")
        ]);
        const users = await usersRes.json();
        const appsData = await appsRes.json();
        setClients(users.filter(u => u.role === "client"));
        setApps(appsData);
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const clientPolicies = selected
    ? apps.filter(a => a.email === selected.email)
    : [];

  const filteredClients = clients.filter(c =>
    !search ||
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>🤝 Client Assistance</h2>
          <p className="text-muted mb-0">Look up a client and view their policies</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>← Dashboard</button>
      </div>

      <div className="row">
        {/* Client list */}
        <div className="col-md-5">
          <input className="form-control mb-2" placeholder="🔍 Search client..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {loading ? (
              <div className="text-center mt-4"><div className="spinner-border text-primary" /></div>
            ) : filteredClients.map(client => (
              <div key={client._id}
                className={`card p-3 mb-2 ${selected?._id === client._id ? "border-primary" : ""}`}
                style={{ cursor: "pointer", borderLeft: selected?._id === client._id ? "4px solid #0d6efd" : "" }}
                onClick={() => setSelected(client)}>
                <strong>{client.fullName}</strong><br />
                <small className="text-muted">{client.email}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Client detail */}
        <div className="col-md-7">
          {!selected ? (
            <div className="alert alert-info mt-2">
              👈 Select a client from the list to view their policies.
            </div>
          ) : (
            <div>
              <div className="card p-3 mb-3 shadow-sm" style={{ borderTop: "4px solid #0d6efd" }}>
                <h5 className="mb-1">{selected.fullName}</h5>
                <p className="mb-1 text-muted small">{selected.email}</p>
                <span className="badge bg-primary">Client</span>
                <span className="ms-2 text-muted small">
                  Joined: {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "—"}
                </span>
              </div>

              <h6 className="mb-2">📋 Policies ({clientPolicies.length})</h6>
              {clientPolicies.length === 0 ? (
                <div className="alert alert-warning">This client has no applied policies yet.</div>
              ) : clientPolicies.map(app => (
                <div key={app._id} className="card p-3 mb-2 border-start border-success border-3">
                  <div className="d-flex justify-content-between">
                    <div>
                      <span className="badge bg-info text-dark me-2">{formatPolicyName(app.policyTypeName)}</span>
                      <span className="badge bg-secondary">{app.policyId}</span>
                    </div>
                    <small className="text-muted">{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"}</small>
                  </div>
                  <small className="text-muted mt-1 d-block">Nominee: {app.nomineeName} ({app.nomineeRelation})</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}