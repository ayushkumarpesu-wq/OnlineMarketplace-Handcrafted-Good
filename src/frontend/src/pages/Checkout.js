import React, { useState, useEffect } from "react";
import { useCart } from "../CartContext";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import API_URL from "../api";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => ({
    name: location.state?.checkoutDraft?.name || "",
    email: location.state?.checkoutDraft?.email || localStorage.getItem("email") || "",
    address: location.state?.checkoutDraft?.address || "",
    city: location.state?.checkoutDraft?.city || "",
    zip: location.state?.checkoutDraft?.zip || ""
  }));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [serverTotal, setServerTotal] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [emailRetrying, setEmailRetrying] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    if (!email || !token) {
      navigate("/login", {
        state: {
          returnTo: "/checkout"
        }
      });
      return;
    }

    setFormData(prev => ({ ...prev, email: email || "" }));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const retryConfirmationEmail = async () => {
    if (!confirmation?.orderId) return;

    try {
      setEmailRetrying(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${API_URL}/orders/${confirmation.orderId}/resend-confirmation`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConfirmation(data.confirmation);
      setMessage(data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Couldn't resend the confirmation email. Please try again.");
    } finally {
      setEmailRetrying(false);
    }
  };

  const sanitizeCartForOrder = () =>
    cart
      .filter((item) => item && item._id)
      .map((item) => ({
        _id: String(item._id),
        quantity: Number(item.quantity)
      }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ["name", "email", "address", "city", "zip"];
    const missingField = requiredFields.find((field) => !String(formData[field] || "").trim());

    if (missingField) {
      setMessage("Please fill all required fields");
      return;
    }

    if (cart.length === 0) {
      setMessage("Your cart is empty");
      return;
    }

    const orderItems = sanitizeCartForOrder();
    if (orderItems.length === 0 || orderItems.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
      setMessage("Your cart contains invalid items. Please update your cart and try again.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const orderData = {
        items: orderItems,
        shippingAddress: {
          name: formData.name.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          zip: formData.zip.trim()
        }
      };
      const { data: paymentOrder } = await axios.post(
        `${API_URL}/orders/create-payment-order`,
        orderData,
        { headers }
      );
      setServerTotal(paymentOrder.totalPrice);
      const loaded = await loadRazorpay();
      if (!loaded) {
        throw new Error("Unable to load Razorpay checkout. Check your internet connection and try again.");
      }

      const checkout = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "Handcrafted Goods Marketplace",
        description: "Purchase handcrafted goods",
        order_id: paymentOrder.orderId,
        prefill: {
          name: formData.name.trim(),
          email: formData.email.trim()
        },
        theme: { color: "#27ae60" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage("Payment cancelled. Your cart is still available.");
          }
        },
        handler: async (paymentResponse) => {
          try {
            const { data } = await axios.post(
              `${API_URL}/orders/verify-payment`,
              paymentResponse
            );
            clearCart();
            setMessage(data.message || "Payment verified and order confirmed.");
            setConfirmation(data.confirmation || null);
            setSuccess(true);
          } catch (verificationError) {
            setMessage(
              verificationError.response?.data?.message ||
                "Payment was submitted, but could not be verified. Please contact support before trying again."
            );
          } finally {
            setLoading(false);
          }
        }
      });

      checkout.on("payment.failed", (failure) => {
        setMessage(failure.error?.description || "Payment failed. Please try another payment method.");
        setLoading(false);
      });
      checkout.open();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setLoading(false);
        navigate("/login", {
          state: {
            returnTo: "/checkout",
            checkoutDraft: formData,
            sessionExpired: true
          }
        });
        return;
      }
      setMessage(err.response?.data?.message || err.message || "Unable to start payment.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
        <h2>Payment successful</h2>
        <p>{message}</p>
        {confirmation && (
          <div style={{ maxWidth: 480, margin: "1.5rem auto", padding: "1.25rem", textAlign: "left", backgroundColor: "#f4faf6", border: "1px solid #d6eddd", borderRadius: 8 }}>
            <p><strong>Order ID:</strong> {confirmation.orderId}</p>
            <p><strong>Amount paid:</strong> ₹{Number(confirmation.amountPaid).toFixed(2)}</p>
            {confirmation.expectedDeliveryDate && (
              <p><strong>Expected delivery:</strong> by {new Date(confirmation.expectedDeliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            )}
            <p>
              <strong>Email confirmation:</strong>{" "}
              {confirmation.emailSent ? "Sent to your email" : "Not sent; please contact support"}
            </p>
            {!confirmation.emailSent && (
              <button
                type="button"
                onClick={retryConfirmationEmail}
                disabled={emailRetrying}
                style={{ padding: "0.6rem 1rem", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: 4, cursor: emailRetrying ? "wait" : "pointer" }}
              >
                {emailRetrying ? "Sending..." : "Retry confirmation email"}
              </button>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{ padding: "0.75rem 1.5rem", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Continue shopping
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Checkout</h2>
        <p>Your cart is empty. Add items to continue.</p>
        <a href="/catalog" style={{ color: "#27ae60" }}>Back to Catalog</a>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>Checkout</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Order Summary */}
        <div style={{ borderRight: "1px solid #eee", paddingRight: "2rem" }}>
          <h3>Order Summary</h3>
          <div style={{ marginBottom: "2rem" }}>
            {cart.map((item) => (
              <div key={item._id} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "1rem",
                borderBottom: "1px solid #eee"
              }}>
                <div>
                  <p style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>{item.name}</p>
                  <p style={{ margin: "0", fontSize: "0.9rem", color: "#666" }}>
                    Qty: {item.quantity}
                  </p>
                </div>
                <p style={{ fontWeight: "bold" }}>₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
          
          <div style={{
            borderTop: "2px solid #ddd",
            paddingTop: "1rem"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "1.3rem",
              fontWeight: "bold"
            }}>
              <span>Total:</span>
              <span style={{ color: "#27ae60" }}>₹{serverTotal ?? getTotalPrice()}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Form */}
        <div>
          <h3>Shipping & Payment</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
              />
            </div>

            <p style={{ margin: "0 0 1rem", color: "#555" }}>
              Secure payment by Razorpay. Choose UPI, card, or another available method in the payment window.
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem"
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "1rem",
                backgroundColor: "#27ae60",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? "Waiting for secure payment..." : `Pay securely - ₹${serverTotal ?? getTotalPrice()}`}
            </button>
          </form>

          {message && (
            <p style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
              color: message.includes("✅") ? "#155724" : "#721c24",
              borderRadius: "4px",
              textAlign: "center"
            }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
