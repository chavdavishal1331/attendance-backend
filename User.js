const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },

  // ✅ OPTIONAL PHONE
  phone: { type: String, default: "" },

  image: { type: String },
  faceDescriptor: { type: Array, required: true }
});

module.exports = mongoose.model("User", userSchema);