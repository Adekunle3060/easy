import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

// ======================
// CONFIGURATION
// ======================
const FRONTEND_URL = [
  "https://easy-theta.vercel.app", // deployed frontend
      
];

app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

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
  status: {
    type: String,
    default: "pending" // pending | accepted | in-progress | completed | cancelled
  },
  trackingId: {
    type: String,
    unique: true
  }
}, { timestamps: true });

// Generate Tracking ID before saving
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

// Backend health check
app.get("/", (req, res) => res.send("🚀 Backend is running!"));

// ----------------------
// Public Routes
// ----------------------

// Create booking (public)
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

// Track booking (public, by trackingId only)
app.get("/api/track", async (req, res) => {
  const { trackingId } = req.query;
  try {
    const booking = await Booking.findOne({ trackingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, booking });
  } catch (err) {
    console.error("❌ Tracking Error:", err);
    res.status(500).json({ success: false });
  }
});

// ----------------------
// Admin Routes
// ----------------------

// Admin login
app.post("/api/admin-login", (req, res) => {
  const { username, password } = req.body;

  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    // For simplicity, we send a basic token (in production use JWT)
    res.json({ success: true, token: "admin-secret-token" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Get all bookings (Admin only)
app.get("/api/book-service", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer admin-secret-token") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ success: false });
  }
});

// Update booking status (Admin only)
app.put("/api/update-status/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer admin-secret-token") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const { status } = req.body;

  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
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
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
