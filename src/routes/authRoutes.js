import express from "express";
import {
  demoLogin,
  loginUser,
  logoutUser,
  signUp,
} from "../controllers/authController.js";

const router = express.Router();

// signup routes
router.post("/signup", signUp);

// login routes
router.post("/login", loginUser);

// logout routes
router.post("/logout", logoutUser);

// demo user
router.post("/demo-login", demoLogin);

export default router;
