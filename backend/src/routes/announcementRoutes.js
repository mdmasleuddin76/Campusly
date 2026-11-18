import express from "express";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import auth from "../middleware/auth.js";
import allowRoles from "../middleware/allowRoles.js";

const router = express.Router();

router.use(auth); // must be logged in for all of these

router.get("/", getAnnouncements); // any role
router.post("/", allowRoles("TPO"), createAnnouncement);
router.put("/:id", allowRoles("TPO"), updateAnnouncement);
router.delete("/:id", allowRoles("TPO"), deleteAnnouncement);

export default router;
