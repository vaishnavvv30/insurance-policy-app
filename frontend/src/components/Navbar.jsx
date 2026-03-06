import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const isLoggedIn = !!loggedUser;

  const [search, setSearch] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/policies?search=${search}`);
  };

  // ✅ NEW: Dashboard Redirect Logic
  const handleDashboard = () => {
    if (!loggedUser) {
      navigate("/login");
      return;
    }

    if (loggedUser.role === "admin") {
      navigate("/admin");
    } else if (loggedUser.role === "employee") {
      navigate("/employee");
    } else {
      navigate("/client");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3">
      
      {/* LEFT: LOGO */}
      <Link className="navbar-brand fw-bold" to="/">
        PolicyNest
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarContent">
        
        {/* LEFT LINKS */}
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/about">About Us</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/contact">Contact Us</Link>
          </li>

          
          
          {/* ✅ Added Dashboard */}
          {isLoggedIn && (
            <li className="nav-item">
              <button
                className="nav-link btn btn-link text-white"
                onClick={handleDashboard}
                style={{ textDecoration: "none" }}
              >
                Dashboard
              </button>
            </li>
          )}

          <li className="nav-item">
  <Link className="nav-link" to="/premium-calculator">
    Premium Calculator
  </Link>
</li>
        </ul>

        {/* 🔍 CENTER SEARCH BAR */}
        <form className="d-flex mx-auto navbar-search" onSubmit={handleSearch}>
          <input
            className="form-control"
            type="search"
            placeholder="Search policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "400px" }}
          />
        </form>

        {/* RIGHT AUTH BUTTONS */}
        <ul className="navbar-nav ms-auto">
          {!isLoggedIn ? (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">Register</Link>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <button className="nav-link btn btn-link text-white" onClick={handleLogout}>
                Logout
              </button>
            </li>
          )}
        </ul>

      </div>
    </nav>
  );
}