import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const isLoggedIn = localStorage.getItem("email") && localStorage.getItem("token");
  
  return (
    <div style={{ textAlign: "center", marginTop: "2rem", padding: "2rem" }}>
      <h1>Welcome to Ayush Handcrafted Goods Marketplace 🛍</h1>
      <p style={{ fontSize: "1.1rem", color: "#666", marginBottom: "2rem" }}>
        Discover beautiful handcrafted products made with love by local artisans
      </p>
      
      {!isLoggedIn ? (
        <div>
          <p style={{ marginBottom: "2rem", fontSize: "1rem", color: "#555" }}>
            Please register or login to browse and purchase products
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register">
              <button style={{ 
                marginTop: "1rem", 
                padding: "12px 30px",
                backgroundColor: "#27ae60",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "bold"
              }}>
                Register Here
              </button>
            </Link>
            <Link to="/login">
              <button style={{ 
                marginTop: "1rem", 
                padding: "12px 30px",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "bold"
              }}>
                Login Here
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <Link to="/catalog">
          <button style={{ 
            marginTop: "1rem", 
            padding: "12px 30px",
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold"
          }}>
            Shop Now →
          </button>
        </Link>
      )}
    </div>
  );
};

export default Home;
