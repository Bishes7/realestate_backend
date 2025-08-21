import { catchAsync } from "../middlewares/catchAsync.js";
import User from "../models/userModel.js";

//  get all users
export const getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.status(200).json(users);
});

// delete a user
export const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === "admin") {
      res.status(400).json({ message: "cannot delete another admin" });
    }
    await user.deleteOne();
    res.status(200).json({ message: "user deleted" });
  } else {
    res.status(404).json({ message: "user not found" });
  }
});

// update user role
export const updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;

  const user = await User.findById(req.params.id);

  if (user) {
    user.role = role || user.role;
    await user.save();

    res.status(200).json({
      message: "user role updated",
      _id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: "user not found" });
  }
});
