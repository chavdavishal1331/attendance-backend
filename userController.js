const User = require("../models/User");
const multer = require("multer");

// Upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage }).single("image");

// Get all users
const getUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

// Get last ID
const getLastId = async (req, res) => {
  const lastUser = await User.findOne().sort({ id: -1 });
  res.json({ lastId: lastUser ? lastUser.id : 0 });
};

// Add User
const addUser = (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(500).send(err.message);
    }

    try {
      const { id, name, phone, faceDescriptor } = req.body;

      // ✅ phone optional
      if (!id || !name || !faceDescriptor) {
        return res.status(400).json({ error: "Name & Face required" });
      }

      const user = new User({
        id,
        name,
        phone: phone || "",
        image: req.file ? req.file.path : "",
        faceDescriptor: JSON.parse(faceDescriptor)
      });

      await user.save();

      res.json({ message: "User Added Successfully ✅" });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

module.exports = { addUser, getUsers, getLastId };