import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strength, setStrength] = useState(0);

  const navigate = useNavigate();

  const checkStrength = (value) => {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    setStrength(score);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (strength < 3) {
      alert("Password is too weak");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name,   
          email,
          password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Registration successful!");
      navigate("/login");

    } catch (error) {
      alert("Server error");
    }
  };

  return (
    <div className="page-center">
      <div className="auth-box">
        <h3 className="auth-title">Register</h3>

        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-3"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="form-control mb-3"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="form-control mb-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              checkStrength(e.target.value);
            }}
            required
          />

          <div className="progress mb-2" style={{ height: "8px" }}>
            <div
              className={`progress-bar ${
                strength <= 1
                  ? "bg-danger"
                  : strength <= 3
                  ? "bg-warning"
                  : "bg-success"
              }`}
              style={{ width: `${(strength / 4) * 100}%` }}
            />
          </div>

          <p className="mb-2">
            Password strength:{" "}
            {strength <= 1 && <span className="text-danger">Weak</span>}
            {strength > 1 && strength <= 3 && (
              <span className="text-warning">Medium</span>
            )}
            {strength > 3 && <span className="text-success">Strong</span>}
          </p>

          <input
            className="form-control mb-3"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button className="btn btn-primary w-100">
            Register
          </button>
        </form>

        <p className="text-center mt-3">
          Already have an account?{" "}
          <span
            style={{ cursor: "pointer", color: "blue" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}