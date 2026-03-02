const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  coverage: {
    type: String
  },
  premium: {
    type: String
  },
  duration: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Policy", PolicySchema);