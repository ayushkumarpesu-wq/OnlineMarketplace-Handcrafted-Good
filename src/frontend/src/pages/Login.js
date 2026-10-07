import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const location = useLocation();
  const [formData, setFormData] = useState(() => ({
    email: localStorage.getItem("email") || "",
    password: ""
  }));
  const [message, setMessage] = useState(
    location.state?.sessionExpired
      ? "Your session expired. Log in and verify the OTP to continue checkout."
      : ""
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);

      setMessage(res.data.message || "OTP sent to your email!");
      localStorage.setItem("email", formData.email.trim().toLowerCase());
      localStorage.removeItem("token");

      setTimeout(() => navigate("/verify-otp", { state: location.state }), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
      <h2 style={{ textAlign: "center" }}>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10, boxSizing: "border-box" }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10, boxSizing: "border-box" }}
        />
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading ? "Sending OTP..." : "Login"}
        </button>
      </form>

      {message && <p style={{ marginTop: 10, textAlign: "center" }}>{message}</p>}

      <p style={{ textAlign: "center", marginTop: 12 }}>
        Don't have an account? <a href="/register">Register here</a>
      </p>
      <p style={{ textAlign: "center", marginTop: 12 }}>
        <a href="/forgot-password">Forgot Password?</a>
      </p>
    </div>
  );
}
