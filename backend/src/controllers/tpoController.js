import User from "../models/User.js";
import Job from "../models/Job.js";

const ROLES = ["STUDENT", "RECRUITER"];
const STATUSES = ["PENDING", "APPROVED", "REJECTED"];

// GET /api/tpo/users?role=STUDENT&status=PENDING
// Both filters are optional:
//   no filters            -> all students + recruiters
//   ?role=RECRUITER       -> all recruiters
//   ?status=PENDING       -> everyone waiting for approval
export const getUsers = async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const filter = { role: { $in: ROLES } }; // never list the TPO

    if (role) {
      if (!ROLES.includes(role)) {
        return res.status(400).json({ success: false, message: "role must be STUDENT or RECRUITER" });
      }
      filter.role = role;
    }
    if (status) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: "status must be PENDING, APPROVED or REJECTED" });
      }
      filter.status = status;
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tpo/users/:id/status   body: { "status": "APPROVED" | "REJECTED" | "PENDING" }
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "status must be PENDING, APPROVED or REJECTED" });
    }

    // role filter stops the TPO from changing their own (or another TPO's) status
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: { $in: ROLES } },
      { status },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: `User ${status.toLowerCase()}`, data: user });
  } catch (err) {
    next(err);
  }
};

// GET /api/tpo/jobs?status=PENDING   (status optional -> all jobs)
export const getJobs = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: "status must be PENDING, APPROVED or REJECTED" });
      }
      filter.status = status;
    }

    const jobs = await Job.find(filter)
      .populate("recruiterId", "name email phone recruiter.companyName")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tpo/jobs/:id/status   body: { "status": "APPROVED" | "REJECTED" | "PENDING" }
export const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "status must be PENDING, APPROVED or REJECTED" });
    }

    const job = await Job.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    res.json({ success: true, message: `Job ${status.toLowerCase()}`, data: job });
  } catch (err) {
    next(err);
  }
};
