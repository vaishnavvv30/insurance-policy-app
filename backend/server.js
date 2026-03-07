const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const User = require("./models/User");
const Claim = require("./models/Claim");
const Policy = require("./models/Policy");

const app = express();

app.use(express.json());
app.use(cors());

/* ===============================
   MONGODB CONNECTION
================================= */

mongoose.connect("mongodb://localhost:27017/policynest_db")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* ===============================
   GENERATE POLICY ID
================================= */

function generatePolicyId() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return "POL-" + Date.now() + "-" + random;
}

/* ===============================
   MULTER CONFIG
================================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, "uploads/"); },
  filename: function (req, file, cb) { cb(null, Date.now() + "-" + file.originalname); }
});

const upload = multer({ storage: storage });

/* ===============================
   APPLICATION SCHEMA
   Added: policyTypeName to store
   the human-readable policy name
   e.g. "housing", "health", "life"
================================= */

const applicationSchema = new mongoose.Schema({
  firstName:       String,
  lastName:        String,
  email:           String,
  phone:           String,
  dob:             String,
  gender:          String,
  address:         String,
  city:            String,
  state:           String,
  pincode:         String,
  policyId:        String,   // generated POL-xxx
  policyTypeName:  String,   // NEW: "housing", "health", "life" etc.
  annualIncome:    Number,
  nomineeName:     String,
  nomineeRelation: String,
  photo:           String,
  idProof:         String,
  createdAt: { type: Date, default: Date.now }
});

const Application = mongoose.model("Application", applicationSchema);

/* ===============================
   APPLY POLICY ROUTE
================================= */

app.post(
  "/apply-policy",
  upload.fields([
    { name: "photo",   maxCount: 1 },
    { name: "idProof", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const policyId = generatePolicyId();

      // req.body.policyId is the URL param e.g. "housing"
      // We save that as policyTypeName, and replace policyId with generated one
      const applicationData = {
        ...req.body,
        policyId:       policyId,
        policyTypeName: req.body.policyId,   // "housing" / "health" / "life" etc.
        photo:   req.files.photo[0].filename,
        idProof: req.files.idProof[0].filename
      };

      const newApplication = new Application(applicationData);
      await newApplication.save();

      const newPolicy = new Policy({
        userId:        req.body.userId,
        policyId:      policyId,
        policyName:    req.body.policyId,   // e.g. "housing"
        premiumAmount: req.body.annualIncome
      });

      await newPolicy.save();

      res.status(201).json({
        message:  "Application submitted successfully!",
        policyId: policyId
      });

    } catch (error) {
      console.log("APPLICATION ERROR:", error);
      res.status(500).json({ message: "Error saving application" });
    }
  }
);

/* ===============================
   TEST ROUTE
================================= */

app.get("/", (req, res) => { res.send("Server Running"); });

/* ===============================
   REGISTER
================================= */

app.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ fullName, email, password, role: "client" });
    await newUser.save();
    res.status(201).json({ message: "Registration successful" });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   LOGIN
================================= */

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === "admin@insurance.com" && password === "admin123")
      return res.json({ email, role: "admin" });

    if (email === "employee@insurance.com" && password === "employee123")
      return res.json({ email, role: "employee" });

    const user = await User.findOne({ email, password });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ _id: user._id, email: user.email, role: user.role, fullName: user.fullName });

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
    const { userId, policyId, incidentDate, claimType, claimAmount, description } = req.body;
    const newClaim = new Claim({ userId, policyId, incidentDate, claimType, claimAmount, description });
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
    const claims = await Claim.find({ userId: req.params.userId });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   GET USER POLICIES (by email)
   Returns Application docs.
   For old docs missing policyTypeName,
   we cross-reference the Policy collection
   using the matching policyId to get policyName.
================================= */

app.get("/my-policies/:email", async (req, res) => {
  try {
    const applications = await Application.find({ email: req.params.email });

    // For each application, if policyTypeName is missing,
    // look it up from the Policy collection by policyId
    const enriched = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject();
        if (!appObj.policyTypeName) {
          const matchingPolicy = await Policy.findOne({ policyId: appObj.policyId });
          if (matchingPolicy && matchingPolicy.policyName) {
            appObj.policyTypeName = matchingPolicy.policyName;
          }
        }
        return appObj;
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   MIGRATION ROUTE (run once)
   Backfills policyTypeName on all
   old Application documents that
   are missing it.
   Call: GET /admin/migrate-policy-names
================================= */

app.get("/admin/migrate-policy-names", async (req, res) => {
  try {
    const applications = await Application.find({ policyTypeName: { $in: [null, undefined, ""] } });
    let updated = 0;

    for (const app of applications) {
      const matchingPolicy = await Policy.findOne({ policyId: app.policyId });
      if (matchingPolicy && matchingPolicy.policyName) {
        await Application.findByIdAndUpdate(app._id, { policyTypeName: matchingPolicy.policyName });
        updated++;
      }
    }

    res.json({ message: `Migration complete. Updated ${updated} of ${applications.length} applications.` });
  } catch (error) {
    console.log("MIGRATION ERROR:", error);
    res.status(500).json({ message: "Migration failed", error: error.message });
  }
});

/* ===============================
   ADMIN - GET ALL POLICIES
================================= */

app.get("/admin/policies", async (req, res) => {
  try {
    const policies = await Policy.find();
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ADMIN - ADD POLICY
================================= */

app.post("/admin/add-policy", async (req, res) => {
  try {
    const { policyName, description, coverage, premiumAmount, duration } = req.body;
    const policyId = generatePolicyId();

    const newPolicy = new Policy({
      userId: new mongoose.Types.ObjectId(),
      policyId, policyName, description, coverage, premiumAmount, duration
    });

    await newPolicy.save();
    res.json({ message: "Policy added successfully" });

  } catch (error) {
    console.log("ADD POLICY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ADMIN - EDIT POLICY
================================= */

app.put("/admin/edit-policy/:id", async (req, res) => {
  try {
    const { policyName, description, coverage, premiumAmount, duration } = req.body;
    await Policy.findByIdAndUpdate(req.params.id, { policyName, description, coverage, premiumAmount, duration });
    res.json({ message: "Policy updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ADMIN - DELETE POLICY
================================= */

app.delete("/admin/delete-policy/:id", async (req, res) => {
  try {
    await Policy.findByIdAndDelete(req.params.id);
    res.json({ message: "Policy deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ADMIN - GET ALL EMPLOYEES
================================= */

app.get("/admin/employees", async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ADMIN - ADD EMPLOYEE
================================= */

app.post("/admin/add-employee", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const newEmployee = new User({ fullName, email, password, role: "employee" });
    await newEmployee.save();
    res.json({ message: "Employee added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ADMIN - DELETE EMPLOYEE
================================= */

app.delete("/admin/delete-employee/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ADMIN - GET ALL USERS (clients only)
================================= */

app.get("/admin/users", async (req, res) => {
  try {
    // Returns ALL users (all roles) — frontend filters as needed
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ADMIN - DELETE USER
================================= */

app.delete("/admin/delete-user/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ADMIN - GET ALL APPLICATIONS
   Cross-references Policy collection
   to fill missing policyTypeName
================================= */

app.get("/admin/applications", async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });

    const enriched = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject();
        if (!appObj.policyTypeName) {
          const matchingPolicy = await Policy.findOne({ policyId: appObj.policyId });
          if (matchingPolicy && matchingPolicy.policyName) {
            appObj.policyTypeName = matchingPolicy.policyName;
          }
        }
        return appObj;
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ADMIN - GET ALL CLAIMS
================================= */

app.get("/admin/claims", async (req, res) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ADMIN - UPDATE CLAIM STATUS
================================= */

app.put("/admin/update-claim/:id", async (req, res) => {
  try {
    const { status } = req.body;
    await Claim.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: `Claim ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ADMIN - SYSTEM REPORT
================================= */

app.get("/admin/system-report", async (req, res) => {
  try {
    const totalUsers        = await User.countDocuments();
    const totalPolicies     = await Policy.countDocuments();
    const totalClaims       = await Claim.countDocuments();
    const totalApplications = await Application.countDocuments();
    res.json({ totalUsers, totalPolicies, totalClaims, totalApplications });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ANNOUNCEMENTS SCHEMA & ROUTES
================================= */

const announcementSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Announcement = mongoose.model("Announcement", announcementSchema);

// GET all announcements
app.get("/announcements", async (req, res) => {
  try {
    const data = await Announcement.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

// POST new announcement
app.post("/announcements", async (req, res) => {
  try {
    const { title, message } = req.body;
    const ann = new Announcement({ title, message });
    await ann.save();
    res.json({ message: "Announcement posted" });
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

// DELETE announcement
app.delete("/announcements/:id", async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Announcement deleted" });
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

/* ===============================
   SERVER START
================================= */

app.listen(5000, () => { console.log("Server running on port 5000"); });