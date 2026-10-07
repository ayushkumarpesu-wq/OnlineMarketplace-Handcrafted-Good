import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
  });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      setMsg("Registered successfully ✅");

      localStorage.setItem("email", form.email);
      localStorage.removeItem("token");

      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error during registration ❌");
    }
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: "60px auto", padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
      <h2>Create Account</h2>
      <form onSubmit={submit}>
        <div className="form-row" style={{ marginBottom: 10 }}>
          <input
            className="input"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={change}
            required
            style={{ width: "100%", padding: 10, boxSizing: "border-box" }}
          />
        </div>
        <div className="form-row" style={{ marginBottom: 10 }}>
          <input
            className="input"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={change}
            required
            style={{ width: "100%", padding: 10, boxSizing: "border-box" }}
          />
        </div>
        <div className="form-row" style={{ marginBottom: 10 }}>
          <input
            className="input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={change}
            required
            style={{ width: "100%", padding: 10, boxSizing: "border-box" }}
          />
        </div>
        <div className="form-row" style={{ marginBottom: 10 }}>
          <select
            name="role"
            className="select"
            value={form.role}
            onChange={change}
            style={{ width: "100%", padding: 10, boxSizing: "border-box" }}
          >
            <option value="buyer">Buyer</option>
            <option value="artisan">Artisan</option>
          </select>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button className="btn" type="submit" style={{ padding: "10px 20px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
            Register
          </button>
        </div>
      </form>
      {msg && (
        <p className={`msg ${msg.toLowerCase().includes("success") ? "ok" : "err"}`} style={{ marginTop: 10, textAlign: "center" }}>
          {msg}
        </p>
      )}
      <p className="helper" style={{ textAlign: "center", marginTop: 12 }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}
