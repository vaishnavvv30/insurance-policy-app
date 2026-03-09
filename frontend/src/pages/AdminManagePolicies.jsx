import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EMPTY_FORM = { policyName: "", description: "", coverage: "", premiumAmount: "", duration: "" };

export default function AdminManagePolicies() {
  const navigate = useNavigate();
  const [policies,  setPolicies]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [editId,    setEditId]    = useState(null);
  const [showForm,  setShowForm]  = useState(false);
  const [search,    setSearch]    = useState("");
  const [saving,    setSaving]    = useState(false);

  const fetchPolicies = async () => {
    try {
      const res  = await fetch("http://localhost:5000/admin/policies");
      const data = await res.json();
      setPolicies(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPolicies(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.policyName || !form.premiumAmount) { alert("Policy name and premium amount are required."); return; }
    setSaving(true);
    try {
      const url    = editId ? `http://localhost:5000/admin/edit-policy/${editId}` : "http://localhost:5000/admin/add-policy";
      const method = editId ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) { alert("Failed to save policy"); return; }
      alert(editId ? "Policy updated!" : "Policy created!");
      setForm(EMPTY_FORM); setEditId(null); setShowForm(false);
      fetchPolicies();
    } catch (e) { console.log(e); alert("Server error"); }
    finally { setSaving(false); }
  };

  const handleEdit = (policy) => {
    setForm({
      policyName:    policy.policyName    || "",
      description:   policy.description   || "",
      coverage:      policy.coverage      || "",
      premiumAmount: policy.premiumAmount || "",
      duration:      policy.duration      || ""
    });
    setEditId(policy._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete policy "${name}"? This cannot be undone.`)) return;
    try {
      await fetch(`http://localhost:5000/admin/delete-policy/${id}`, { method: "DELETE" });
      alert("Policy deleted.");
      fetchPolicies();
    } catch (e) { console.log(e); alert("Server error"); }
  };

  const handleCancel = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(false); };

  const filtered = policies.filter(p =>
    !search ||
    (p.policyName  || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.coverage    || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>🗂️ Manage Policies</h2>
          <p className="text-muted mb-0">Create, edit and remove insurance policies</p>
        </div>
        <div className="d-flex gap-2">
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              ➕ New Policy
            </button>
          )}
          <button className="btn btn-outline-secondary" onClick={() => navigate("/admin")}>
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-4 mb-4 shadow" style={{ borderLeft: "4px solid #0d6efd" }}>
          <h5 className="mb-3">{editId ? "✏️ Edit Policy" : "➕ Create New Policy"}</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Policy Name *</label>
              <input name="policyName" className="form-control" placeholder="e.g. Gold Health Plan"
                value={form.policyName} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Coverage</label>
              <input name="coverage" className="form-control" placeholder="e.g. ₹5,00,000 medical coverage"
                value={form.coverage} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Premium Amount (₹) *</label>
              <input name="premiumAmount" type="number" className="form-control" placeholder="e.g. 12000"
                value={form.premiumAmount} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Duration</label>
              <input name="duration" className="form-control" placeholder="e.g. 1 Year, 5 Years"
                value={form.duration} onChange={handleChange} />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Description</label>
              <textarea name="description" className="form-control" rows={3}
                placeholder="Brief description of the policy..."
                value={form.description} onChange={handleChange} />
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : editId ? "💾 Update Policy" : "✅ Create Policy"}
            </button>
            <button className="btn btn-outline-secondary" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <span className="badge bg-primary fs-6 px-3 py-2">Total: {policies.length}</span>
        <input className="form-control" style={{ maxWidth: 300 }}
          placeholder="🔍 Search policies..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {search && <span className="badge bg-secondary">Showing: {filtered.length}</span>}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-info">No policies found. Click "New Policy" to add one.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Policy Name</th>
                <th>Coverage</th>
                <th>Premium (₹)</th>
                <th>Duration</th>
                <th>Description</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((policy, i) => (
                <tr key={policy._id}>
                  <td>{i + 1}</td>
                  <td><strong>{policy.policyName}</strong></td>
                  <td>{policy.coverage || <span className="text-muted">—</span>}</td>
                  <td>₹{policy.premiumAmount}</td>
                  <td>{policy.duration || <span className="text-muted">—</span>}</td>
                  <td style={{ maxWidth: 200, wordBreak: "break-word" }}>
                    {policy.description || <span className="text-muted">—</span>}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-warning" onClick={() => handleEdit(policy)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(policy._id, policy.policyName)}>
                        🗑️ Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}