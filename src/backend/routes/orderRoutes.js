import crypto from "crypto";
import express from "express";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import requireAuth from "../middleware/requireAuth.js";
import { sendMail } from "../utils/mailer.js";

const router = express.Router();

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const cleanText = (value) => (typeof value === "string" ? value.trim() : "");
const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);

const getEstimatedDeliveryDate = (fromDate = new Date()) => {
  const deliveryDate = new Date(fromDate);
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  return deliveryDate;
};

const sendOrderConfirmation = async (order) => {
  if (order.confirmationEmailSent) return true;

  if (!order.expectedDeliveryDate) {
    order.expectedDeliveryDate = getEstimatedDeliveryDate();
    await order.save();
  }

  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #eee">${escapeHtml(item.name)} × ${item.quantity}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:right">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join("");
  const deliveryDate = order.expectedDeliveryDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  });

  await sendMail({
    to: order.user,
    subject: `Order confirmed — #${order._id}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#263238">
        <div style="background:#27ae60;color:white;padding:20px;border-radius:8px 8px 0 0">
          <h1 style="margin:0;font-size:22px">Your order is confirmed!</h1>
          <p style="margin:8px 0 0">Thanks for supporting handcrafted goods.</p>
        </div>
        <div style="padding:22px;border:1px solid #e5e7eb;border-top:0">
          <p>Hi ${escapeHtml(order.shippingAddress.name)},</p>
          <p>We've received your payment and your order is now being prepared.</p>
          <p><strong>Order ID:</strong> ${escapeHtml(order._id)}</p>
          <p><strong>Payment:</strong> Paid via ${escapeHtml(order.paymentMethod)} · ₹${order.totalPrice.toFixed(2)}</p>
          <p style="background:#eaf7ef;padding:14px;border-radius:6px"><strong>Expected delivery:</strong> by ${deliveryDate}</p>
          <h2 style="font-size:17px">Order summary</h2>
          <table style="width:100%;border-collapse:collapse">${itemRows}
            <tr><td style="padding:12px 10px"><strong>Total paid</strong></td>
              <td style="padding:12px 10px;text-align:right"><strong>₹${order.totalPrice.toFixed(2)}</strong></td></tr>
          </table>
          <h2 style="font-size:17px;margin-top:24px">Delivering to</h2>
          <p>${escapeHtml(order.shippingAddress.name)}<br>
            ${escapeHtml(order.shippingAddress.address)}<br>
            ${escapeHtml(order.shippingAddress.city)} – ${escapeHtml(order.shippingAddress.zip)}</p>
          <p style="color:#687076;font-size:13px;margin-top:24px">We'll send another update when your order is on its way.</p>
        </div>
      </div>
    `
  });
  order.confirmationEmailSent = true;
  order.confirmationEmailSentAt = new Date();
  await order.save();
  return true;
};

const confirmationDetails = (order, emailSent) => ({
  orderId: order._id.toString(),
  amountPaid: order.totalPrice,
  currency: "INR",
  expectedDeliveryDate: order.expectedDeliveryDate,
  emailSent
});

router.post("/create-payment-order", requireAuth, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return res.status(400).json({ message: "Your cart is empty or has too many items." });
    }

    const requestedItems = new Map();
    for (const item of items) {
      const productId = String(item?._id || "");
      const quantity = Number(item?.quantity);
      if (!mongoose.isValidObjectId(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return res.status(400).json({ message: "Your cart contains an invalid product or quantity." });
      }
      requestedItems.set(productId, (requestedItems.get(productId) || 0) + quantity);
      if (requestedItems.get(productId) > 99) {
        return res.status(400).json({ message: "The quantity for a product cannot exceed 99." });
      }
    }

    const address = {
      name: cleanText(shippingAddress?.name),
      address: cleanText(shippingAddress?.address),
      city: cleanText(shippingAddress?.city),
      zip: cleanText(shippingAddress?.zip)
    };
    if (Object.values(address).some((value) => !value)) {
      return res.status(400).json({ message: "Shipping address is incomplete." });
    }

    const products = await Product.find({ _id: { $in: [...requestedItems.keys()] } });
    if (products.length !== requestedItems.size) {
      return res.status(400).json({ message: "One or more products are no longer available." });
    }

    const orderItems = products.map((product) => {
      const quantity = requestedItems.get(product._id.toString());
      if (quantity > product.stock) {
        throw new Error(`${product.name} has only ${product.stock} item(s) available.`);
      }
      return {
        _id: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity,
        category: product.category || "",
        description: product.description || ""
      };
    });
    const amountPaise = Math.round(orderItems.reduce((total, item) => total + item.price * item.quantity, 0) * 100);
    if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
      return res.status(400).json({ message: "The order total is invalid." });
    }

    const razorpay = getRazorpay();
    const appOrder = await Order.create({
      _id: new mongoose.Types.ObjectId(),
      user: req.authUser.email,
      items: orderItems,
      totalPrice: amountPaise / 100,
      shippingAddress: address,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      status: "Payment Pending"
    });
    const gatewayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: appOrder._id.toString()
    });

    appOrder.razorpayOrderId = gatewayOrder.id;
    await appOrder.save();

    res.status(201).json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: gatewayOrder.id,
      amount: gatewayOrder.amount,
      currency: gatewayOrder.currency,
      appOrderId: appOrder._id.toString(),
      totalPrice: amountPaise / 100
    });
  } catch (error) {
    if (error.message?.includes("has only")) {
      return res.status(409).json({ message: error.message });
    }
    if (error.message?.startsWith("Razorpay is not configured.")) {
      return res.status(503).json({ message: error.message });
    }
    console.error("Payment order creation failed:", error);
    res.status(500).json({ message: "Unable to start payment. Please try again." });
  }
});

router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: signature } = req.body;
    if (![razorpayOrderId, razorpayPaymentId, signature].every((value) => typeof value === "string" && value.length > 0)) {
      return res.status(400).json({ message: "Payment verification details are incomplete." });
    }

    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      return res.status(404).json({ message: "Payment order was not found." });
    }
    if (order.paymentStatus === "paid" && order.razorpayPaymentId === razorpayPaymentId) {
      let emailSent = order.confirmationEmailSent;
      if (!emailSent) {
        try {
          emailSent = await sendOrderConfirmation(order);
        } catch (emailError) {
          console.error(`Order confirmation email failed for ${order._id}:`, emailError);
        }
      }
      return res.json({
        success: true,
        message: emailSent
          ? "Payment verified and order confirmation emailed."
          : "Payment verified. We couldn't send the confirmation email; please contact support.",
        confirmation: confirmationDetails(order, emailSent)
      });
    }
    if (order.paymentStatus !== "pending") {
      return res.status(409).json({ message: "This order is no longer awaiting payment." });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || !process.env.RAZORPAY_KEY_ID) {
      return res.status(500).json({ message: "Razorpay is not configured." });
    }
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const suppliedBuffer = Buffer.from(signature, "hex");
    if (
      expectedBuffer.length !== suppliedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)
    ) {
      return res.status(400).json({ message: "Payment signature could not be verified." });
    }

    const razorpay = getRazorpay();
    let payment = await razorpay.payments.fetch(razorpayPaymentId);
    if (
      payment.order_id !== razorpayOrderId ||
      payment.amount !== Math.round(order.totalPrice * 100) ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({ message: "Payment details do not match this order." });
    }
    if (payment.status === "authorized") {
      payment = await razorpay.payments.capture(razorpayPaymentId, payment.amount, "INR");
    }
    if (payment.status !== "captured") {
      return res.status(402).json({ message: "Payment has not been captured. Please try again." });
    }

    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpayPaymentId;
    order.paymentMethod = payment.method || "razorpay";
    order.status = "Confirmed";
    order.expectedDeliveryDate = getEstimatedDeliveryDate();
    await order.save();

    let emailSent = false;
    try {
      emailSent = await sendOrderConfirmation(order);
    } catch (emailError) {
      console.error(`Order confirmation email failed for ${order._id}:`, emailError);
    }

    res.json({
      success: true,
      message: emailSent
        ? "Payment verified. Your order confirmation has been emailed."
        : "Payment verified and order confirmed, but we couldn't send the email. Please contact support.",
      confirmation: confirmationDetails(order, emailSent)
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({ message: "Unable to verify payment. Please contact support if you were charged." });
  }
});

router.get("/user/:email", requireAuth, async (req, res) => {
  if (req.params.email.toLowerCase() !== req.authUser.email.toLowerCase()) {
    return res.status(403).json({ message: "You can only view your own orders." });
  }
  try {
    const orders = await Order.find({ user: req.authUser.email });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Unable to load orders." });
  }
});

router.post("/:orderId/resend-confirmation", requireAuth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.orderId)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.authUser.email
    });
    if (!order) {
      return res.status(404).json({ message: "Order was not found." });
    }
    if (order.paymentStatus !== "paid") {
      return res.status(409).json({ message: "Order confirmation is available after payment is verified." });
    }

    await sendOrderConfirmation(order);
    res.json({
      success: true,
      message: "Order confirmation email sent.",
      confirmation: confirmationDetails(order, true)
    });
  } catch (error) {
    console.error("Order confirmation resend failed:", error);
    res.status(502).json({ message: "We couldn't send the email. Please try again shortly." });
  }
});

router.get("/", requireAuth, async (req, res) => {
  if (req.authUser.role !== "admin") {
    return res.status(403).json({ message: "Administrator access is required." });
  }
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Unable to load orders." });
  }
});

export default router;
