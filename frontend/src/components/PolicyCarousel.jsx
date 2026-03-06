import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./PolicyCarousel.css";

export default function PolicyCarousel() {
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  const scrollLeft = () => {
    carouselRef.current.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRight = () => {
    carouselRef.current.scrollBy({ left: 320, behavior: "smooth" });
  };

  return (
    <>
      {/* 🔵 NEW POLICIES HEADING */}
      <div className="policy-heading-wrapper">
        <h2 className="policy-heading">New Policies</h2>
      </div>

      {/* 🔁 CAROUSEL */}
      <div className="policy-carousel-wrapper">
        {/* LEFT ARROW */}
        <button className="carousel-arrow left" onClick={scrollLeft}>
          ❮
        </button>

        {/* CAROUSEL CONTENT */}
        <div className="policy-carousel" ref={carouselRef}>
          <div className="policy-card">
            <h5>Travel Insurance</h5>
            <p>Comprehensive coverage for safe and worry-free journeys.</p>
            <button
              className="btn btn-primary w-100"
              onClick={() => navigate("/new-policy/travel")}
            >
              View Details
            </button>
          </div>

          <div className="policy-card">
            <h5>Retirement/Pension Plan</h5>
            <p>Secure your retirement life with guaranteed income.</p>
            <button
              className="btn btn-primary w-100"
              onClick={() => navigate("/new-policy/retirement")}
            >
              View Details
            </button>
          </div>

          <div className="policy-card">
            <h5>Child Education Plan</h5>
            <p>Ensure your child’s education and future aspirations.</p>
            <button
              className="btn btn-primary w-100"
              onClick={() => navigate("/new-policy/child")}
            >
              View Details
            </button>
          </div>

          <div className="policy-card">
            <h5>Business Insurance</h5>
            <p>Protect your business assets and operations.</p>
            <button
              className="btn btn-primary w-100"
              onClick={() => navigate("/new-policy/business")}
            >
              View Details
            </button>
          </div>
        </div>

        {/* RIGHT ARROW */}
        <button className="carousel-arrow right" onClick={scrollRight}>
          ❯
        </button>
      </div>
    </>
  );
}