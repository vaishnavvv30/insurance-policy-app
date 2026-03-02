import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PolicyDetails() {
  const { policyId } = useParams();
  const navigate = useNavigate();

  const policies = {
    housing: {
      title: "Housing Insurance",
      description:
        "Provides financial protection for your home against damage, loss, fire, and natural disasters.",
      coverage: "Fire, Flood, Earthquake",
      premium: "₹5,000 / year",
      duration: "10 Years"
    },
    health: {
      title: "Health Insurance",
      description:
        "Covers medical expenses including hospitalization, surgeries, and treatments.",
      coverage: "Hospitalization, Surgery, Medicine",
      premium: "₹3,500 / year",
      duration: "5 Years"
    },
    vehicle: {
      title: "Vehicle Insurance",
      description:
        "Protects your vehicle against accidents, theft, and third-party liability.",
      coverage: "Accident, Theft, Third-party",
      premium: "₹2,500 / year",
      duration: "1 Year"
    },
    life: {
      title: "Life Insurance",
      description:
        "Provides financial support to the family in case of death of the policyholder.",
      coverage: "Death benefit",
      premium: "₹6,000 / year",
      duration: "20 Years"
    },

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
  


  const policy = policies[policyId];

  if (!policy) {
    return <h3 className="text-center mt-5">Policy not found</h3>;
  }

  return (
    <div className="page-center">
      <div className="auth-box">
        <h3 className="auth-title">{policy.title}</h3>

        <p>{policy.description}</p>

        <ul>
          <li><strong>Coverage:</strong> {policy.coverage}</li>
          <li><strong>Premium:</strong> {policy.premium}</li>
          <li><strong>Duration:</strong> {policy.duration}</li>
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
          className="btn btn-secondary w-100 mt-2"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
