import Job from "../models/Job.js";
import Application from "../models/Application.js";

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

// GET /api/student/jobs   - open jobs only, each with a hasApplied flag
export const getOpenJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find(openJobFilter()).sort({ createdAt: -1 }).lean();

    // Which of these jobs has this student already applied to? (one query)
    const applied = await Application.find({
      studentId: req.user._id,
      jobId: { $in: jobs.map((j) => j._id) },
    }).select("jobId");
    const appliedIds = new Set(applied.map((a) => a.jobId.toString()));

    const data = jobs.map((job) => ({ ...job, hasApplied: appliedIds.has(job._id.toString()) }));
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/student/jobs/:id   - job details (+ the student's application if they applied)
export const getJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, status: "APPROVED" }).lean();
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const application = await Application.findOne({ jobId: job._id, studentId: req.user._id });

    // A closed job is still visible to students who applied, so they can check their status
    const canApply = job.isOpen && (!job.deadline || new Date(job.deadline) >= new Date());
    if (!canApply && !application) {
      return res.status(404).json({ success: false, message: "This job is no longer open" });
    }

    res.json({
      success: true,
      data: { ...job, canApply: canApply && !application, hasApplied: !!application, application },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/student/jobs/:id/apply   body: { "resumeLink": "https://drive.google.com/..." }
export const applyToJob = async (req, res, next) => {
  try {
    const { resumeLink } = req.body;
    if (!resumeLink || !isValidLink(resumeLink)) {
      return res.status(400).json({ success: false, message: "A valid resume link (http/https) is required" });
    }

    // Checks approved + open + deadline in one query
    const job = await Job.findOne({ _id: req.params.id, ...openJobFilter() });
    if (!job) {
      return res.status(400).json({ success: false, message: "This job is not open for applications" });
    }

    const already = await Application.findOne({ jobId: job._id, studentId: req.user._id });
    if (already) return res.status(409).json({ success: false, message: "You have already applied to this job" });

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
      .populate("jobId", "companyName role package location jobType jdLink deadline isOpen")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    next(err);
  }
};
