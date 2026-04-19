const router = require("express").Router();
const User = require("../models/User");

// Get Users
router.get("/", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Add User
router.post("/add", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

// Get Last ID
router.get("/lastid", async (req, res) => {
  const lastUser = await User.findOne().sort({ id: -1 });
  res.json(lastUser);
});

module.exports = router;