import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Step 1 → enter email  → OTP sent to email
// Step 2 → enter 6-digit OTP
// Step 3 → enter new password + confirm
// Step 4 → success

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step,        setStep]        = useState(1);
  const [email,       setEmail]       = useState("");
  const [otp,         setOtp]         = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  /* ── start 60s resend countdown ── */
  const startTimer = () => {
    setResendTimer(60);
    const t = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  /* ── Step 1: send OTP ── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/forgot-password/send-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setStep(2);
      startTimer();
    } catch (e) {
      setError("Server error. Please try again.");
    } finally { setLoading(false); }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/forgot-password/send-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      startTimer();
      setOtp("");
    } catch (e) {
      setError("Server error.");
    } finally { setLoading(false); }
  };

  /* ── Step 2: verify OTP ── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) { setError("Please enter the 6-digit code."); return; }
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/forgot-password/verify-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, code: otp })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setStep(3);
    } catch (e) {
      setError("Server error. Please try again.");
    } finally { setLoading(false); }
  };

  /* ── Step 3: reset password ── */
  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/forgot-password/reset", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, code: otp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setStep(4);
    } catch (e) {
      setError("Server error. Please try again.");
    } finally { setLoading(false); }
  };

  /* ── Progress indicator ── */
  const steps = ["Email", "Verify Code", "New Password"];

  return (
    <div className="page-center">
      <div className="auth-box">

        {/* Progress bar — only show on steps 1-3 */}
        {step <= 3 && (
          <div className="d-flex justify-content-center gap-2 mb-4">
            {steps.map((label, i) => (
              <div key={i} className="d-flex align-items-center gap-1">
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  backgroundColor: step > i + 1 ? "#198754" : step === i + 1 ? "#0d6efd" : "#dee2e6",
                  color: step >= i + 1 ? "#fff" : "#6c757d",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: "bold"
                }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 11, color: step === i + 1 ? "#0d6efd" : "#6c757d" }}>
                  {label}
                </span>
                {i < steps.length - 1 && (
                  <div style={{ width: 20, height: 2, backgroundColor: step > i + 1 ? "#198754" : "#dee2e6", marginLeft: 4 }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Step 1: Enter Email ── */}
        {step === 1 && (
          <>
            <h3 className="auth-title">Forgot Password</h3>
            <p className="text-muted text-center mb-3" style={{ fontSize: 14 }}>
              Enter your registered email and we'll send you a reset code.
            </p>
            <form onSubmit={handleSendOtp}>
              <input
                className="form-control mb-3"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Code →"}
              </button>
            </form>
            <p className="mt-3 text-center">
              <span
                style={{ color: "#0d6efd", cursor: "pointer", fontSize: 14 }}
                onClick={() => navigate("/login")}
              >
                ← Back to Login
              </span>
            </p>
          </>
        )}

        {/* ── Step 2: Enter OTP ── */}
        {step === 2 && (
          <>
            <h3 className="auth-title">Enter Code</h3>
            <p className="text-muted text-center mb-3" style={{ fontSize: 14 }}>
              We sent a 6-digit code to <strong>{email}</strong>.<br />
              Check your inbox (and spam folder).
            </p>
            <form onSubmit={handleVerifyOtp}>
              <input
                className="form-control mb-3 text-center"
                style={{ fontSize: 28, fontWeight: "bold", letterSpacing: 10 }}
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                required
              />
              {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
              <button className="btn btn-primary w-100 mb-3" disabled={loading}>
                {loading ? "Verifying..." : "Verify Code →"}
              </button>
            </form>

            {/* Resend */}
            <div className="text-center" style={{ fontSize: 13 }}>
              {resendTimer > 0 ? (
                <span className="text-muted">Resend code in {resendTimer}s</span>
              ) : (
                <span
                  style={{ color: "#0d6efd", cursor: "pointer" }}
                  onClick={handleResend}
                >
                  {loading ? "Sending..." : "Resend Code"}
                </span>
              )}
            </div>

            <p className="mt-3 text-center">
              <span
                style={{ color: "#6c757d", cursor: "pointer", fontSize: 13 }}
                onClick={() => { setStep(1); setOtp(""); setError(""); }}
              >
                ← Change Email
              </span>
            </p>
          </>
        )}

        {/* ── Step 3: New Password ── */}
        {step === 3 && (
          <>
            <h3 className="auth-title">New Password</h3>
            <p className="text-muted text-center mb-3" style={{ fontSize: 14 }}>
              Set a strong new password for your account.
            </p>
            <form onSubmit={handleReset}>
              <input
                className="form-control mb-3"
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <input
                className="form-control mb-3"
                type="password"
                placeholder="Confirm New Password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
              {/* Password strength hint */}
              {newPassword && (
                <div className="mb-3">
                  <div className="progress" style={{ height: 6 }}>
                    <div
                      className={`progress-bar ${newPassword.length < 6 ? "bg-danger" : newPassword.length < 10 ? "bg-warning" : "bg-success"}`}
                      style={{ width: `${Math.min((newPassword.length / 12) * 100, 100)}%` }}
                    />
                  </div>
                  <small className="text-muted">
                    {newPassword.length < 6 ? "Too short" : newPassword.length < 10 ? "Medium strength" : "Strong password ✓"}
                  </small>
                </div>
              )}
              {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {/* ── Step 4: Success ── */}
        {step === 4 && (
          <div className="text-center py-2">
            <div style={{ fontSize: 60 }}>✅</div>
            <h4 className="mt-3 mb-1">Password Reset!</h4>
            <p className="text-muted mb-4">Your password has been updated successfully.</p>
            <button className="btn btn-primary w-100" onClick={() => navigate("/login")}>
              Go to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}