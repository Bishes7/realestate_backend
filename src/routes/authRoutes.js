import express from "express";
import {
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

export default router;
