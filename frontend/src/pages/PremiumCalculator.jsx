import React, { useState } from "react";

export default function PremiumCalculator() {
  const [policyType, setPolicyType] = useState("life");
  const [age, setAge] = useState("");
  const [sumAssured, setSumAssured] = useState("");
  const [duration, setDuration] = useState("");
  const [premium, setPremium] = useState(null);

  const calculatePremium = () => {
    let rate = 0;

    if (policyType === "life") rate = 5;
    else if (policyType === "travel") rate = 3;
    else if (policyType === "health") rate = 4;
    else if (policyType === "housing") rate = 2;

    let basePremium = (sumAssured * rate) / 1000;

    // Age Loading
    if (age >= 25 && age <= 40) {
      basePremium += basePremium * 0.1;
    } else if (age > 40) {
      basePremium += basePremium * 0.2;
    }

    // Duration Loading
    basePremium += duration * 100;

    setPremium(basePremium.toFixed(2));
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Premium Calculator</h2>

      <div className="card p-4 shadow">
        <div className="mb-3">
          <label>Policy Type</label>
          <select
            className="form-control"
            value={policyType}
            onChange={(e) => setPolicyType(e.target.value)}
          >
            <option value="life">Life Insurance</option>
            <option value="travel">Travel Insurance</option>
            <option value="health">Health Insurance</option>
            <option value="housing">Housing Insurance</option>
          </select>
        </div>

        <div className="mb-3">
          <label>Age</label>
          <input
            type="number"
            className="form-control"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label>Sum Assured (₹)</label>
          <input
            type="number"
            className="form-control"
            value={sumAssured}
            onChange={(e) => setSumAssured(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label>Duration (Years)</label>
          <input
            type="number"
            className="form-control"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        <button className="btn btn-primary w-100" onClick={calculatePremium}>
          Calculate Premium
        </button>

        {premium && (
          <div className="alert alert-success mt-3 text-center">
            Estimated Annual Premium: ₹ {premium}
          </div>
        )}
      </div>
    </div>
  );
}