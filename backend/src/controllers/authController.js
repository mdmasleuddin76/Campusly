import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken, { cookieOptions } from "../utils/generateToken.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Checks the fields every user needs. Returns an error message or null.
const validateCommon = ({ name, email, password }) => {
  if (!name || !email || !password) return "Name, email and password are required";
  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    return "Name, email and password must be text";
  }
  if (!EMAIL_REGEX.test(email)) return "Invalid email";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
};

// POST /api/auth/signup/student
export const studentSignup = async (req, res, next) => {
  try {
    const { name, email, password, phone, rollNo, department, cgpa, graduationYear } = req.body;

    const error = validateCommon(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    if (!rollNo || !department || cgpa === undefined || !graduationYear) {
      return res.status(400).json({
        success: false,
        message: "Roll number, department, CGPA and graduation year are required",
      });
    }
    if (cgpa === "" || isNaN(cgpa) || Number(cgpa) < 0 || Number(cgpa) > 10) {
      return res.status(400).json({ success: false, message: "CGPA must be between 0 and 10" });
    }
    if (!Number.isInteger(Number(graduationYear))) {
      return res.status(400).json({ success: false, message: "Graduation year must be a number, e.g. 2026" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, message: "Email already registered" });

    // Roll number must be unique among students
    const rollTaken = await User.findOne({ role: "STUDENT", "student.rollNo": String(rollNo).trim().toUpperCase() });
    if (rollTaken) return res.status(409).json({ success: false, message: "Roll number already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role: "STUDENT",
      status: "PENDING",
      student: { rollNo, department, cgpa: Number(cgpa), graduationYear: Number(graduationYear) },
    });

    res.status(201).json({
      success: true,
      message: "Signup successful. Wait for TPO approval before logging in.",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/signup/recruiter
export const recruiterSignup = async (req, res, next) => {
  try {
    const { name, email, password, phone, companyName, companyWebsite, designation, companyDescription } =
      req.body;

    const error = validateCommon(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    if (!companyName || !designation) {
      return res.status(400).json({ success: false, message: "Company name and designation are required" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role: "RECRUITER",
      status: "PENDING",
      recruiter: { companyName, companyWebsite, designation, companyDescription },
    });

    res.status(201).json({
      success: true,
      message: "Signup successful. Wait for TPO approval before logging in.",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login  (same for STUDENT, RECRUITER and TPO)
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // password has select:false, so ask for it explicitly
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    const passwordOk = user && (await bcrypt.compare(password, user.password));
    if (!passwordOk) {
      // Same message for wrong email and wrong password
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.status === "PENDING") {
      return res.status(403).json({ success: false, message: "Your account is waiting for TPO approval" });
    }
    if (user.status === "REJECTED") {
      return res.status(403).json({ success: false, message: "Your account was rejected by the TPO" });
    }

    generateToken(res, user);
    res.json({ success: true, message: "Login successful", data: user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (protected)
export const getMe = (req, res) => {
  res.json({ success: true, data: req.user });
};

// POST /api/auth/logout
export const logout = (req, res) => {
  const { maxAge, ...options } = cookieOptions;
  res.clearCookie("token", options);
  res.json({ success: true, message: "Logged out" });
};
