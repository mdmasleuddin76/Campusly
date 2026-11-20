import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { optionalNumber } from "../utils/validation.js";

const JOB_TYPES = ["FULL_TIME", "INTERNSHIP"];
const APPLICATION_STATUSES = ["APPLIED", "SHORTLISTED", "NOT_SHORTLISTED"];

// POST /api/recruiter/jobs
// body: { role, package, location, jobType, description, jdLink, eligibility, deadline, minCgpa, maxBacklogs }
// minCgpa / maxBacklogs are optional: leave them out (or empty) for "no limit"
export const createJob = async (req, res, next) => {
  try {
    const { role, package: pkg, location, jobType, description, jdLink, eligibility, deadline } = req.body;

    const minCgpa = optionalNumber(req.body.minCgpa);
    if (minCgpa !== undefined && (isNaN(minCgpa) || minCgpa < 0 || minCgpa > 10)) {
      return res.status(400).json({ success: false, message: "Minimum CGPA must be between 0 and 10" });
    }
    const maxBacklogs = optionalNumber(req.body.maxBacklogs);
    if (maxBacklogs !== undefined && (!Number.isInteger(maxBacklogs) || maxBacklogs < 0)) {
      return res.status(400).json({ success: false, message: "Maximum backlogs must be a whole number (0 or more)" });
    }

    if (!role || !role.trim()) {
      return res.status(400).json({ success: false, message: "Job role is required" });
    }
    if (jobType && !JOB_TYPES.includes(jobType)) {
      return res.status(400).json({ success: false, message: "jobType must be FULL_TIME or INTERNSHIP" });
    }
    if (deadline) {
      const d = new Date(deadline);
      if (isNaN(d)) return res.status(400).json({ success: false, message: "Invalid deadline date" });
      if (d < new Date()) return res.status(400).json({ success: false, message: "Deadline must be in the future" });
    }

    const job = await Job.create({
      recruiterId: req.user._id,
      companyName: req.user.recruiter?.companyName,
      role,
      package: pkg,
      location,
      jobType,
      description,
      jdLink,
      eligibility,
      deadline,
      minCgpa,
      maxBacklogs,
      // status (PENDING) and isOpen (true) come from the schema defaults,
      // so a recruiter can't approve their own job by sending status in the body
    });

    res.status(201).json({ success: true, message: "Job posted. Waiting for TPO approval.", data: job });
  } catch (err) {
    next(err);
  }
};

// GET /api/recruiter/jobs   - all jobs this recruiter posted, with application counts
export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 }).lean();

    // One query to count applications for all these jobs
    const counts = await Application.aggregate([
      { $match: { jobId: { $in: jobs.map((j) => j._id) } } },
      {
        $group: {
          _id: "$jobId",
          total: { $sum: 1 },
          shortlisted: { $sum: { $cond: [{ $eq: ["$status", "SHORTLISTED"] }, 1, 0] } },
          notShortlisted: { $sum: { $cond: [{ $eq: ["$status", "NOT_SHORTLISTED"] }, 1, 0] } },
        },
      },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c]));

    const data = jobs.map((job) => {
      const c = countMap[job._id.toString()];
      return {
        ...job,
        applications: {
          total: c?.total || 0,
          shortlisted: c?.shortlisted || 0,
          notShortlisted: c?.notShortlisted || 0,
        },
      };
    });

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/recruiter/jobs/:id   - one of this recruiter's jobs
export const getMyJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiterId: req.user._id });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/recruiter/jobs/:id/close   - stop new applications
export const closeJob = async (req, res, next) => {
  try {
    // recruiterId in the filter = a recruiter can only close their own job
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, recruiterId: req.user._id },
      { isOpen: false },
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    res.json({ success: true, message: "Job closed. Students can no longer apply.", data: job });
  } catch (err) {
    next(err);
  }
};

// GET /api/recruiter/jobs/:id/applications?status=SHORTLISTED   (status optional)
export const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiterId: req.user._id });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const filter = { jobId: job._id };
    if (req.query.status) {
      if (!APPLICATION_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "status must be APPLIED, SHORTLISTED or NOT_SHORTLISTED",
        });
      }
      filter.status = req.query.status;
    }

    const applications = await Application.find(filter)
      .populate("studentId", "name email phone student")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      data: { job, applications },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/recruiter/applications/:id
// body: { "status": "SHORTLISTED" | "NOT_SHORTLISTED" | "APPLIED", "remarks": "Cleared round 1" }
export const updateApplication = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    if (status === undefined && remarks === undefined) {
      return res.status(400).json({ success: false, message: "Send status and/or remarks" });
    }
    if (status !== undefined && !APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "status must be APPLIED, SHORTLISTED or NOT_SHORTLISTED",
      });
    }

    const application = await Application.findById(req.params.id).populate("jobId", "recruiterId");
    // Only the recruiter who posted the job can update its applications
    if (!application || !application.jobId || !application.jobId.recruiterId.equals(req.user._id)) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (status !== undefined) application.status = status;
    if (remarks !== undefined) application.remarks = remarks;
    await application.save();

    res.json({ success: true, message: "Application updated", data: application });
  } catch (err) {
    next(err);
  }
};
