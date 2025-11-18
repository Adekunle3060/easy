// server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

// ======================
// CONFIGURATION
// ======================

// Replace this with your actual frontend URL deployed on Vercel
const FRONTEND_URL = "https://easy-theta.vercel.app/"; 

// CORS setup
app.use(cors({
  origin: FRONTEND_URL
}));

// Parse JSON
app.use(express.json());

// ======================
// MONGODB CONNECTION
// ======================

// Replace with your actual MongoDB connection string and database name
const MONGO_URI = "mongodb+srv://adekunlesunkanmi59:yTDirJyOcB25MEYq@cluster0.gfhyffu.mongodb.net/easyfixDB?retryWrites=true&w=majority";

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

// Root route
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
    console.error("Booking Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 5300;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
