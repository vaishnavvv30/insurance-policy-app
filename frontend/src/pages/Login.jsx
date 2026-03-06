import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

console.log("LOGIN RESPONSE:", data);

    if (!res.ok) {
      alert(data.message);
      return;
    }

    // Save user in localStorage
    localStorage.setItem("loggedInUser", JSON.stringify(data));

    alert("Login successful!");

    if (data.role === "admin") {
      navigate("/admin");
    } else if (data.role === "employee") {
      navigate("/employee");
    } else {
      navigate("/client");
    }

  } catch (error) {
    console.log(error);
    alert("Server error");
  }
};

return (
  <div className="page-center">
    <div className="auth-box">
      <h3 className="auth-title">Login</h3>

      <form onSubmit={handleLogin}>
        <input
          className="form-control mb-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="form-control mb-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn btn-primary w-100">
          Log in
        </button>
      </form>

      <p className="mt-3">
        <a href="#">Forgot password?</a>
      </p>
    </div>
  </div>
);

}
