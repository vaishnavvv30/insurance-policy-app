const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer     = require("multer");
const nodemailer = require("nodemailer");

// In-memory OTP store: { email -> { code, expiresAt } }
const otpStore = {};

const User = require("./models/User");
const Claim = require("./models/Claim");
const Policy = require("./models/Policy");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

mongoose.connect("mongodb://localhost:27017/policynest_db")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

function generatePolicyId() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return "POL-" + Date.now() + "-" + random;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

/* ══════════════════════════════════════════════
   APPLICATION SCHEMA
══════════════════════════════════════════════ */
const applicationSchema = new mongoose.Schema({
  firstName: String, lastName: String, email: String, phone: String,
  dob: String, gender: String, address: String, city: String,
  state: String, pincode: String,
  policyId: String, policyTypeName: String,
  annualIncome: Number, nomineeName: String, nomineeRelation: String,
  photo: String, idProof: String,
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});
const Application = mongoose.model("Application", applicationSchema);

/* ══════════════════════════════════════════════
   CHAT SCHEMA
══════════════════════════════════════════════ */
const chatMessageSchema = new mongoose.Schema({
  roomId:     { type: String, required: true },
  sender:     { type: String, required: true },
  senderName: { type: String, default: "" },
  role:       { type: String, required: true },  // "client" | "agent"
  message:    { type: String, required: true },
  createdAt:  { type: Date, default: Date.now }
});
const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

/* ══════════════════════════════════════════════
   ANNOUNCEMENT SCHEMA
══════════════════════════════════════════════ */
const announcementSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Announcement = mongoose.model("Announcement", announcementSchema);

/* ════════════════════════════════════════════════════════════
   ROUTES
════════════════════════════════════════════════════════════ */

app.get("/", (req, res) => res.send("Server Running"));

/* ── APPLY POLICY ─────────────────────────────── */
app.post("/apply-policy", upload.fields([{ name: "photo", maxCount: 1 }, { name: "idProof", maxCount: 1 }]), async (req, res) => {
  try {
    const policyId = generatePolicyId();
    const applicationData = {
      ...req.body, policyId,
      policyTypeName: req.body.policyId,
      photo:   req.files.photo[0].filename,
      idProof: req.files.idProof[0].filename
    };
    await new Application(applicationData).save();
    await new Policy({ userId: req.body.userId, policyId, policyName: req.body.policyId, premiumAmount: req.body.annualIncome }).save();
    res.status(201).json({ message: "Application submitted successfully!", policyId });
  } catch (error) {
    console.log("APPLICATION ERROR:", error);
    res.status(500).json({ message: "Error saving application" });
  }
});

/* ── REGISTER ──────────────────────────────────── */
app.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: "User already exists" });
    await new User({ fullName, email, password, role: "client" }).save();
    res.status(201).json({ message: "Registration successful" });
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

/* ── LOGIN ─────────────────────────────────────── */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === "admin@insurance.com" && password === "admin123")
      return res.json({ email, role: "admin", fullName: "Admin" });
    const user = await User.findOne({ email, password });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    res.json({ _id: user._id, email: user.email, role: user.role, fullName: user.fullName, employeeRole: user.employeeRole || null });
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

/* ── CLAIMS ────────────────────────────────────── */
app.post("/submit-claim", async (req, res) => {
  try {
    const { userId, policyId, incidentDate, claimType, claimAmount, description } = req.body;
    await new Claim({ userId, policyId, incidentDate, claimType, claimAmount, description }).save();
    res.json({ message: "Claim submitted successfully" });
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

app.get("/my-claims/:userId", async (req, res) => {
  try { res.json(await Claim.find({ userId: req.params.userId })); }
  catch (error) { res.status(500).json({ message: "Server error" }); }
});

/* ── MY POLICIES ───────────────────────────────── */
app.get("/my-policies/:email", async (req, res) => {
  try {
    const applications = await Application.find({ email: req.params.email });
    const enriched = await Promise.all(applications.map(async (app) => {
      const obj = app.toObject();
      if (!obj.policyTypeName) {
        const p = await Policy.findOne({ policyId: obj.policyId });
        if (p) obj.policyTypeName = p.policyName;
      }
      return obj;
    }));
    res.json(enriched);
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

/* ── ADMIN: POLICIES ──────────────────────────── */
app.get("/admin/policies", async (req, res) => {
  try { res.json(await Policy.find()); } catch (e) { res.status(500).json({ message: "Server error" }); }
});

app.post("/admin/add-policy", async (req, res) => {
  try {
    const { policyName, description, coverage, premiumAmount, duration } = req.body;
    await new Policy({ userId: new mongoose.Types.ObjectId(), policyId: generatePolicyId(), policyName, description, coverage, premiumAmount, duration }).save();
    res.json({ message: "Policy added successfully" });
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

app.put("/admin/edit-policy/:id", async (req, res) => {
  try {
    const { policyName, description, coverage, premiumAmount, duration } = req.body;
    await Policy.findByIdAndUpdate(req.params.id, { policyName, description, coverage, premiumAmount, duration });
    res.json({ message: "Policy updated successfully" });
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

app.delete("/admin/delete-policy/:id", async (req, res) => {
  try { await Policy.findByIdAndDelete(req.params.id); res.json({ message: "Policy deleted" }); }
  catch (e) { res.status(500).json({ message: "Server error" }); }
});

/* ── ADMIN: EMPLOYEES ─────────────────────────── */
app.get("/admin/all-employees", async (req, res) => {
  try { res.json(await User.find({ role: "employee" }).select("-password")); }
  catch (e) { res.status(500).json({ message: "Server error" }); }
});

app.get("/admin/employees", async (req, res) => {
  try { res.json(await User.find({ role: "employee", employeeRole: "HR" }).select("-password")); }
  catch (e) { res.status(500).json({ message: "Server error" }); }
});

app.post("/admin/add-employee", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: "Email already exists" });
    await new User({ fullName, email, password, role: "employee", employeeRole: "HR" }).save();
    res.json({ message: "HR staff added successfully" });
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

app.delete("/admin/delete-employee/:id", async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ message: "Employee removed" }); }
  catch (e) { res.status(500).json({ message: "Server error" }); }
});

/* ── HR ───────────────────────────────────────── */
const HR_MANAGED_ROLES = ["Branch Manager", "Insurance Agent", "Claims Officer", "Policy Officer"];

app.get("/hr/employees", async (req, res) => {
  try { res.json(await User.find({ role: "employee", employeeRole: { $in: HR_MANAGED_ROLES } }).select("-password")); }
  catch (e) { res.status(500).json({ message: "Server error" }); }
});

app.post("/hr/add-employee", async (req, res) => {
  try {
    const { fullName, email, password, employeeRole } = req.body;
    if (!HR_MANAGED_ROLES.includes(employeeRole)) return res.status(400).json({ message: "Invalid role" });
    if (await User.findOne({ email })) return res.status(400).json({ message: "Email already exists" });
    await new User({ fullName, email, password, role: "employee", employeeRole }).save();
    res.json({ message: `${employeeRole} added successfully` });
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

app.put("/hr/update-employee-role/:id", async (req, res) => {
  try {
    const { employeeRole } = req.body;
    if (!HR_MANAGED_ROLES.includes(employeeRole)) return res.status(400).json({ message: "Invalid role" });
    await User.findByIdAndUpdate(req.params.id, { employeeRole });
    res.json({ message: "Role updated successfully" });
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

app.delete("/hr/delete-employee/:id", async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ message: "Employee removed" }); }
  catch (e) { res.status(500).json({ message: "Server error" }); }
});

/* ── USERS ────────────────────────────────────── */
app.get("/admin/users", async (req, res) => {
  try { res.json(await User.find().select("-password")); }
  catch (e) { res.status(500).json({ message: "Server error" }); }
});

app.delete("/admin/delete-user/:id", async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ message: "User deleted" }); }
  catch (e) { res.status(500).json({ message: "Server error" }); }
});

/* ── APPLICATIONS ─────────────────────────────── */
app.get("/admin/applications", async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    const enriched = await Promise.all(applications.map(async (app) => {
      const obj = app.toObject();
      if (!obj.policyTypeName) {
        const p = await Policy.findOne({ policyId: obj.policyId });
        if (p) obj.policyTypeName = p.policyName;
      }
      return obj;
    }));
    res.json(enriched);
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

/* ── POLICY OFFICER: UPDATE APPLICATION STATUS ── */
app.put("/admin/update-application/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected"].includes(status))
      return res.status(400).json({ message: "Invalid status" });
    await Application.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: `Application ${status} successfully` });
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

/* ── CLAIMS ───────────────────────────────────── */
app.get("/admin/claims", async (req, res) => {
  try { res.json(await Claim.find().sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: "Server error" }); }
});

app.put("/admin/update-claim/:id", async (req, res) => {
  try { await Claim.findByIdAndUpdate(req.params.id, { status: req.body.status }); res.json({ message: "Claim updated" }); }
  catch (e) { res.status(500).json({ message: "Server error" }); }
});

/* ── SYSTEM REPORT ────────────────────────────── */
app.get("/admin/system-report", async (req, res) => {
  try {
    res.json({
      totalUsers:        await User.countDocuments(),
      totalPolicies:     await Policy.countDocuments(),
      totalClaims:       await Claim.countDocuments(),
      totalApplications: await Application.countDocuments()
    });
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

/* ── ANNOUNCEMENTS ────────────────────────────── */
app.get("/announcements",        async (req, res) => { try { res.json(await Announcement.find().sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: "Server error" }); } });
app.post("/announcements",       async (req, res) => { try { await new Announcement(req.body).save(); res.json({ message: "Posted" }); } catch (e) { res.status(500).json({ message: "Server error" }); } });
app.delete("/announcements/:id", async (req, res) => { try { await Announcement.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); } catch (e) { res.status(500).json({ message: "Server error" }); } });

/* ══════════════════════════════════════════════
   CHAT ROUTES
══════════════════════════════════════════════ */

/* Get all agents (Insurance Agent + Branch Manager) */
app.get("/chat/agents", async (req, res) => {
  try {
    const agents = await User.find({
      role: "employee",
      employeeRole: "Insurance Agent"
    }).select("_id fullName email employeeRole");
    res.json(agents);
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

/* Get all clients */
app.get("/chat/clients", async (req, res) => {
  try {
    const clients = await User.find({ role: "client" }).select("_id fullName email createdAt");
    res.json(clients);
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

/* Get messages for a room (roomId = clientEmail__agentEmail) */
app.get("/chat/messages/:roomId", async (req, res) => {
  try {
    const messages = await ChatMessage
      .find({ roomId: req.params.roomId })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

/* Send a message */
app.post("/chat/send", async (req, res) => {
  try {
    const { roomId, sender, senderName, role, message } = req.body;
    if (!roomId || !sender || !message) return res.status(400).json({ message: "Missing fields" });
    const msg = await new ChatMessage({ roomId, sender, senderName, role, message }).save();
    res.status(201).json(msg);
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

/* Get unread rooms for an agent */
app.get("/chat/unread/:agentEmail", async (req, res) => {
  try {
    const rooms = await ChatMessage.aggregate([
      { $match: { roomId: { $regex: `__${req.params.agentEmail}$` } } },
      { $sort:  { createdAt: -1 } },
      {
        $group: {
          _id:      "$roomId",
          lastRole: { $first: "$role" },
          lastMsg:  { $first: "$message" },
          lastAt:   { $first: "$createdAt" }
        }
      }
    ]);
    const unread = rooms.filter(r => r.lastRole === "client").length;
    res.json({ unread, rooms });
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

/* ══════════════════════════════════════════════
   NODEMAILER TRANSPORTER
   Replace with your Gmail + App Password
══════════════════════════════════════════════ */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "policynest2@gmail.com",      // ← replace with your Gmail
    pass: "zfhsqqrawpghhazg"     // ← replace with your 16-char App Password
  }
});

/* ══════════════════════════════════════════════
   FORGOT PASSWORD
   Step 1 — POST /forgot-password/send-otp
             Checks email exists, generates 6-digit
             OTP, sends it via Gmail, stores in memory
             for 10 minutes.
   Step 2 — POST /forgot-password/verify-otp
             Verifies the OTP is correct & not expired.
   Step 3 — POST /forgot-password/reset
             Updates the password in DB.
══════════════════════════════════════════════ */

// Step 1: Send OTP
app.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email." });

    // Generate 6-digit OTP
    const code      = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore[email] = { code, expiresAt };

    // Send email
    await transporter.sendMail({
      from:    '"PolicyNest" <policynest2@gmail.com>',  // ← same Gmail as above
      to:      email,
      subject: "Your PolicyNest Password Reset Code",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #dee2e6;border-radius:8px;padding:32px;">
          <h2 style="color:#0d6efd;margin-top:0;">🔐 Password Reset</h2>
          <p>You requested a password reset for your <strong>PolicyNest</strong> account.</p>
          <p>Your verification code is:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#0d6efd;text-align:center;padding:16px;background:#f0f4ff;border-radius:8px;margin:16px 0;">
            ${code}
          </div>
          <p style="color:#6c757d;font-size:13px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color:#6c757d;font-size:13px;">If you did not request this, please ignore this email.</p>
        </div>
      `
    });

    res.json({ message: "OTP sent to your email." });
  } catch (e) {
    console.log("SEND OTP ERROR:", e);
    res.status(500).json({ message: "Failed to send email. Check server config." });
  }
});

// Step 2: Verify OTP
app.post("/forgot-password/verify-otp", async (req, res) => {
  try {
    const { email, code } = req.body;
    const record = otpStore[email];
    if (!record)                     return res.status(400).json({ message: "No OTP requested for this email." });
    if (Date.now() > record.expiresAt) { delete otpStore[email]; return res.status(400).json({ message: "OTP has expired. Please request a new one." }); }
    if (record.code !== code)        return res.status(400).json({ message: "Incorrect code. Please try again." });
    res.json({ message: "OTP verified." });
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

// Step 3: Reset password
app.post("/forgot-password/reset", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const record = otpStore[email];
    if (!record || Date.now() > record.expiresAt || record.code !== code)
      return res.status(400).json({ message: "Invalid or expired OTP." });
    await User.findOneAndUpdate({ email }, { password: newPassword });
    delete otpStore[email];
    res.json({ message: "Password reset successfully." });
  } catch (e) { res.status(500).json({ message: "Server error" }); }
});

app.listen(5000, () => console.log("Server running on port 5000"));