import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";

const productImageFallbacks = {
  "Handmade Wooden Bowl": "/images/wooden-bowl.svg",
  "Macrame Wall Hanging": "/images/macrame-wall-hanging.svg",
  "Ceramic Vase": "/images/ceramic-vase.svg",
  "Hand-painted Mug": "/images/hand-painted-mug.svg",
  "Woven Basket": "/images/woven-basket.svg",
  "Beaded Bracelet": "/images/beaded-bracelet.svg",
  default: "/images/handcrafted-default.svg"
};

const getProductImage = (product) => {
  if (!product || !product.name) {
    return productImageFallbacks.default;
  }

  if (product.image && !product.image.includes("images.unsplash.com")) {
    return product.image;
  }

  return productImageFallbacks[product.name] || productImageFallbacks.default;
};

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");
    
    if (!email || !token) {
      // Not logged in - redirect to login
      navigate("/login");
      return;
    }
    
    setIsLoggedIn(true);
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:5000/api/products");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>⚠️ Access Restricted</h2>
        <p>Please login first to view products.</p>
      </div>
    );
  }

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading products...</div>;
  if (error) return <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2>Product Catalog</h2>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
      
      {products.length === 0 ? (
        <p>No products available. <a href="/">Go back home</a></p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
          {products.map((product) => (
            <div key={product._id} style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 8px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
            }}
            >
              <div style={{
                width: "100%",
                height: "200px",
                overflow: "hidden",
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <img 
                  src={getProductImage(product)}
                  alt={product.name}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    backgroundColor: "#f7f7f7"
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getProductImage({ name: product.name, image: null });
                  }}
                />
              </div>
              
              <div style={{ padding: "1rem", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>{product.name}</h3>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#666", lineHeight: "1.4" }}>
                  {product.description}
                </p>
                
                <div style={{ margin: "0.5rem 0", display: "flex", gap: "1rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "#999", backgroundColor: "#f0f0f0", padding: "0.25rem 0.5rem", borderRadius: "3px" }}>
                    {product.category}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: product.stock > 0 ? "#27ae60" : "#e74c3c" }}>
                    {product.stock > 0 ? `In Stock: ${product.stock}` : "Out of Stock"}
                  </span>
                </div>
                
                <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: "1rem", alignSelf: "stretch" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#27ae60" }}>
                    ₹{product.price}
                  </span>
                  <button
                    onClick={() => {
                      addToCart(product);
                      alert(`${product.name} added to cart!`);
                    }}
                    disabled={product.stock === 0}
                    style={{
                      padding: "0.6rem 1.2rem",
                      backgroundColor: product.stock === 0 ? "#ccc" : "#27ae60",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: product.stock === 0 ? "not-allowed" : "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (product.stock > 0) e.target.style.backgroundColor = "#229954";
                    }}
                    onMouseLeave={(e) => {
                      if (product.stock > 0) e.target.style.backgroundColor = "#27ae60";
                    }}
                  >
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalog;
