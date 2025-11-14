import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(cors({
  origin: "https://easy-blush.vercel.app/", // later replace with your Vercel URL
}));

app.use(express.json());

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB Error:", err));

// Schema + Model
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

// API Route
app.post("/api/book-service", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// Start Server
const PORT = process.env.PORT || 5300;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
