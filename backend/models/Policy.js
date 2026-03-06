const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  policyId: {
    type: String,
    required: true,
    unique: true
  },
  policyName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  coverage: {
    type: String,
    default: ""
  },
  premiumAmount: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    default: ""
  },
  startDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Policy", PolicySchema);