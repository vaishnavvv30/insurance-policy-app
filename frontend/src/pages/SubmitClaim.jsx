import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SubmitClaim() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    policyId: "",
    incidentDate: "",
    claimType: "",
    claimAmount: "",
    description: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    try {
      const res = await fetch("http://localhost:5000/submit-claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user._id,
          policyId,
          incidentDate,
          claimType,
          claimAmount,
          description
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Something went wrong");
        return;
      }

      alert("Claim submitted successfully!");

      // Redirect to Dashboard
      navigate("/client");

    } catch (error) {
      console.log(error);
      alert("Server error");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow">
        <h3 className="mb-4 text-center">Claim Application Form</h3>

        <form onSubmit={handleSubmit}>

          <input
            className="form-control mb-3"
            name="policyId"
            placeholder="Policy ID"
            value={formData.policyId}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            className="form-control mb-3"
            name="incidentDate"
            value={formData.incidentDate}
            onChange={handleChange}
            required
          />

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

          <input
            type="number"
            className="form-control mb-3"
            name="claimAmount"
            placeholder="Claim Amount"
            value={formData.claimAmount}
            onChange={handleChange}
            required
          />

          <textarea
            className="form-control mb-3"
            name="description"
            placeholder="Describe the incident"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <button className="btn btn-primary w-100">
            Submit Claim
          </button>

          <button
            type="button"
            className="btn btn-secondary w-100 mt-2"
            onClick={() => navigate("/client")}
          >
            Cancel
          </button>

        </form>
      </div>
    </div>
  );
}