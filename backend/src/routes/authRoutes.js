import express from "express";
import { studentSignup, recruiterSignup, login, getMe, logout } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/signup/student", studentSignup);
router.post("/signup/recruiter", recruiterSignup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", auth, getMe);

export default router;
