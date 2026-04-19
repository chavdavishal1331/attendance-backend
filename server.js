const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

const User = require("./models/User");
const Attendance = require("./models/Attendance");

const app = express();

app.use(cors());
app.use(express.json());

// DNS FIX
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// ================= MONGODB (ENV SECURE) =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch((err) => console.log("Mongo Error:", err));

// ================= UPLOAD =================
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// ================= USERS =================

// GET USERS
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().sort({ id: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Fetch error" });
  }
});

// LAST ID
app.get("/api/users/lastid", async (req, res) => {
  try {
    const lastUser = await User.findOne().sort({ id: -1 });
    res.json({ lastId: lastUser ? lastUser.id : 0 });
  } catch (err) {
    res.status(500).json({ error: "Error fetching last ID" });
  }
});

// ADD USER
app.post("/api/users/add", upload.single("image"), async (req, res) => {
  try {
    const { id, name, phone, faceDescriptor } = req.body;

    if (!id || !name || !faceDescriptor) {
      return res.status(400).json({ error: "Name & Face required" });
    }

    const user = new User({
      id: Number(id),
      name,
      phone: phone || "",
      faceDescriptor: JSON.parse(faceDescriptor),
      image: req.file ? req.file.filename : null,
    });

    await user.save();

    res.json({ success: true, message: "User Added Successfully ✅" });
  } catch (err) {
    console.error("ADD USER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= ATTENDANCE =================

// GET ATTENDANCE
app.get("/api/attendance", async (req, res) => {
  try {
    const data = await Attendance.find().sort({ _id: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Fetch error" });
  }
});

// CHECK ATTENDANCE
app.get("/api/attendance/check/:userId/:date", async (req, res) => {
  try {
    const { userId, date } = req.params;

    const record = await Attendance.findOne({ userId, date });

    res.json({ exists: !!record });
  } catch (err) {
    res.status(500).json({ error: "Check error" });
  }
});

// ================= ATTENDANCE ADD (0 / 1 FIX) =================
app.post("/api/attendance/add", async (req, res) => {
  try {
    const { userId, name, date, time } = req.body;

    if (!userId || !name || !date || !time) {
      return res.status(400).json({ error: "All fields required" });
    }

    const existing = await Attendance.findOne({ userId, date });

    if (existing) {
      return res.json({ message: "already" });
    }

    // ⏰ TIME LOGIC (4:30 PM - 6:00 PM)
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();

    const start = 16 * 60 + 30;
    const end = 18 * 60;

    const status = minutes >= start && minutes <= end ? 1 : 0;

    const record = new Attendance({
      userId,
      name,
      date,
      time,
      status,
    });

    await record.save();

    res.json({ message: "added", status });
  } catch (err) {
    console.error("ATTENDANCE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE
app.delete("/api/attendance/:id", async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete error" });
  }
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on:");
  console.log(`👉 Local: http://localhost:${PORT}`);
});