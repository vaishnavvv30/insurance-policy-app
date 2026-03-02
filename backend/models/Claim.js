const mongoose = require("mongoose");

const ClaimSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  policyId: {
    type: String,
    required: true
  },
  incidentDate: {
    type: Date,
    required: true
  },
  claimType: {
    type: String,
    required: true
  },
  claimAmount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "Pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Claim", ClaimSchema)