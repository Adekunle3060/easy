// server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

// CORS setup
app.use(cors({
  origin: "https://easy-blush.vercel.app" // Replace with your frontend URL
}));

// Parse JSON
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB Error:", err));

// Mongoose Schema & Model
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

// Root route (for testing)
app.get("/", (req, res) => {
  res.send("🚀 Backend is running!");
});

// Booking API route
app.post("/api/book-service", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Start server
const PORT = process.env.PORT || 5300;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
