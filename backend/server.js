import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

// ======================
// CONFIGURATION
// ======================
const FRONTEND_URL = "https://easy-theta.vercel.app"; // no trailing slash

app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());

// ======================
// MONGODB CONNECTION
// ======================
const MONGO_URI = process.env.MONGO_URI; // set this in Render environment
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
  details: String
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);

// ======================
// ROUTES
// ======================
app.get("/", (req, res) => res.send("🚀 Backend is running!"));

app.post("/api/book-service", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
