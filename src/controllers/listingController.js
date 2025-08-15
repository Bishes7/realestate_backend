import { catchAsync } from "../middlewares/catchAsync.js";
import Listing from "../models/listingModel.js";

// create listing
export const addlistingController = catchAsync(async (req, res) => {
  const listing = await Listing.create({ ...req.body, user: req.userInfo._id });

  return res.status(201).json(listing);
});
