import { catchAsync } from "../middlewares/catchAsync.js";
import Listing from "../models/listingModel.js";
const BASE_URL = process.env.BASE_URL;

// create listing
export const addlistingController = catchAsync(async (req, res) => {
  const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

  const listingData = {
    name: req.body.name,
    description: req.body.description,
    address: req.body.address,
    beds: Number(req.body.beds),
    baths: Number(req.body.baths),
    regularPrice: Number(req.body.regularPrice),
    discountedPrice: Number(req.body.discountedPrice),
    furnished: req.body.furnished === "true",
    parking: req.body.parking === "true",
    offer: req.body.offer === "true",
    type: req.body.type,
    images: imagePaths, // store file paths
    user: req.userInfo._id, // attach user securely
  };

  const listing = await Listing.create(listingData);
  const updatedListing = {
    ...listing._doc,
    images: listing.images.map((img) => `${BASE_URL}${img}`),
  };

  return res.status(201).json(updatedListing);
});

export const deleteListingController = catchAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({ message: "Listing not found" });
  }

  await Listing.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Listing has been deleted" });
});

// get listings using id
export const getListingController = catchAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ message: "Listing not found" });
  }

  res.status(200).json(listing);
});

// get Listings
export const getListings = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 9;
  const startIndex = parseInt(req.query.startIndex) || 0;
  let offer = req.query.offer;

  if (offer === undefined || offer === "false") {
    offer = { $in: [false, true] };
  }

  let furnished = req.query.furnished;
  if (furnished === undefined || furnished === "false") {
    furnished = { $in: [false, true] };
  }
  let parking = req.query.parking;
  if (parking === undefined || parking === "false") {
    parking = { $in: [false, true] };
  }

  let type = req.query.type;
  if (type === undefined || type === "all") {
    type = { $in: ["sell", "rent"] };
  }
  const searchTerm = req.query.searchTerm || "";

  const sortField = req.query.sort || "createdAt";
  const sortOrder = req.query.order === "asc" ? 1 : -1;

  const listings = await Listing.find({
    name: { $regex: searchTerm, $options: "i" },
    offer,
    furnished,
    parking,
    type,
  })
    .sort({ [sortField]: sortOrder })
    .limit(limit)
    .skip(startIndex);

  return res.status(200).json(listings);
});

// update listings

export const updateListingController = catchAsync(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).json({ message: "Listing not found" });
  }

  // Update fields from the request body
  listing.name = req.body.name || listing.name;
  listing.description = req.body.description || listing.description;
  listing.address = req.body.address || listing.address;
  listing.beds = Number(req.body.beds) || listing.beds;
  listing.baths = Number(req.body.baths) || listing.baths;
  listing.regularPrice = Number(req.body.regularPrice) || listing.regularPrice;
  listing.discountedPrice =
    Number(req.body.discountedPrice) || listing.discountedPrice;
  listing.furnished = req.body.furnished ?? listing.furnished;
  listing.parking = req.body.parking ?? listing.parking;
  listing.offer = req.body.offer ?? listing.offer;
  listing.type = req.body.type || listing.type;

  // Handle new images if provided
  if (req.files && req.files.length > 0) {
    listing.images = req.files.map((file) => `/uploads/${file.filename}`);
  }

  const updatedListing = await listing.save();

  const BASE_URL = process.env.BASE_URL || "http://localhost:8000";
  res.status(200).json({
    ...updatedListing._doc,
    images: updatedListing.images.map((img) => `${BASE_URL}${img}`),
  });
});
