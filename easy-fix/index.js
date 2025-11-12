import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ 1. Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/easyfix", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ 2. Define Schema
const bookingSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  service: String,
  date: String,
  time: String,
  details: String,
}, { timestamps: true });

// ✅ 3. Create Model
const Booking = mongoose.model("Booking", bookingSchema);

// ✅ 4. Routes
app.get("/", (req, res) => {
  res.send(`
    <h2>✅ EasyFix Server Running</h2>
    <p>Submit bookings via frontend.</p>
    <p>View stored bookings at <a href="/bookings">/bookings</a>.</p>
  `);
});

// Receive form data and save to MongoDB
app.post("/api/book-service", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    console.log("📦 Saved to MongoDB:", booking);
    res.json({ success: true, message: "Booking saved successfully" });
  } catch (error) {
    console.error("❌ Error saving booking:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// View all bookings (read from MongoDB)
app.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    if (bookings.length === 0) {
      return res.send("<h3>No bookings yet</h3>");
    }

    const rows = bookings.map(b => `
      <tr>
        <td>${b.firstName}</td>
        <td>${b.lastName}</td>
        <td>${b.email}</td>
        <td>${b.phone}</td>
        <td>${b.service}</td>
        <td>${b.date}</td>
        <td>${b.time}</td>
        <td>${b.details}</td>
      </tr>
    `).join("");

    res.send(`
      <h1>All Bookings from MongoDB</h1>
      <table border="1" cellspacing="0" cellpadding="10">
        <thead>
          <tr>
            <th>First</th><th>Last</th><th>Email</th><th>Phone</th>
            <th>Service</th><th>Date</th><th>Time</th><th>Details</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching bookings");
  }
});

// ✅ 5. Start server
app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
