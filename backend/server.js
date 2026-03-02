const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer=require("multer");
const path=require("path");
const User = require("./models/User");
const Claim = require("./models/Claim")

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/policynest_db")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

  // ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });


// ================= APPLICATION SCHEMA =================
const applicationSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  dob: String,
  gender: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  policyId: String,
  annualIncome: Number,
  nomineeName: String,
  nomineeRelation: String,
  photo: String,
  idProof: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Application = mongoose.model("Application", applicationSchema);


// ================= APPLY POLICY ROUTE =================
app.post(
  "/apply-policy",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "idProof", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const applicationData = {
        ...req.body,
        photo: req.files.photo[0].filename,
        idProof: req.files.idProof[0].filename
      };

      const newApplication = new Application(applicationData);
      await newApplication.save();

      res.status(201).json({
        message: "Application submitted successfully!"
      });

    } catch (error) {
      console.log("APPLICATION ERROR:", error);
      res.status(500).json({
        message: "Error saving application"
      });
    }
  }
);


// Test Route
app.get("/", (req, res) => {
  res.send("Server Running");
});


// ================= REGISTER =================
app.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      fullName,
      email,
      password,
      role: "client"
    });

    await newUser.save();

    res.status(201).json({ message: "Registration successful" });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ADMIN
    if (email === "admin@insurance.com" && password === "admin123") {
      return res.json({
        email,
        role: "admin"
      });
    }

    // EMPLOYEE
    if (email === "employee@insurance.com" && password === "employee123") {
      return res.json({
        email,
        role: "employee"
      });
    }

    // NORMAL USER 
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   SUBMIT CLAIM
================================= */

app.post("/submit-claim", async (req, res) => {
  try {
    console.log("BODY:",req.body);
    const {
      userId,
      policyId,
      incidentDate,
      claimType,
      claimAmount,
      description
    } = req.body;

    const newClaim = new Claim({
      userId,
      policyId,
      incidentDate,
      claimType,
      claimAmount,
      description
    });

    await newClaim.save();

    res.json({ message: "Claim submitted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   GET USER CLAIMS
================================= */

app.get("/my-claims/:userId", async (req, res) => {
  try {
    const claims = await Claim.find({
      userId: req.params.userId
    });

    res.json(claims);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});