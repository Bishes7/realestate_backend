import { catchAsync } from "../middlewares/catchAsync.js";
import Listing from "../models/listingModel.js";
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

// get Stats
export const getAdminStats = catchAsync(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalListings = await Listing.countDocuments();

  // listings group by type (rent or sell)
  const listingsByType = await Listing.aggregate([
    { $group: { _id: "$type", count: { $sum: 1 } } },
  ]);

  // Listings grouped by month
  const listingsByMonth = await Listing.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const usersByWeek = await User.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: "%G-%V", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    totalUsers,
    totalListings,
    listingsByType,
    listingsByMonth,
    usersByWeek,
  });
});
