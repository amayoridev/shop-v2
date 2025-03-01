const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: [
    {
      id: String,
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  note: String,
  payment: Boolean,
  status: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
