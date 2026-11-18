import jwt from "jsonwebtoken";

const ONE_DAY = 24 * 60 * 60 * 1000;

export const cookieOptions = {
  httpOnly: true, // JS in the browser can't read it
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "lax", // frontend and API are on the same domain, so lax is enough
  maxAge: ONE_DAY,
};

// Signs a JWT with the user's id + role and sets it as the "token" cookie
const generateToken = (res, user) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
  res.cookie("token", token, cookieOptions);
  return token;
};

export default generateToken;
