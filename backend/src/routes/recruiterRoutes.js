import express from "express";
import {
  createJob,
  getMyJobs,
  getMyJob,
  closeJob,
  getJobApplications,
  updateApplication,
} from "../controllers/recruiterController.js";
import auth from "../middleware/auth.js";
import allowRoles from "../middleware/allowRoles.js";

const router = express.Router();

// Every route in this file is recruiter-only
router.use(auth, allowRoles("RECRUITER"));

router.post("/jobs", createJob);
router.get("/jobs", getMyJobs);
router.get("/jobs/:id", getMyJob);
router.patch("/jobs/:id/close", closeJob);
router.get("/jobs/:id/applications", getJobApplications);
router.patch("/applications/:id", updateApplication);

export default router;
