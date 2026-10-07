import jwt from "jsonwebtoken";
import User from "../models/User.js";

const requireAuth = async (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Please log in to continue." });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Authentication is not configured." });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }

  try {
    const user = await User.findById(decoded.id).select("email role");
    if (!user) {
      return res.status(401).json({ message: "Your account could not be verified." });
    }

    req.authUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default requireAuth;
