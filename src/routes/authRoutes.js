import express from "express";
import { loginUser, signUp } from "../controllers/authController.js";

const router = express.Router();

// signup routes
router.post("/signup", signUp);

// login routes
router.post("/login", loginUser);

export default router;
