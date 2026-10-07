import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || otp.trim().length !== 6) {
      setMessage("Please enter the 6-digit OTP sent to your email.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });

      localStorage.setItem("token", res.data.token);
      setMessage("✅ OTP verified successfully!");

      const returnTo = location.state?.returnTo || "/catalog";
      const checkoutDraft = location.state?.checkoutDraft;
      setTimeout(
        () => navigate(returnTo, { state: checkoutDraft ? { checkoutDraft } : undefined }),
        1000
      );
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid or expired OTP.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const requestNewOtp = () => {
    setOtp("");
    navigate("/login", { state: location.state });
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
      <h2 style={{ textAlign: "center" }}>Verify OTP</h2>
      <p style={{ textAlign: "center", color: "#666", fontSize: "0.9rem" }}>
        📧 Enter the latest OTP from your email. Codes expire after 5 minutes.
      </p>

      <form onSubmit={handleVerify}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          disabled
          style={{ width: "100%", padding: 10, marginBottom: 10, boxSizing: "border-box", backgroundColor: "#f5f5f5" }}
        />
        <input
          type="text"
          placeholder="Enter 6-digit OTP code"
          aria-label="Enter 6-digit OTP code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10, boxSizing: "border-box" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold"
          }}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
      {message && (
        <p style={{
          marginTop: 10,
          textAlign: "center",
          padding: "10px",
          backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
          color: message.includes("✅") ? "#155724" : "#721c24",
          borderRadius: "4px"
        }}>
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={requestNewOtp}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 10,
          padding: 10,
          backgroundColor: "white",
          color: "#27ae60",
          border: "1px solid #27ae60",
          borderRadius: 4,
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        Code expired or invalid? Log in to get a new OTP
      </button>
    </div>
  );
}
