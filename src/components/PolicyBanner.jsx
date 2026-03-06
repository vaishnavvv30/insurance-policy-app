import React from "react";
import "./PolicyBanner.css";

export default function PolicyBanner() {
  const policies = [
    { name: "Life Insurance", img: "/images/LifePolicy.jfif" },
    { name: "Health Insurance", img: "/images/HealthPolicy.jpg" },
    { name: "Vehicle Insurance", img: "/images/VehiclePolicy.jpg" },
    { name: "Housing Insurance", img: "/images/House.jpg" },
    { name: "Travel Insurance", img: "/images/Travel.jpg" }
  ];

  return (
    <div className="policy-banner-container">
      <div className="policy-banner-track">
        {[...policies, ...policies].map((policy, index) => (
          <div className="policy-banner-item" key={index}>
            <img src={policy.img} alt={policy.name} />
            <h5>{policy.name}</h5>
            <p>Secure your future today</p>
          </div>
        ))}
      </div>
    </div>
  );
}