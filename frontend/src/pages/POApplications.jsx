import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const formatPolicyName = (typeName) => {
  if (!typeName) return "—";
  const map = {
    housing: "Housing Insurance", health: "Health Insurance",
    vehicle: "Vehicle Insurance", life: "Life Insurance",
    travel: "Travel Insurance",   retirement: "Retirement Plan",
    child: "Child Education Plan", business: "Business Insurance"
  };
  return map[typeName.toLowerCase()] || typeName.charAt(0).toUpperCase() + typeName.slice(1);
};

// Base URL where uploaded files are served from
const UPLOADS_URL = "http://localhost:5000/uploads/";

export default function POApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [search,       setSearch]       = useState("");
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState(null);
  const [lightbox,     setLightbox]     = useState(null); // full-screen image preview

  const fetchApplications = async () => {
    try {
      const res  = await fetch("http://localhost:5000/admin/applications");
      const data = await res.json();
      setApplications(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApplications(); }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/update-application/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) { alert("Failed to update status"); return; }
      alert(`Application ${status} successfully!`);
      setSelected(null);
      fetchApplications();
    } catch (e) { console.log(e); alert("Server error"); }
  };

  const filtered = applications.filter(app => {
    const matchStatus = filterStatus === "all" || (app.status || "Pending") === filterStatus;
    const term        = search.toLowerCase();
    const matchSearch = !search ||
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(term) ||
      app.email?.toLowerCase().includes(term) ||
      formatPolicyName(app.policyTypeName).toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  const countByStatus = (s) => applications.filter(a => (a.status || "Pending") === s).length;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>📝 Policy Applications</h2>
          <p className="text-muted mb-0">Review and approve or reject client applications</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/employee")}>
          ← Dashboard
        </button>
      </div>

      {/* Summary cards */}
      <div className="row mb-4">
        {[
          { label: "Pending",  value: countByStatus("Pending"),  color: "#fd7e14", icon: "⏳" },
          { label: "Approved", value: countByStatus("Approved"), color: "#198754", icon: "✅" },
          { label: "Rejected", value: countByStatus("Rejected"), color: "#dc3545", icon: "❌" },
          { label: "Total",    value: applications.length,       color: "#6c757d", icon: "📋" }
        ].map((s, i) => (
          <div className="col-md-3 col-6 mb-2" key={i}>
            <div className="card text-white text-center p-3" style={{ backgroundColor: s.color }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <h3 className="mb-0">{s.value}</h3>
              <small>{s.label}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input className="form-control" style={{ maxWidth: 280 }}
          placeholder="🔍 Search by name, email or policy..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {["all", "Pending", "Approved", "Rejected"].map(s => (
          <button key={s}
            className={`btn btn-sm ${filterStatus === s ? "btn-dark" : "btn-outline-secondary"}`}
            onClick={() => setFilterStatus(s)}>
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      <div className="mb-2">
        <span className="badge bg-primary me-2">Total: {applications.length}</span>
        <span className="badge bg-secondary">Showing: {filtered.length}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center mt-5"><div className="spinner-border text-success" /></div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-info">No applications found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Applicant</th>
                <th>Email</th>
                <th>Policy</th>
                <th>Annual Income</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, i) => {
                const status = app.status || "Pending";
                return (
                  <tr key={app._id}>
                    <td>{i + 1}</td>
                    <td>
                      <strong className="text-primary" style={{ cursor: "pointer" }}
                        onClick={() => setSelected(app)}>
                        {app.firstName} {app.lastName}
                      </strong>
                    </td>
                    <td>{app.email}</td>
                    <td><span className="badge bg-info text-dark">{formatPolicyName(app.policyTypeName)}</span></td>
                    <td>₹{app.annualIncome}</td>
                    <td>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"}</td>
                    <td>
                      <span className={`badge ${status === "Approved" ? "bg-success" : status === "Rejected" ? "bg-danger" : "bg-warning text-dark"}`}>
                        {status}
                      </span>
                    </td>
                    {/* ── Added: Payment column ── */}
                    <td>
                      <span className={`badge ${app.paymentStatus === "Successful" ? "bg-success" : "bg-warning text-dark"}`}>
                        {app.paymentStatus === "Successful" ? "Successful" : "Pending"}
                      </span>
                      {app.paymentStatus === "Successful" && app.amountPaid > 0 && (
                        <div className="text-muted" style={{ fontSize: 11 }}>₹{app.amountPaid}</div>
                      )}
                    </td>
                    <td>
                      {status === "Pending" ? (
                        <div className="d-flex gap-1">
                          <button className="btn btn-success btn-sm" onClick={() => updateStatus(app._id, "Approved")}>✔ Approve</button>
                          <button className="btn btn-danger btn-sm"  onClick={() => updateStatus(app._id, "Rejected")}>✘ Reject</button>
                        </div>
                      ) : (
                        <span className="text-muted small">Reviewed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Detail Modal ─────────────────────────────────── */}
      {selected && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">📝 {selected.firstName} {selected.lastName} — Application Details</h5>
                <button className="btn-close" onClick={() => setSelected(null)} />
              </div>

              <div className="modal-body">
                <div className="row">

                  {/* ── Left: Personal & Policy Info ── */}
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2 border-bottom pb-1">👤 Personal Information</h6>
                    <table className="table table-sm table-borderless mb-3">
                      <tbody>
                        <tr><td className="text-muted" style={{ width: 130 }}>Full Name:</td><td><strong>{selected.firstName} {selected.lastName}</strong></td></tr>
                        <tr><td className="text-muted">Email:</td><td>{selected.email}</td></tr>
                        <tr><td className="text-muted">Phone:</td><td>{selected.phone}</td></tr>
                        <tr><td className="text-muted">Date of Birth:</td><td>{selected.dob}</td></tr>
                        <tr><td className="text-muted">Gender:</td><td>{selected.gender}</td></tr>
                        <tr><td className="text-muted">Address:</td><td>{selected.address}, {selected.city}, {selected.state} - {selected.pincode}</td></tr>
                      </tbody>
                    </table>

                    <h6 className="text-muted mb-2 border-bottom pb-1">📋 Policy Information</h6>
                    <table className="table table-sm table-borderless mb-3">
                      <tbody>
                        <tr><td className="text-muted" style={{ width: 130 }}>Policy Type:</td><td><span className="badge bg-info text-dark">{formatPolicyName(selected.policyTypeName)}</span></td></tr>
                        <tr><td className="text-muted">Policy ID:</td><td><span className="badge bg-secondary">{selected.policyId}</span></td></tr>
                        <tr><td className="text-muted">Annual Income:</td><td>₹{selected.annualIncome}</td></tr>
                        <tr><td className="text-muted">Nominee:</td><td>{selected.nomineeName} ({selected.nomineeRelation})</td></tr>
                        <tr><td className="text-muted">Submitted:</td><td>{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "—"}</td></tr>
                        <tr>
                          <td className="text-muted">Status:</td>
                          <td>
                            <span className={`badge ${(selected.status || "Pending") === "Approved" ? "bg-success" : (selected.status || "Pending") === "Rejected" ? "bg-danger" : "bg-warning text-dark"}`}>
                              {selected.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                        {/* ── Added: Payment row in modal ── */}
                        <tr>
                          <td className="text-muted">Payment:</td>
                          <td>
                            <span className={`badge ${selected.paymentStatus === "Successful" ? "bg-success" : "bg-warning text-dark"}`}>
                              {selected.paymentStatus === "Successful" ? "Successful" : "Pending"}
                            </span>
                            {selected.paymentStatus === "Successful" && selected.amountPaid > 0 && (
                              <span className="ms-2 text-success fw-bold">₹{selected.amountPaid}</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* ── Right: Uploaded Documents ── */}
                  <div className="col-md-6">
                    <h6 className="text-muted mb-3 border-bottom pb-1">📎 Uploaded Documents</h6>

                    {/* Photo */}
                    <div className="mb-4">
                      <p className="fw-semibold mb-2">🖼️ Applicant Photo</p>
                      {selected.photo ? (
                        <div>
                          <img
                            src={`${UPLOADS_URL}${selected.photo}`}
                            alt="Applicant"
                            className="rounded border"
                            style={{ width: "100%", maxWidth: 220, height: 200, objectFit: "cover", cursor: "pointer" }}
                            onClick={() => setLightbox(`${UPLOADS_URL}${selected.photo}`)}
                            onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }}
                          />
                          <div className="alert alert-secondary py-2 small mt-1" style={{ display: "none" }}>
                            Photo file: <code>{selected.photo}</code>
                          </div>
                          <div className="text-muted mt-1" style={{ fontSize: 11 }}>Click image to enlarge</div>
                        </div>
                      ) : (
                        <div className="alert alert-secondary py-2">No photo uploaded.</div>
                      )}
                    </div>

                    {/* ID Proof */}
                    <div>
                      <p className="fw-semibold mb-2">🪪 ID Proof</p>
                      {selected.idProof ? (
                        (() => {
                          const ext = selected.idProof.split(".").pop().toLowerCase();
                          const isPDF = ext === "pdf";
                          return isPDF ? (
                            <div>
                              <a
                                href={`${UPLOADS_URL}${selected.idProof}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline-primary btn-sm"
                              >
                                📄 View PDF ID Proof
                              </a>
                              <div className="text-muted mt-1" style={{ fontSize: 11 }}>Opens in new tab</div>
                            </div>
                          ) : (
                            <div>
                              <img
                                src={`${UPLOADS_URL}${selected.idProof}`}
                                alt="ID Proof"
                                className="rounded border"
                                style={{ width: "100%", maxWidth: 280, maxHeight: 200, objectFit: "contain", cursor: "pointer", backgroundColor: "#f8f9fa" }}
                                onClick={() => setLightbox(`${UPLOADS_URL}${selected.idProof}`)}
                                onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }}
                              />
                              <div className="alert alert-secondary py-2 small mt-1" style={{ display: "none" }}>
                                ID file: <code>{selected.idProof}</code>
                              </div>
                              <div className="text-muted mt-1" style={{ fontSize: 11 }}>Click image to enlarge</div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="alert alert-secondary py-2">No ID proof uploaded.</div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              <div className="modal-footer">
                {(selected.status || "Pending") === "Pending" ? (
                  <>
                    <button className="btn btn-success" onClick={() => updateStatus(selected._id, "Approved")}>✔ Approve Application</button>
                    <button className="btn btn-danger"  onClick={() => updateStatus(selected._id, "Rejected")}>✘ Reject Application</button>
                  </>
                ) : (
                  <span className="text-muted">This application has already been reviewed.</span>
                )}
                <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────────────── */}
      {lightbox && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 9999, cursor: "zoom-out" }}
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Full preview"
            style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }}
            onClick={e => e.stopPropagation()}
          />
          <button
            className="btn btn-light position-absolute top-0 end-0 m-3"
            onClick={() => setLightbox(null)}
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
}