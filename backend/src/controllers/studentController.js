import Job from "../models/Job.js";
import Application from "../models/Application.js";
import User from "../models/User.js";
import { checkEligibility } from "../utils/eligibility.js";
import { parseStudentFields } from "../utils/validation.js";
import { cookieOptions } from "../utils/generateToken.js";

// A job a student can apply to: approved by TPO, not closed, deadline not passed (or no deadline)
const openJobFilter = () => ({
  status: "APPROVED",
  isOpen: true,
  $or: [{ deadline: { $exists: false } }, { deadline: null }, { deadline: { $gte: new Date() } }],
});

// Accepts only real http/https links (Drive, Dropbox, etc.)
const isValidLink = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// GET /api/student/jobs   - open jobs only, each with hasApplied + eligibility for this student
export const getOpenJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find(openJobFilter()).sort({ createdAt: -1 }).lean();

    // Which of these jobs has this student already applied to? (one query)
    const applied = await Application.find({
      studentId: req.user._id,
      jobId: { $in: jobs.map((j) => j._id) },
    }).select("jobId");
    const appliedIds = new Set(applied.map((a) => a.jobId.toString()));

    const data = jobs.map((job) => {
      const { eligible, reasons } = checkEligibility(req.user.student, job);
      return { ...job, hasApplied: appliedIds.has(job._id.toString()), eligible, ineligibleReasons: reasons };
    });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/student/jobs/:id   - job details + the student's application (if any) + eligibility
export const getJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, status: "APPROVED" }).lean();
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const application = await Application.findOne({ jobId: job._id, studentId: req.user._id });

    // A closed job is still visible to students who applied, so they can check their status
    const acceptingApplications = job.isOpen && (!job.deadline || new Date(job.deadline) >= new Date());
    if (!acceptingApplications && !application) {
      return res.status(404).json({ success: false, message: "This job is no longer open" });
    }

    const { eligible, reasons } = checkEligibility(req.user.student, job);

    res.json({
      success: true,
      data: {
        ...job,
        acceptingApplications,
        eligible,
        ineligibleReasons: reasons,
        canApply: acceptingApplications && eligible && !application,
        hasApplied: !!application,
        application,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/student/jobs/:id/apply   body: { "resumeLink": "https://drive.google.com/..." }
export const applyToJob = async (req, res, next) => {
  try {
    const { resumeLink } = req.body;
    if (!resumeLink || typeof resumeLink !== "string" || !isValidLink(resumeLink)) {
      return res.status(400).json({ success: false, message: "A valid resume link (http/https) is required" });
    }

    // Checks approved + open + deadline in one query
    const job = await Job.findOne({ _id: req.params.id, ...openJobFilter() });
    if (!job) {
      return res.status(400).json({ success: false, message: "This job is not open for applications" });
    }

    const already = await Application.findOne({ jobId: job._id, studentId: req.user._id });
    if (already) return res.status(409).json({ success: false, message: "You have already applied to this job" });

    // The real eligibility gate: the UI hides the form, but this blocks direct API calls too
    const { eligible, reasons } = checkEligibility(req.user.student, job);
    if (!eligible) {
      return res.status(403).json({
        success: false,
        message: `You're not eligible for this drive. ${reasons.join(". ")}.`,
        reasons,
      });
    }

    const application = await Application.create({
      jobId: job._id,
      studentId: req.user._id,
      resumeLink,
    });

    res.status(201).json({ success: true, message: "Application submitted", data: application });
  } catch (err) {
    // Two clicks at the same moment: the unique index catches the second one
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "You have already applied to this job" });
    }
    next(err);
  }
};

// GET /api/student/applications   - every job this student applied to, with status + remarks
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate("jobId", "companyName role package location jobType jdLink deadline isOpen minCgpa maxBacklogs")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    next(err);
  }
};

// PUT /api/student/profile
// body: { name, phone, rollNo, department, cgpa, graduationYear, backlogs }
// Any real change sends the account back to the TPO (status PENDING) and logs the student out.
// Email and password can't be changed here.
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    const phoneStr = phone === undefined || phone === null ? "" : String(phone).trim();
    if (phoneStr && !/^\d{10}$/.test(phoneStr)) {
      return res.status(400).json({ success: false, message: "Phone must be 10 digits" });
    }

    const academic = parseStudentFields(req.body);
    if (academic.error) return res.status(400).json({ success: false, message: academic.error });
    const updated = academic.value;

    const user = req.user;
    const current = user.student || {};

    // Nothing changed -> keep the account approved, don't log out
    const changed =
      name.trim() !== user.name ||
      phoneStr !== (user.phone || "") ||
      updated.rollNo !== current.rollNo ||
      updated.department !== current.department ||
      updated.cgpa !== current.cgpa ||
      updated.graduationYear !== current.graduationYear ||
      updated.backlogs !== current.backlogs;

    if (!changed) {
      return res.json({ success: true, changed: false, message: "Nothing changed", data: user });
    }

    // Roll number must stay unique among students (ignore this student's own record)
    if (updated.rollNo !== current.rollNo) {
      const taken = await User.findOne({ _id: { $ne: user._id }, role: "STUDENT", "student.rollNo": updated.rollNo });
      if (taken) return res.status(409).json({ success: false, message: "Roll number already registered" });
    }

    user.name = name.trim();
    user.phone = phoneStr || undefined;
    user.set("student", updated);
    user.status = "PENDING";
    user.profileUpdatedAt = new Date();
    await user.save();

    // Log out: the account can't be used until the TPO approves it again
    const { maxAge, ...options } = cookieOptions;
    res.clearCookie("token", options);

    res.json({
      success: true,
      changed: true,
      message: "Profile updated. Your account is waiting for TPO approval again.",
      data: user,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Roll number already registered" });
    }
    next(err);
  }
};
