import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeLink: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["APPLIED", "SHORTLISTED", "NOT_SHORTLISTED"],
      default: "APPLIED",
    },
    remarks: { type: String, trim: true }, // recruiter's note, e.g. "Cleared round 1"
  },
  { timestamps: true }
);

// A student can apply to a job only once
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);
export default Application;
