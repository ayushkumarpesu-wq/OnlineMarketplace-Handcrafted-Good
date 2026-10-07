// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./database/connection.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { sendMail } from "./utils/mailer.js";
import Product from "./models/Product.js";

// ✅ Correct dotenv setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// Debug info
console.log("🧠 Working Directory:", process.cwd());
console.log("📦 .env Path:", path.join(__dirname, ".env"));
console.log("🧾 SMTP_USER:", process.env.SMTP_USER);
console.log("🧾 SMTP_PASS:", process.env.SMTP_PASS ? "(password OK)" : "(missing password)");

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

const defaultProducts = [
  {
    name: "Handmade Wooden Bowl",
    description: "Beautifully crafted wooden bowl made by local artisans. Perfect for home decor and everyday use.",
    price: 450,
    category: "Home Decor",
    stock: 20,
    image: "/images/wooden-bowl.svg"
  },
  {
    name: "Macrame Wall Hanging",
    description: "Elegant macrame wall hanging for home interiors. Handwoven with natural cotton fibers.",
    price: 850,
    category: "Decor",
    stock: 15,
    image: "/images/macrame-wall-hanging.svg"
  },
  {
    name: "Ceramic Vase",
    description: "Handmade ceramic vase with traditional patterns. Perfect vessel for flowers and decorations.",
    price: 600,
    category: "Home Decor",
    stock: 10,
    image: "/images/ceramic-vase.svg"
  },
  {
    name: "Hand-painted Mug",
    description: "Unique hand-painted ceramic mug with artistic designs. Perfect for tea or coffee lovers.",
    price: 350,
    category: "Kitchenware",
    stock: 25,
    image: "/images/hand-painted-mug.svg"
  },
  {
    name: "Woven Basket",
    description: "Natural woven basket for storage. Eco-friendly, durable and perfect for organization.",
    price: 550,
    category: "Home Decor",
    stock: 18,
    image: "/images/woven-basket.svg"
  },
  {
    name: "Beaded Bracelet",
    description: "Colorful handmade beaded bracelet with traditional design. Unique and wearable art.",
    price: 250,
    category: "Jewelry",
    stock: 30,
    image: "/images/beaded-bracelet.svg"
  }
];

const seedDefaultProducts = async () => {
  try {
    const count = await Product.countDocuments();

    if (count === 0) {
      const insertedProducts = await Product.insertMany(defaultProducts);
      console.log(`✅ Seeded ${insertedProducts.length} default product images`);
      return;
    }

    for (const product of defaultProducts) {
      await Product.updateOne(
        { name: product.name },
        { $set: { ...product } },
        { upsert: true }
      );
    }

    console.log("✅ Refreshed catalog product images to local assets");
  } catch (err) {
    console.error("❌ Product seeding failed:", err.message);
  }
};

seedDefaultProducts();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// Test routes
app.get("/", (req, res) => res.send("✅ Backend running with Gmail OTP + Reset Password"));

// Seed products endpoint
app.get("/api/seed-products", async (req, res) => {
  try {
    await Product.deleteMany({});
    const insertedProducts = await Product.insertMany(defaultProducts);
    res.status(201).json({ 
      success: true, 
      message: `${insertedProducts.length} products seeded successfully!`,
      products: insertedProducts 
    });
  } catch (err) {
    console.error("❌ Seed failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/test-email", async (req, res) => {
  try {
    // Mock email response (no actual sending)
    console.log("📧 Email test (mock - no actual sending)");
    res.send("✅ Email test successful (mock mode)!");
  } catch (err) {
    console.error("❌ Email test failed:", err.message);
    res.status(500).send("Email test failed!");
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
