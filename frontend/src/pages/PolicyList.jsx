import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PolicyMarquee from "../components/PolicyMarquee";
import PolicyCarousel from "../components/PolicyCarousel";

export default function PolicyList() {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const searchTerm = query.get("search")?.toLowerCase() || "";

  // 🔍 Search helper
  const matchesSearch = (title, desc) => {
    return (
      title.toLowerCase().includes(searchTerm) ||
      desc.toLowerCase().includes(searchTerm)
    );
  };

  return (
    <>
      {/* 🔹 Show Marquee & Carousel ONLY if not searching */}
      {!searchTerm && <PolicyMarquee />}
      {!searchTerm && <PolicyCarousel />}

      <div className="container mt-4 main-content">

        {/* 🔹 Show Popular Policies title only if NOT searching */}
        {!searchTerm && (
          <h2 className="text-white mb-4 bg-primary d-inline-block px-3 py-2 rounded">
            Popular Policies
          </h2>
        )}

        {/* 🔹 Show Search Results title when searching */}
        {searchTerm && (
          <h2 className="text-white mb-4 bg-primary d-inline-block px-3 py-2 rounded">
            Search Results
          </h2>
        )}

        <div className="row">

          {/* Housing Insurance */}
          {matchesSearch("Housing Insurance", "Protect your home from damages.") && (
            <div className="col-md-4 mb-4">
              <div className="card shadow h-100 policy-card">
                <img src="/images/HousePolicy.png" className="card-img-top" alt="Housing" />
                <div className="card-body">
                  <h5>Housing Insurance</h5>
                  <p>Protect your home from damages.</p>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => navigate("/policy/housing")}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Health Insurance */}
          {matchesSearch("Health Insurance", "Covers medical and hospitalization expenses.") && (
            <div className="col-md-4 mb-4">
              <div className="card shadow h-100 policy-card">
                <img src="/images/HealthPolicy.jpg" className="card-img-top" alt="Health" />
                <div className="card-body">
                  <h5>Health Insurance</h5>
                  <p>Covers medical and hospitalization expenses.</p>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => navigate("/policy/health")}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Insurance */}
          {matchesSearch("Vehicle Insurance", "Protection against accidents and theft.") && (
            <div className="col-md-4 mb-4">
              <div className="card shadow h-100 policy-card">
                <img src="/images/VehiclePolicy.jpg" className="card-img-top" alt="Vehicle" />
                <div className="card-body">
                  <h5>Vehicle Insurance</h5>
                  <p>Protection against accidents and theft.</p>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => navigate("/policy/vehicle")}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Life Insurance */}
          {matchesSearch("Life Insurance", "Financial security for your family.") && (
            <div className="col-md-4 mb-4">
              <div className="card shadow h-100 policy-card">
                <img src="/images/LifePolicy.jfif" className="card-img-top" alt="Life" />
                <div className="card-body">
                  <h5>Life Insurance</h5>
                  <p>Financial security for your family.</p>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => navigate("/policy/life")}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Travel Insurance */}
          {matchesSearch("Travel Insurance", "Comprehensive coverage for safe journeys worldwide.") && (
            <div className="col-md-4 mb-4">
              <div className="card shadow h-100 policy-card">
                <img src="/images/TravelPolicy.jfif" className="card-img-top" alt="Travel" />
                <div className="card-body">
                  <h5>Travel Insurance</h5>
                  <p>Comprehensive coverage for safe journeys worldwide.</p>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => navigate("/policy/travel")}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Retirement Plan */}
          {matchesSearch("Retirement & Pension Plan", "Secure income after retirement with pension benefits.") && (
            <div className="col-md-4 mb-4">
              <div className="card shadow h-100 policy-card">
                <img src="/images/RetirementPolicy.jfif" className="card-img-top" alt="Retirement" />
                <div className="card-body">
                  <h5>Retirement & Pension Plan</h5>
                  <p>Secure income after retirement with pension benefits.</p>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => navigate("/policy/retirement")}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Child Plan */}
          {matchesSearch("Child Education Plan", "Secure your child’s education and future goals.") && (
            <div className="col-md-4 mb-4">
              <div className="card shadow h-100 policy-card">
                <img src="/images/EducationPolicy.jfif" className="card-img-top" alt="Child" />
                <div className="card-body">
                  <h5>Child Education Plan</h5>
                  <p>Secure your child’s education and future goals.</p>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => navigate("/policy/child")}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Business Insurance */}
          {matchesSearch("Business Insurance", "Complete protection for your business assets.") && (
            <div className="col-md-4 mb-4">
              <div className="card shadow h-100 policy-card">
                <img src="/images/BuisnessPolicy.jfif" className="card-img-top" alt="Business" />
                <div className="card-body">
                  <h5>Buisness Insurance</h5>
                  <p>Complete protection for your business assets.</p>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => navigate("/policy/business")}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No Results */}
          {searchTerm &&
            ![
              matchesSearch("Housing Insurance", "Protect your home from damages."),
              matchesSearch("Health Insurance", "Covers medical and hospitalization expenses."),
              matchesSearch("Vehicle Insurance", "Protection against accidents and theft."),
              matchesSearch("Life Insurance", "Financial security for your family."),
              matchesSearch("Travel Insurance", "Comprehensive coverage for safe journeys worldwide."),
              matchesSearch("Retirement & Pension Plan", "Secure income after retirement with pension benefits."),
              matchesSearch("Child Education Plan", "Secure your child’s education and future goals."),
              matchesSearch("Business Insurance", "Complete protection for your business assets.")
            ].some(Boolean) && (
              <div className="col-12 text-center">
                <h5>No policies found</h5>
              </div>
            )}

        </div>
      </div>
    </>
  );
}