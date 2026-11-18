import express from "express";
import { getUsers, updateUserStatus, getJobs, updateJobStatus } from "../controllers/tpoController.js";
import auth from "../middleware/auth.js";
import allowRoles from "../middleware/allowRoles.js";

const router = express.Router();

// Every route in this file is TPO-only
router.use(auth, allowRoles("TPO"));

router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);
router.get("/jobs", getJobs);
router.patch("/jobs/:id/status", updateJobStatus);

export default router;
