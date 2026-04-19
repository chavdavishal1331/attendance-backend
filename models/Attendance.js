const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  name: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, default: "Present" },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
