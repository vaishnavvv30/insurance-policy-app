import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ApplyPolicy() {
  const { policyId } = useParams();
  const navigate = useNavigate();

  const user = localStorage.getItem("loggedInUser");
  if (!user) {
    navigate("/login");
  }

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    annualIncome: "",
    nomineeName: "",
    nomineeRelation: ""
  });

  const [photo, setPhoto] = useState(null);
  const [idProof, setIdProof] = useState(null);

  /* ── ADDED: fetch real policy name using the _id from URL ── */
  const [policyName, setPolicyName] = useState("");
  useEffect(() => {
  fetch("http://localhost:5000/admin/policies")
    .then((res) => res.json())
    .then((policies) => {
      console.log("policies:", policies);
      console.log("looking for policyId:", policyId);
      const found = policies.find(
        (p) => p._id.toString() === policyId.toString() || 
               p.policyId === policyId
      );
      console.log("found:", found);
      if (found) setPolicyName(found.policyName);
    })
    .catch((err) => console.error("Failed to fetch policy name:", err));
}, [policyId]);
  /* ────────────────────────────────────────────────────────── */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

Object.keys(formData).forEach((key) => {
  data.append(key, formData[key]);
});

const user = JSON.parse(localStorage.getItem("loggedInUser"));
data.append("userId", user._id);

    data.append("policyId", policyId);
    data.append("photo", photo);
    data.append("idProof", idProof);

    try {
      const response = await fetch("http://localhost:5000/apply-policy", {
        method: "POST",
        body: data
      });

      const result = await response.json();
      alert(result.message);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Error submitting application");
    }
  };

  return (
    <div className="page-center">
      <div className="auth-box" style={{ maxWidth: "700px" }}>
        <h2 className="auth-title text-center mb-4">
          Insurance Application Form
        </h2>

        <form onSubmit={handleSubmit}>

          <input name="firstName" onChange={handleChange} placeholder="First Name" className="form-control mb-2" required />
          <input name="lastName" onChange={handleChange} placeholder="Last Name" className="form-control mb-2" required />
          <input name="email" type="email" onChange={handleChange} placeholder="Email" className="form-control mb-2" required />
          <input name="phone" onChange={handleChange} placeholder="Phone" className="form-control mb-2" required />
          <input name="dob" type="date" onChange={handleChange} className="form-control mb-2" required />

          <select name="gender" onChange={handleChange} className="form-control mb-2" required>
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <textarea name="address" onChange={handleChange} placeholder="Address" className="form-control mb-2" required />

          <input name="city" onChange={handleChange} placeholder="City" className="form-control mb-2" required />
          <input name="state" onChange={handleChange} placeholder="State" className="form-control mb-2" required />
          <input name="pincode" onChange={handleChange} placeholder="Pincode" className="form-control mb-2" required />

          {/* ── CHANGED: show policy name instead of raw _id ── */}
          <input value={policyName || "Loading..."} readOnly className="form-control mb-2" />
          {/* ─────────────────────────────────────────────────── */}

          <input name="annualIncome" type="number" onChange={handleChange} placeholder="Annual Income" className="form-control mb-2" required />

          <input name="nomineeName" onChange={handleChange} placeholder="Nominee Name" className="form-control mb-2" required />
          <input name="nomineeRelation" onChange={handleChange} placeholder="Nominee Relation" className="form-control mb-2" required />

          {"Photo: "}<input type="file" onChange={(e) => setPhoto(e.target.files[0])} className="form-control mb-2" required />
          {"ID Proof: "}<input type="file" onChange={(e) => setIdProof(e.target.files[0])} className="form-control mb-2" required />

          <button className="btn btn-primary w-100 mt-3">
            Submit
          </button>
          <button
            type="button"
            className="btn btn-secondary w-100 mt-2"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}