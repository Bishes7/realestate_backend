import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "./src/models/userModel.js";
import { dbConnect } from "./src/config/dbConnect.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await dbConnect();

    // check if admin already exists
    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (adminExists) {
      console.log("Admin already exists");
      process.exit();
    }

    const admin = new User({
      userName: "Admin",
      email: "admin@example.com",
      password: bcrypt.hashSync("admin123", 10), // ✅ hashed password
      role: "admin",
    });

    await admin.save();
    console.log("Admin user created successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
