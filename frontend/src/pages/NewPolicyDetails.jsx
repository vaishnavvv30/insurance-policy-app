import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function NewPolicyDetails() {
  const { policyId } = useParams();
  const navigate = useNavigate();

  const newPolicies = {
travel: {
  title: "PolicyNest Travel Secure Plan",
  overview:
    "Comprehensive travel insurance covering medical emergencies, trip cancellations, baggage loss, and international assistance.",
  eligibility: "Age: 18 - 70 years",
  premium: "Starting from ₹499 per trip",
  benefits: [
    "Medical emergency coverage",
    "Trip cancellation protection",
    "Lost baggage compensation",
    "Passport loss assistance",
    "24/7 global support"
  ],
},

retirement: {
  title: "PolicyNest Retirement & Pension Plan",
  overview:
    "A long-term savings and pension plan ensuring steady income after retirement.",
  eligibility: "Age: 25 - 60 years",
  premium: "Flexible premium options available",
  benefits: [
    "Guaranteed pension income",
    "Tax benefits under Section 80C",
    "Flexible payout options",
    "Life cover included",
    "Loan facility available"
  ],
},

child: {
  title: "PolicyNest Child Education Plan",
  overview:
    "A savings plan designed to secure your child’s higher education and future goals.",
  eligibility: "Parent age: 21 - 50 years",
  premium: "Starting from ₹1,000 per month",
  benefits: [
    "Education fund security",
    "Premium waiver on parent death",
    "Life cover for parent",
    "Maturity benefits",
    "Tax benefits"
  ],
},

business: {
  title: "PolicyNest Business Protection Plan",
  overview:
    "Complete insurance solution for businesses covering assets, liabilities, and employee protection.",
  eligibility: "Registered business entities",
  premium: "Based on business size & risk",
  benefits: [
    "Property damage coverage",
    "Employee insurance coverage",
    "Public liability coverage",
    "Business interruption protection",
    "Risk assessment support"
  ],
},
  };

  const policy = newPolicies[policyId];

  if (!policy) {
    return <h2 className="text-center mt-5">Policy not found</h2>;
  }

  return (
    <div className="page-center">
      <div className="auth-box">
        <h2 className="auth-title">{policy.title}</h2>

        <p>{policy.overview}</p>

        <h5>Key Benefits</h5>
        <ul>
          {policy.benefits.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>

        <button
          className="btn btn-success w-100 mt-3"
          onClick={() => {
          const user = localStorage.getItem("loggedInUser");

          if (!user) {
            alert("Please login to apply for this policy");
            navigate("/login");
            return;
          }

          navigate(`/apply/${policyId}`);
          }}
      >
        Apply Policy
      </button>

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
