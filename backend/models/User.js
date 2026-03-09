const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "client"
    // values: "client", "employee", "admin"
  },
  employeeRole: {
    type: String,
    default: null,
    enum: [null, "HR", "Branch Manager", "Insurance Agent", "Claims Officer", "Policy Officer"]
    // Only set when role === "employee"
    // Hierarchy: HR → Branch Manager → Insurance Agent / Claims Officer / Policy Officer
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);