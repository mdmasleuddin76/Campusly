import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import tpoRoutes from "./routes/tpoRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Behind Nginx in production: trust the first proxy so req.ip / req.secure are correct
app.set("trust proxy", 1);

// credentials:true lets the browser send the cookie from the React app
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health check - use this to test the server is up
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Campusly API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tpo", tpoRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/student", studentRoutes);

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Must be last
app.use(errorHandler);

export default app;
