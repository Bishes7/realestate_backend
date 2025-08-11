import express from "express";
import { updateUserProfile } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.put("/update-profile", isAuthenticated, updateUserProfile);

export default router;
