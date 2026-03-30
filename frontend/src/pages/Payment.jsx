import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Payment() {
  const { applicationId } = useParams();
  const navigate          = useNavigate();

  const [policy,        setPolicy]        = useState(null);
  const [premiumAmount, setPremiumAmount] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [processing,    setProcessing]    = useState(false);
  const [done,          setDone]          = useState(false);
  const [error,         setError]         = useState("");

  // Card form state
  const [card, setCard] = useState({
    name:   "",
    number: "",
    expiry: "",
    cvv:    "",
  });

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res  = await fetch("http://localhost:5000/admin/applications");
        const data = await res.json();
        const found = data.find(a => a._id === applicationId);
        setPolicy(found || null);

        // If policyTypeName looks like a MongoDB _id, resolve the real name
        if (found && /^[a-f0-9]{24}$/i.test((found.policyTypeName||"").trim())) {
          try {
            const polRes  = await fetch("http://localhost:5000/admin/policies");
            const polData = await polRes.json();
            const matched = polData.find(p => p._id === found.policyTypeName);
            if (matched) setResolvedPolicyName(matched.policyName);
          } catch (e) { console.log(e); }
        }

        // Fetch premium amount from backend (reliable server-side lookup)
        if (found) {
          try {
            const premRes  = await fetch(`http://localhost:5000/payment/premium/${applicationId}`);
            const premData = await premRes.json();
            setPremiumAmount(premData.premiumAmount || 0);
          } catch (e) { console.log(e); }
        }
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetchApp();
  }, [applicationId]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    // Format card number with spaces
    if (name === "number") value = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    // Format expiry MM/YY
    if (name === "expiry") value = value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
    // CVV max 3 digits
    if (name === "cvv") value = value.replace(/\D/g, "").slice(0, 3);
    setCard(prev => ({ ...prev, [name]: value }));
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");
    if (!card.name || !card.number || !card.expiry || !card.cvv) {
      setError("Please fill in all card details."); return;
    }
    if (card.number.replace(/\s/g, "").length < 16) {
      setError("Please enter a valid 16-digit card number."); return;
    }
    if (card.cvv.length < 3) {
      setError("Please enter a valid 3-digit CVV."); return;
    }

    setProcessing(true);
    try {
      const res  = await fetch(`http://localhost:5000/payment/complete/${applicationId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ amountPaid: premiumAmount || 0 })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setDone(true);
    } catch (e) {
      setError("Server error. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const [resolvedPolicyName, setResolvedPolicyName] = useState("");

  const formatPolicyName = (name, resolved) => {
    if (!name) return "—";
    // If it looks like a MongoDB _id, use resolved name
    if (/^[a-f0-9]{24}$/i.test((name||"").trim())) return resolved || "Insurance Policy";
    const map = {
      housing: "Housing Insurance", health: "Health Insurance",
      vehicle: "Vehicle Insurance", life: "Life Insurance",
      travel: "Travel Insurance",   retirement: "Retirement & Pension Plan",
      child: "Child Education Plan", business: "Business Insurance"
    };
    return map[(name||"").toLowerCase()] || name.charAt(0).toUpperCase() + name.slice(1);
  };

  if (loading) return (
    <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>
  );

  if (!policy) return (
    <div className="text-center mt-5"><h4>Application not found.</h4></div>
  );

  // Success screen
  if (done) return (
    <div className="page-center">
      <div className="auth-box text-center">
        <div style={{ fontSize: 64 }}>✅</div>
        <h3 className="mt-3 mb-1">Payment Successful!</h3>
        <p className="text-muted mb-1">Your policy is now active.</p>
        <p className="text-muted small mb-4">
          Policy: <strong>{formatPolicyName(policy.policyTypeName, resolvedPolicyName)}</strong><br />
          Policy ID: <span className="badge bg-secondary">{policy.policyId}</span>
        </p>
        <button className="btn btn-primary w-100" onClick={() => navigate("/my-policies")}>
          View My Policies
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-center">
      <div className="auth-box">

        <h3 className="auth-title">💳 Payment</h3>

        {/* Policy summary */}
        <div className="card p-3 mb-4" style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
          <p className="mb-1"><strong>Policy:</strong> {formatPolicyName(policy.policyTypeName, resolvedPolicyName)}</p>
          <p className="mb-1"><strong>Policy ID:</strong> <span className="badge bg-secondary">{policy.policyId}</span></p>
          <p className="mb-0"><strong>Applicant:</strong> {policy.firstName} {policy.lastName}</p>
          {premiumAmount && (
            <p className="mb-0 mt-2" style={{ borderTop: "1px solid #dee2e6", paddingTop: 8 }}>
              <strong>Amount to Pay:</strong>{" "}
              <span className="text-success fw-bold" style={{ fontSize: 18 }}>₹{premiumAmount}</span>
            </p>
          )}
        </div>

        {/* Card form */}
        <form onSubmit={handlePay}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Cardholder Name</label>
            <input
              className="form-control"
              name="name"
              placeholder="Name on card"
              value={card.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Card Number</label>
            <input
              className="form-control"
              name="number"
              placeholder="1234 5678 9012 3456"
              value={card.number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row mb-3">
            <div className="col-6">
              <label className="form-label fw-semibold">Expiry Date</label>
              <input
                className="form-control"
                name="expiry"
                placeholder="MM/YY"
                value={card.expiry}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-6">
              <label className="form-label fw-semibold">CVV</label>
              <input
                className="form-control"
                name="cvv"
                placeholder="123"
                value={card.cvv}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

          <button className="btn btn-success w-100 mb-2" disabled={processing}>
            {processing ? "Processing..." : "✅ Confirm Payment"}
          </button>
          <button type="button" className="btn btn-outline-secondary w-100" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </form>

      </div>
    </div>
  );
}