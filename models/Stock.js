const mongoose = require("mongoose");

// User Schema
const StockSchema = new mongoose.Schema({
  stockname: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  img: {
    type: String,
  },
  id: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Stock", StockSchema);
