import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
  const { userName, email, password } = req.body;
  // hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = new User({ userName, email, password: hashedPassword });
  await newUser.save();
  res.status(200).json("user created successfully");
};
