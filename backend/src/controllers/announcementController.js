import Announcement from "../models/Announcement.js";

// GET /api/announcements   (any logged-in user)
export const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: announcements.length, data: announcements });
  } catch (err) {
    next(err);
  }
};

// POST /api/announcements   (TPO)   body: { title, description, link }
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, description, link } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const announcement = await Announcement.create({
      title,
      description,
      link,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, message: "Announcement created", data: announcement });
  } catch (err) {
    next(err);
  }
};

// PUT /api/announcements/:id   (TPO)   body: any of { title, description, link }
export const updateAnnouncement = async (req, res, next) => {
  try {
    const { title, description, link } = req.body;
    if (title !== undefined && !String(title).trim()) {
      return res.status(400).json({ success: false, message: "Title can't be empty" });
    }

    // Only update the fields that were sent
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (link !== undefined) updates.link = link;

    const announcement = await Announcement.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found" });

    res.json({ success: true, message: "Announcement updated", data: announcement });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/announcements/:id   (TPO)
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found" });

    res.json({ success: true, message: "Announcement deleted" });
  } catch (err) {
    next(err);
  }
};
