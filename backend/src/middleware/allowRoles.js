// Usage: router.get("/x", auth, allowRoles("TPO"), handler)
// Must run after auth, because it reads req.user
const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "You don't have access to this" });
  }
  next();
};

export default allowRoles;
