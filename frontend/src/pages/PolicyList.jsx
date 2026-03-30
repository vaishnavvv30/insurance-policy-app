import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PolicyMarquee  from "../components/PolicyMarquee";
import PolicyCarousel from "../components/PolicyCarousel";

export default function PolicyList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res  = await fetch("http://localhost:5000/admin/policies");
        const data = await res.json();
        // Only show admin-created policies
        // Exclude: policies where policyName looks like a MongoDB _id (24-char hex)
        // Exclude: policies where policyName is a known type key (housing/health etc)
        // Exclude: policies with no description AND no coverage (user-applied leftovers)
        const knownTypes   = ["housing","health","vehicle","life","travel","retirement","child","business"];
        const isMongoId    = (str) => /^[a-f0-9]{24}$/i.test((str || "").trim());
        const isKnownType  = (str) => knownTypes.includes((str || "").toLowerCase().trim());
        const valid = data.filter(p =>
          p.policyName &&
          p.premiumAmount &&
          !isMongoId(p.policyName) &&
          !isKnownType(p.policyName) &&
          (p.description || p.coverage || p.duration)  // must have at least one real field
        );
        setPolicies(valid);
      } catch (e) { console.log(e); }
    };
    fetchPolicies();
  }, []);

  const query      = new URLSearchParams(location.search);
  const searchTerm = query.get("search")?.toLowerCase() || "";

  const filtered = policies.filter(p =>
    !searchTerm ||
    (p.policyName   || "").toLowerCase().includes(searchTerm) ||
    (p.description  || "").toLowerCase().includes(searchTerm) ||
    (p.coverage     || "").toLowerCase().includes(searchTerm)
  );

  return (
    <>
      {!searchTerm && <PolicyMarquee />}
      {!searchTerm && <PolicyCarousel />}

      <div className="container mt-4 main-content">

        {!searchTerm && (
          <h2 className="text-white mb-4 bg-primary d-inline-block px-3 py-2 rounded">
            Existing Policies
          </h2>
        )}

        {searchTerm && (
          <h2 className="text-white mb-4 bg-primary d-inline-block px-3 py-2 rounded">
            Search Results
          </h2>
        )}

        <div className="row">
          {filtered.map(policy => (
            <div className="col-md-4 mb-4" key={policy._id}>
              <div className="card shadow h-100 policy-card">
                <div className="card-body">
                  <h5>{policy.policyName}</h5>
                  <p className="text-muted">{policy.description || `Coverage: ${policy.coverage || "—"}`}</p>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => navigate(`/policy/${policy._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && searchTerm && (
            <div className="col-12 text-center">
              <h5>No policies found for "{searchTerm}"</h5>
            </div>
          )}

          {filtered.length === 0 && !searchTerm && (
            <div className="col-12 text-center text-muted">
              <p>No policies available yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}