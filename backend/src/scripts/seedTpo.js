// Creates the TPO account from .env. Run once: npm run seed:tpo
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const { MONGO_URI, TPO_NAME, TPO_EMAIL, TPO_PASSWORD } = process.env;

if (!MONGO_URI || !TPO_EMAIL || !TPO_PASSWORD) {
  console.error("Set MONGO_URI, TPO_EMAIL and TPO_PASSWORD in .env first");
  process.exit(1);
}

await mongoose.connect(MONGO_URI);

const exists = await User.findOne({ email: TPO_EMAIL.toLowerCase() });
if (exists) {
  console.log("TPO already exists:", TPO_EMAIL);
} else {
  await User.create({
    name: TPO_NAME || "TPO",
    email: TPO_EMAIL,
    password: await bcrypt.hash(TPO_PASSWORD, 10),
    role: "TPO",
    status: "APPROVED",
  });
  console.log("TPO created:", TPO_EMAIL);
}

await mongoose.disconnect();
