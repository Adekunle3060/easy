import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fetch from "node-fetch";   // Needed for verifying Paystack payment

const app = express();

// ======================
// CONFIGURATION
// ======================
const FRONTEND_URL = [
  "https://easy-theta.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Serve public folder (admin dashboard)
app.use(express.static(path.join(process.cwd(), "public")));

// ======================
// MONGODB CONNECTION
// ======================
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB Error:", err));

// ======================
// SCHEMA & MODEL
// ======================
const bookingSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  service: String,
  date: String,
  time: String,
  details: String,
  status: { type: String, default: "pending" },
  trackingId: { type: String, unique: true }
}, { timestamps: true });

bookingSchema.pre("save", function(next) {
  if (!this.trackingId) {
    this.trackingId = "EFX-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

// ======================
// ROUTES
// ======================

// Health check
app.get("/", (req, res) => res.send("🚀 Backend is running!"));

// ----------------------
// Create Booking
// ----------------------
app.post("/api/book-service", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.json({ success: true, trackingId: booking.trackingId });
  } catch (err) {
    console.error("❌ Booking Error:", err);
    res.status(500).json({ success: false });
  }
});

// ----------------------
// Track by Tracking ID
// ----------------------
app.get("/api/track", async (req, res) => {
  const { trackingId } = req.query;

  try {
    const booking = await Booking.findOne({ trackingId });
    if (!booking) return res.status(404).json({ success: false });

    res.json({ success: true, booking });
  } catch (err) {
    console.error("❌ Tracking Error:", err);
    res.status(500).json({ success: false });
  }
});

// ----------------------
// Track by email
// ----------------------
app.get("/api/track-email", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email required" });
  }

  try {
    const bookings = await Booking.find({
      email: { $regex: new RegExp(`^${email}$`, "i") }
    }).sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    console.error("❌ Track by email error:", err);
    res.status(500).json({ success: false });
  }
});

// ================================
// PAYSTACK PAYMENT VERIFICATION
// ================================
app.post("/api/verify-payment", async (req, res) => {
  const { reference, trackingId } = req.body;

  if (!reference || !trackingId) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  try {
    const url = `https://api.paystack.co/transaction/verify/${reference}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const data = await response.json();

    if (data.status && data.data.status === "success") {
      // Update booking
      await Booking.findOneAndUpdate(
        { trackingId },
        { status: "paid" }
      );

      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }

  } catch (err) {
    console.error("❌ Payment Verification Error:", err);
    res.status(500).json({ success: false });
  }
});

// ================================
// ADMIN ROUTES
// ================================

// Serve admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "admin.html"));
});

// Admin login
app.post("/api/admin-login", (req, res) => {
  const { username, password } = req.body;

  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    res.json({ success: true, token: "admin-secret-token" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Fetch all bookings
app.get("/api/admin/bookings", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader !== "Bearer admin-secret-token") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ success: false });
  }
});

// Update booking status
app.put("/api/admin/update-status/:id", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader !== "Bearer admin-secret-token") {
    return res.status(403).json({ success: false });
  }

  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json({ success: true, updated });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ success: false });
  }
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
