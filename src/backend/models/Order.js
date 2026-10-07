import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: String, required: true }, // email
    items: [
      {
        _id: String,
        name: String,
        price: Number,
        quantity: Number,
        category: String,
        description: String
      }
    ],
    totalPrice: { type: Number, required: true },
    shippingAddress: {
      name: String,
      address: String,
      city: String,
      zip: String
    },
    paymentMethod: { type: String, default: "card" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String },
    expectedDeliveryDate: { type: Date },
    confirmationEmailSent: { type: Boolean, default: false },
    confirmationEmailSentAt: { type: Date },
    status: { type: String, default: "Payment Pending" },
    orderDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
