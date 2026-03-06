import React, { useEffect, useState } from "react";

export default function ManagePolicies() {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverage, setCoverage] = useState("");
  const [premium, setPremium] = useState("");
  const [duration, setDuration] = useState("");

  const [policies, setPolicies] = useState([]);

  // For edit mode
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCoverage, setEditCoverage] = useState("");
  const [editPremium, setEditPremium] = useState("");
  const [editDuration, setEditDuration] = useState("");

  /* ===============================
     FETCH POLICIES
  ================================= */

  const fetchPolicies = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/policies");
      const data = await res.json();
      setPolicies(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  /* ===============================
     ADD POLICY
     NOTE: server expects policyName & premiumAmount
  ================================= */

  const addPolicy = async () => {

    if (!title || !premium) {
      alert("Please enter Policy Title and Premium Amount");
      return;
    }

    try {

      const res = await fetch("http://localhost:5000/admin/add-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyName: title,
          description,
          coverage,
          premiumAmount: premium,
          duration
        })
      });

      const data = await res.json();
      alert(data.message || "Policy added!");

      setTitle("");
      setDescription("");
      setCoverage("");
      setPremium("");
      setDuration("");

      fetchPolicies();

    } catch (error) {
      console.log(error);
      alert("Error adding policy");
    }

  };

  /* ===============================
     DELETE POLICY
  ================================= */

  const deletePolicy = async (id) => {

    if (!window.confirm("Are you sure you want to delete this policy?")) return;

    await fetch(`http://localhost:5000/admin/delete-policy/${id}`, {
      method: "DELETE"
    });

    fetchPolicies();

  };

  /* ===============================
     OPEN EDIT MODE
  ================================= */

  const openEdit = (policy) => {
    setEditId(policy._id);
    setEditTitle(policy.policyName || policy.title || "");
    setEditDescription(policy.description || "");
    setEditCoverage(policy.coverage || "");
    setEditPremium(policy.premiumAmount || policy.premium || "");
    setEditDuration(policy.duration || "");
  };

  /* ===============================
     CANCEL EDIT
  ================================= */

  const cancelEdit = () => {
    setEditId(null);
  };

  /* ===============================
     SAVE EDIT
  ================================= */

  const saveEdit = async (id) => {

    try {

      const res = await fetch(`http://localhost:5000/admin/edit-policy/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyName: editTitle,
          description: editDescription,
          coverage: editCoverage,
          premiumAmount: editPremium,
          duration: editDuration
        })
      });

      const data = await res.json();
      alert(data.message || "Policy updated!");

      setEditId(null);
      fetchPolicies();

    } catch (error) {
      console.log(error);
      alert("Error updating policy");
    }

  };

  /* ===============================
     RENDER
  ================================= */

  return (

    <div className="container mt-4">

      <h2 className="mb-4">Manage Policies</h2>

      {/* ---- ADD POLICY FORM ---- */}

      <div className="card p-3 mb-4 shadow-sm">

        <h5 className="mb-3">Add New Policy</h5>

        <input
          className="form-control mb-2"
          placeholder="Policy Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="form-control mb-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="form-control mb-2"
          placeholder="Coverage"
          value={coverage}
          onChange={(e) => setCoverage(e.target.value)}
        />

        <input
          className="form-control mb-2"
          placeholder="Premium Amount *"
          value={premium}
          onChange={(e) => setPremium(e.target.value)}
        />

        <input
          className="form-control mb-2"
          placeholder="Duration (e.g. 1 Year)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <button
          className="btn btn-primary"
          onClick={addPolicy}
        >
          Add Policy
        </button>

      </div>

      {/* ---- POLICY TABLE ---- */}

      <table className="table table-bordered">

        <thead className="table-dark">
          <tr>
            <th>Title</th>
            <th>Coverage</th>
            <th>Premium</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {policies.map((policy) => (

            <tr key={policy._id}>

              {/* EDIT MODE — inline row editing */}
              {editId === policy._id ? (

                <>
                  <td>
                    <input
                      className="form-control form-control-sm"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <input
                      className="form-control form-control-sm mt-1"
                      placeholder="Description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control form-control-sm"
                      value={editCoverage}
                      onChange={(e) => setEditCoverage(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control form-control-sm"
                      value={editPremium}
                      onChange={(e) => setEditPremium(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control form-control-sm"
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-success btn-sm me-1"
                      onClick={() => saveEdit(policy._id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </td>
                </>

              ) : (

                /* NORMAL VIEW MODE */
                <>
                  <td>{policy.policyName || policy.title}</td>
                  <td>{policy.coverage}</td>
                  <td>{policy.premiumAmount || policy.premium}</td>
                  <td>{policy.duration}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-1"
                      onClick={() => openEdit(policy)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deletePolicy(policy._id)}
                    >
                      Delete
                    </button>
                  </td>
                </>

              )}

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}