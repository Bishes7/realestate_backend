import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// is Authenticated Middleware
export const isAuthenticated = async (req, res, next) => {
  let token;
  //   Read the token from the cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      // verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
      req.userInfo = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Invalid token");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized");
  }
};

// Admin Middleware
export const admin = (req, res, next) => {
  if ((req.userInfo && req.userInfo.role === "admin") || req.userInfo.isDemo) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as admin");
  }
};
