import express from "express";
import { addlistingController } from "../controllers/listingController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", isAuthenticated, addlistingController);

export default router;
