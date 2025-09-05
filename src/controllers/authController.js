import { catchAsync } from "../middlewares/catchAsync.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

// sign up controller
export const signUp = catchAsync(async (req, res, next) => {
  const { userName, email, password } = req.body;
  // check for existing user

  const existingUser = await User.findOne({ email });
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

// login controller
export const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email);

  // find user by email
  const user = await User.findOne({ email });

  // check if the user exists and password matches
  if (user && bcrypt.compareSync(password, user.password)) {
    // generate JWT cookie
    generateToken(res, user._id);

    res.status(200).json({
      message: "Login Successfully",
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

// logout controller
export const logoutUser = catchAsync(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// Demo login User Controller
export const demoLogin = catchAsync(async (req, res) => {
  const email = process.env.DEMO_USER_EMAIL;
  const password = process.env.DEMO_USER_PASSWORD;
  const userName = process.env.DEMO_USER_NAME || "Demo User";

  if (!email || !password) {
    return res.status(500).json({ message: "Demo user not found" });
  }

  // find demo user
  let demoUser = await User.findOne({ email });

  if (!demoUser) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    demoUser = new User({
      userName,
      email,
      password: hashedPassword,
      role: "user",
      isDemo: true,
    });
    await demoUser.save();
  }
  // generate cookie
  const token = generateToken(res, demoUser._id);

  res.status(200).json({
    message: "Logged in as Demo User",
    user: {
      _id: demoUser._id,
      userName: demoUser.userName,
      email: demoUser.email,
      role: demoUser.role,
      isDemo: demoUser.isDemo,
    },
    token,
  });
});
