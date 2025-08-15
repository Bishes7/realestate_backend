import bcrypt from "bcryptjs";
import { catchAsync } from "../middlewares/catchAsync.js";
import User from "../models/userModel.js";
import Listing from "../models/listingModel.js";

// update user profile

export const updateUserProfile = catchAsync(async (req, res) => {
  // find the logged-in user by id from token

  const user = await User.findById(req.userInfo._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update fields
  if (req.body.userName) user.userName = req.body.userName;
  if (req.body.email) user.email = req.body.email;

  if (req.body.password) {
    user.password = bcrypt.hashSync(req.body.password, 10);
  }

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    userName: updatedUser.userName,
    email: updatedUser.email,
  });
});

// get user listings
export const getUserListings = catchAsync(async (req, res) => {
  if (req.userInfo._id.toString() === req.params.id) {
    const listings = await Listing.find({ user: req.userInfo._id });
    res.status(200).json(listings);
  } else {
    res.status(403);
    throw new Error("You can only view your own listings");
  }
});
