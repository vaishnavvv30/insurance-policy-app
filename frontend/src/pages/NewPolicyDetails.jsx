import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function NewPolicyDetails() {
  const { policyId } = useParams();
  const navigate     = useNavigate();
  const [policy,  setPolicy]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res  = await fetch("http://localhost:5000/admin/policies");
        const data = await res.json();
        // Match by policyId field or by _id
        const found = data.find(p => p.policyId === policyId || p._id === policyId);
        setPolicy(found || null);
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetchPolicy();
  }, [policyId]);

  const user     = localStorage.getItem("loggedInUser");
  const role     = user ? JSON.parse(user).role : null;
  const isClient = role !== "admin" && role !== "employee";

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary" />
    </div>
  );

  if (!policy) return <h2 className="text-center mt-5">Policy not found</h2>;

  return (
    <div className="page-center">
      <div className="auth-box">
        <h2 className="auth-title">{policy.policyName}</h2>

        {policy.description && <p>{policy.description}</p>}

        <h5>Policy Details</h5>
        <ul>
          {policy.coverage      && <li><strong>Coverage:</strong>  {policy.coverage}</li>}
          {policy.premiumAmount && <li><strong>Premium:</strong>   ₹{policy.premiumAmount}</li>}
          {policy.duration      && <li><strong>Duration:</strong>  {policy.duration}</li>}
        </ul>

        {isClient && (
          <button
            className="btn btn-success w-100 mt-3"
            onClick={() => {
              if (!user) { alert("Please login to apply for this policy"); navigate("/login"); return; }
              navigate(`/apply/${policyId}`);
            }}
          >
            Apply Policy
          </button>
        )}

        <button
          className="btn btn-outline-secondary w-100 mt-2"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
}