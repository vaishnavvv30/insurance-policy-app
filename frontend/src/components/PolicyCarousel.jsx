import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PolicyCarousel.css";

export default function PolicyCarousel() {
  const carouselRef = useRef(null);
  const navigate    = useNavigate();
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res  = await fetch("http://localhost:5000/admin/policies");
        const data = await res.json();
        const valid = data.filter(p => p.policyName && p.premiumAmount);
        setPolicies(valid);
      } catch (e) { console.log(e); }
    };
    fetchPolicies();
  }, []);

  const scrollLeft  = () => carouselRef.current.scrollBy({ left: -320, behavior: "smooth" });
  const scrollRight = () => carouselRef.current.scrollBy({ left:  320, behavior: "smooth" });

  return (
    <>
      {/* 🔵 NEW POLICIES HEADING */}
      <div className="policy-heading-wrapper">
        <h2 className="policy-heading">New Policies</h2>
      </div>

      {/* 🔁 CAROUSEL */}
      <div className="policy-carousel-wrapper">
        <button className="carousel-arrow left" onClick={scrollLeft}>❮</button>

        <div className="policy-carousel" ref={carouselRef}>
          {policies.map(policy => (
            <div className="policy-card" key={policy._id}>
              <h5>{policy.policyName}</h5>
              <p>{policy.description || `Premium: ₹${policy.premiumAmount}`}</p>
              <button
                className="btn btn-primary w-100"
                onClick={() => navigate(`/new-policy/${policy._id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        <button className="carousel-arrow right" onClick={scrollRight}>❯</button>
      </div>
    </>
  );
}