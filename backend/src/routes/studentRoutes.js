import express from "express";
import { getOpenJobs, getJob, applyToJob, getMyApplications, updateProfile } from "../controllers/studentController.js";
import auth from "../middleware/auth.js";
import allowRoles from "../middleware/allowRoles.js";

const router = express.Router();

// Every route in this file is student-only
router.use(auth, allowRoles("STUDENT"));

router.get("/jobs", getOpenJobs);
router.get("/jobs/:id", getJob);
router.post("/jobs/:id/apply", applyToJob);
router.get("/applications", getMyApplications);
router.put("/profile", updateProfile);

export default router;
