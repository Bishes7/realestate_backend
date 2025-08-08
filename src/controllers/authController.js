import { catchAsync } from "../middlewares/catchAsync.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const signUp = catchAsync(async (req, res, next) => {
  const { userName, email, password } = req.body;
  // check for existing user
  const existingUser = await User.find({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "Email already exists, try new email" });
  }
  // hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = new User({ userName, email, password: hashedPassword });
  await newUser.save();
  res.status(201).json("user created successfully");
});
