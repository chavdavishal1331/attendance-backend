const router = require("express").Router();
const Attendance = require("../models/Attendance");


// ✅ Add Attendance
router.post("/add", async (req, res) => {
  try {
    const { userId, name, date, time, status } = req.body;

    // ✅ Validation
    if (!userId || !name || !date || !time) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    // ✅ Check duplicate
    const existing = await Attendance.findOne({ userId, date });

    if (existing) {
      return res.json({
        message: "already",
      });
    }

    // ✅ Save attendance
    const attendance = new Attendance({
      userId,
      name,
      date,
      time,
      status: status || "Present",
    });

    await attendance.save();

    res.json({
      message: "added",
      attendance,
    });

  } catch (error) {
    console.error("ADD ERROR:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
});


// ✅ Check Attendance
router.get("/check/:userId/:date", async (req, res) => {
  try {
    const { userId, date } = req.params;

    const record = await Attendance.findOne({ userId, date });

    res.json({
      exists: !!record
    });

  } catch (error) {
    console.error("CHECK ERROR:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
});


// ✅ Get All Attendance (latest first)
router.get("/", async (req, res) => {
  try {
    const data = await Attendance.find().sort({ _id: -1 });

    res.json(data);

  } catch (error) {
    console.error("FETCH ERROR:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
});


// ✅ Delete Attendance
router.delete("/:id", async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);

    res.json({
      message: "Deleted Successfully",
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
});


// ✅ OPTIONAL: Get attendance by user
router.get("/user/:userId", async (req, res) => {
  try {
    const data = await Attendance.find({ userId: req.params.userId });

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});


module.exports = router;