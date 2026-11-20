import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String, required: true, trim: true }, // copied from the recruiter when the job is created
    role: { type: String, required: true, trim: true }, // e.g. "SDE Intern"
    package: { type: String, trim: true }, // e.g. "12 LPA"
    location: { type: String, trim: true },
    jobType: { type: String, enum: ["FULL_TIME", "INTERNSHIP"], default: "FULL_TIME" },
    description: { type: String, trim: true },
    jdLink: { type: String, trim: true }, // link only, no PDF upload
    eligibility: { type: String, trim: true }, // free text, e.g. "CSE / IT only"
    minCgpa: { type: Number, min: 0, max: 10 }, // not set = no CGPA limit
    maxBacklogs: { type: Number, min: 0 }, // not set = no backlog limit, 0 = no backlogs allowed
    deadline: { type: Date },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" }, // set by TPO
    isOpen: { type: Boolean, default: true }, // recruiter closes it
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, isOpen: 1 });

const Job = mongoose.model("Job", jobSchema);
export default Job;
