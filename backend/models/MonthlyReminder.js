/* ══════════════════════════════════════════════════════════════
   monthlyReminder.js
   Run this file separately: node monthlyReminder.js
   Or add it to server.js using node-cron (see below).

   Sends a monthly premium payment reminder email to all clients
   who have an Approved + Paid policy.

   To use in server.js, add at the bottom:
     require("./monthlyReminder");
══════════════════════════════════════════════════════════════ */

require("dotenv").config();
const mongoose   = require("mongoose");
const nodemailer = require("nodemailer");
const cron       = require("node-cron");

/* ── DB connection (skip if already connected in server.js) ── */
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/policynest_db")
    .then(() => console.log("Reminder: MongoDB Connected"))
    .catch(err => console.log(err));
}

/* ── Inline Application model (reuse if already defined) ── */
const applicationSchema = new mongoose.Schema({
  firstName: String, lastName: String, email: String,
  policyId: String, policyTypeName: String,
  annualIncome: Number,
  status:        { type: String, default: "Pending" },
  paymentStatus: { type: String, default: "Pending" },
  amountPaid:    { type: Number, default: 0 },
  createdAt:     { type: Date, default: Date.now }
});
const Application = mongoose.models.Application || mongoose.model("Application", applicationSchema);

/* ── Nodemailer transporter ── */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "policynest2@gmail.com",
    pass: process.env.EMAIL_PASS || "zfhsqqrawpghhazg"
  }
});

/* ── Send reminder to one client ── */
const sendReminder = async (app) => {
  const policyName = app.policyTypeName
    ? app.policyTypeName.charAt(0).toUpperCase() + app.policyTypeName.slice(1) + " Insurance"
    : "your insurance policy";

  const dueDate = new Date();
  dueDate.setDate(28); // due on 28th of each month
  const dueDateStr = dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  await transporter.sendMail({
    from:    '"PolicyNest" <policynest2@gmail.com>',
    to:      app.email,
    subject: `📅 Monthly Premium Reminder — ${policyName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #dee2e6;border-radius:8px;padding:32px;">
        <h2 style="color:#0d6efd;margin-top:0;">📅 Monthly Premium Reminder</h2>
        <p>Dear <strong>${app.firstName} ${app.lastName}</strong>,</p>
        <p>This is a friendly reminder that your monthly premium installment for your <strong>${policyName}</strong> is due.</p>

        <div style="background:#f0f4ff;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;"><strong>Policy ID:</strong> ${app.policyId}</p>
          <p style="margin:4px 0;"><strong>Monthly Premium:</strong> ₹${app.amountPaid}</p>
          <p style="margin:4px 0;"><strong>Due Date:</strong> ${dueDateStr}</p>
        </div>

        <p>Please log in to your <strong>PolicyNest</strong> dashboard to complete your payment on time and keep your policy active.</p>
        <p style="color:#dc3545;font-size:13px;">⚠️ Late payments may result in policy suspension.</p>
        <p style="color:#6c757d;font-size:12px;margin-top:24px;">If you have already made the payment, please ignore this email.</p>
        <hr style="border:none;border-top:1px solid #dee2e6;margin:20px 0;"/>
        <p style="color:#6c757d;font-size:12px;margin:0;">PolicyNest — Insurance Policy Management System</p>
      </div>
    `
  });

  console.log(`✅ Reminder sent to ${app.email} for policy ${app.policyId}`);
};

/* ── Send reminders to all eligible clients ── */
const sendMonthlyReminders = async () => {
  console.log("⏰ Running monthly reminder job...");
  try {
    // Find all applications that are Approved and Paid
    const applications = await Application.find({
      status:        "Approved",
      paymentStatus: "Successful",
      email:         { $exists: true, $ne: "" }
    });

    console.log(`Found ${applications.length} active policies to remind.`);

    for (const app of applications) {
      try {
        await sendReminder(app);
      } catch (err) {
        console.log(`❌ Failed to send to ${app.email}:`, err.message);
      }
    }

    console.log("✅ Monthly reminders sent.");
  } catch (err) {
    console.log("❌ Reminder job error:", err.message);
  }
};

/* ══════════════════════════════════════════════
   CRON SCHEDULE
   Runs on the 1st of every month at 9:00 AM
   Format: "minute hour day month weekday"
   To test immediately: call sendMonthlyReminders() directly
══════════════════════════════════════════════ */
cron.schedule("0 9 1 * *", () => {
  console.log("📅 1st of month — sending premium reminders...");
  sendMonthlyReminders();
});

console.log("📅 Monthly reminder scheduler started. Runs on the 1st of every month at 9:00 AM.");

// Uncomment the line below to test immediately when you run this file:
// sendMonthlyReminders();

module.exports = { sendMonthlyReminders };