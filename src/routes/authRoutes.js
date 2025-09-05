import express from "express";
import {
  demoLogin,
  loginUser,
  logoutUser,
  signUp,
  deleteMyAccount,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// signup routes
router.post("/signup", signUp);

// login routes
router.post("/login", loginUser);

// logout routes
router.post("/logout", logoutUser);

// delete account routes
router.delete("/delete-account", isAuthenticated, deleteMyAccount);

// demo user
router.post("/demo-login", demoLogin);

export default router;
