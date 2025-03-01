const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  items: [
    {
      id: String,
      name: String,
      price: Number,
      quantity: Number,
      img: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Menu", menuSchema);
