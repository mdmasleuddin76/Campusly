import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }, // bcrypt hash, never returned by default
    role: { type: String, enum: ["STUDENT", "RECRUITER", "TPO"], required: true },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    phone: { type: String, trim: true },

    // Only filled when role = STUDENT
    student: {
      rollNo: { type: String, trim: true, uppercase: true },
      department: { type: String, trim: true },
      cgpa: { type: Number, min: 0, max: 10 },
      graduationYear: { type: Number },
    },

    // Only filled when role = RECRUITER
    recruiter: {
      companyName: { type: String, trim: true },
      companyWebsite: { type: String, trim: true },
      designation: { type: String, trim: true },
      companyDescription: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

// One roll number per student (recruiters/TPO have no roll number, so they're skipped)
userSchema.index(
  { "student.rollNo": 1 },
  { unique: true, partialFilterExpression: { role: "STUDENT" } }
);

// Remove password and __v whenever a user is sent as JSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
export default User;
