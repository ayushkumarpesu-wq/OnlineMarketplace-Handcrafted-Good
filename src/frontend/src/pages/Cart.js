import React, { useEffect } from "react";
import { useCart } from "../CartContext";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");
    
    if (!email || !token) {
      navigate("/login");
    }
  }, [navigate]);

  if (cart.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Your Cart is Empty</h2>
        <p>Start shopping to add items to your cart.</p>
        <Link to="/catalog" style={{ color: "#27ae60", textDecoration: "none", fontSize: "1.1rem" }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h2>Shopping Cart</h2>
      
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: "1rem", textAlign: "left" }}>Product</th>
            <th style={{ padding: "1rem", textAlign: "center" }}>Price</th>
            <th style={{ padding: "1rem", textAlign: "center" }}>Quantity</th>
            <th style={{ padding: "1rem", textAlign: "center" }}>Subtotal</th>
            <th style={{ padding: "1rem", textAlign: "center" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item._id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "1rem" }}>
                <div>
                  <strong>{item.name}</strong>
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem", color: "#666" }}>
                    {item.category}
                  </p>
                </div>
              </td>
              <td style={{ padding: "1rem", textAlign: "center" }}>₹{item.price}</td>
              <td style={{ padding: "1rem", textAlign: "center" }}>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                  style={{
                    width: "60px",
                    padding: "0.5rem",
                    textAlign: "center",
                    border: "1px solid #ddd",
                    borderRadius: "4px"
                  }}
                />
              </td>
              <td style={{ padding: "1rem", textAlign: "center", fontWeight: "bold" }}>
                ₹{item.price * item.quantity}
              </td>
              <td style={{ padding: "1rem", textAlign: "center" }}>
                <button
                  onClick={() => removeFromCart(item._id)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#e74c3c",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "2px solid #ddd",
        paddingTop: "1rem",
        marginBottom: "2rem"
      }}>
        <div>
          <h3>Total: ₹{getTotalPrice()}</h3>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={clearCart}
            style={{
              padding: "0.7rem 1.5rem",
              backgroundColor: "#95a5a6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            Clear Cart
          </button>
          <Link to="/checkout">
            <button
              style={{
                padding: "0.7rem 1.5rem",
                backgroundColor: "#27ae60",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              Proceed to Checkout
            </button>
          </Link>
        </div>
      </div>

      <Link to="/catalog" style={{ color: "#27ae60", textDecoration: "none" }}>
        ← Continue Shopping
      </Link>
    </div>
  );
};

export default Cart;
