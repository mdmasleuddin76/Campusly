import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Reads the JWT from the "token" cookie, loads the user and puts it on req.user
const auth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ success: false, message: "Not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load from DB so a user rejected after login is blocked straight away
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "User no longer exists" });
    if (user.status !== "APPROVED") {
      return res.status(403).json({ success: false, message: "Account not approved" });
    }

    req.user = user;
    next();
  } catch (err) {
    // Expired or tampered token
    return res.status(401).json({ success: false, message: "Session expired, please log in again" });
  }
};

export default auth;
