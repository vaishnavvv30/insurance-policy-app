import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SubmitClaim() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);

  /* ===============================
     FETCH USER'S APPLIED POLICIES
     /my-policies/:email returns Application docs
     Each doc has: policyId (POL-xxx), policyTypeName ("housing")
  ================================= */
  useEffect(() => {
    const fetchPolicies = async () => {
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      try {
        const res  = await fetch(`http://localhost:5000/my-policies/${user.email}`);
        const data = await res.json();
        setPolicies(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPolicies();
  }, []);

  const [formData, setFormData] = useState({
    policyId: "", incidentDate: "", claimType: "", claimAmount: "", description: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    try {
      const res = await fetch("http://localhost:5000/submit-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:       user._id,
          policyId:     formData.policyId,
          incidentDate: formData.incidentDate,
          claimType:    formData.claimType,
          claimAmount:  formData.claimAmount,
          description:  formData.description
        })
      });
      const data = await res.json();
      if (!res.ok) { alert("Something went wrong"); return; }
      alert("Claim submitted successfully!");
      navigate("/client");
    } catch (error) {
      console.log(error);
      alert("Server error");
    }
  };

  /* Capitalise first letter for display e.g. "housing" → "Housing Insurance" */
  const formatPolicyName = (typeName) => {
    if (!typeName) return "Unknown Policy";
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

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow">
        <h3 className="mb-4 text-center">Claim Application Form</h3>

        <form onSubmit={handleSubmit}>

          {/* POLICY DROPDOWN — shows "Housing Insurance (POL-xxx)" */}
          <label className="form-label fw-semibold">Select Policy</label>
          <select
            className="form-control mb-3"
            name="policyId"
            value={formData.policyId}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Your Policy --</option>
            {policies.map((policy) => (
              <option key={policy._id} value={policy.policyId}>
                {formatPolicyName(policy.policyTypeName)} ({policy.policyId})
              </option>
            ))}
          </select>

          <label className="form-label fw-semibold">Incident Date</label>
          <input
            type="date"
            className="form-control mb-3"
            name="incidentDate"
            value={formData.incidentDate}
            onChange={handleChange}
            required
          />

          <label className="form-label fw-semibold">Claim Type</label>
          <select
            className="form-control mb-3"
            name="claimType"
            value={formData.claimType}
            onChange={handleChange}
            required
          >
            <option value="">Select Claim Type</option>
            <option value="Accident">Accident</option>
            <option value="Hospitalization">Hospitalization</option>
            <option value="Property Damage">Property Damage</option>
          </select>

          <label className="form-label fw-semibold">Claim Amount (₹)</label>
          <input
            type="number"
            className="form-control mb-3"
            name="claimAmount"
            placeholder="Enter claim amount"
            value={formData.claimAmount}
            onChange={handleChange}
            required
          />

          <label className="form-label fw-semibold">Description</label>
          <textarea
            className="form-control mb-3"
            name="description"
            placeholder="Describe the incident"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <button className="btn btn-primary w-100">Submit Claim</button>
          <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => navigate("/client")}>
            Cancel
          </button>

        </form>
      </div>
    </div>
  );
}