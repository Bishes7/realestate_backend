import { catchAsync } from "../middlewares/catchAsync.js";
import Listing from "../models/listingModel.js";
const BASE_URL = process.env.BASE_URL || "http://localhost:8000";

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
    sqft: Number(req.body.sqft) || 0,
    images: imagePaths, // store file paths
    user: req.userInfo._id, // attach user securely
  };

  const listing = await Listing.create(listingData);
  const updatedListing = {
    ...listing._doc,
    imageUrls: listing.images.map((img) => `${BASE_URL}${img}`),
    bedrooms: listing.beds,
    bathrooms: listing.baths,
    sqft: listing.sqft || 0
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

  // authorization: public can only see approved (or legacy without status); owners/admin can see all
  const isOwner = req.userInfo && listing.user.toString() === req.userInfo._id.toString();
  const isAdmin = req.userInfo && req.userInfo.role === "admin";
  // Only block fully rejected listings; allow pending to be visible for demo UX
  const isBlocked = listing.status === "rejected";
  if (isBlocked && !isOwner && !isAdmin) {
    return res.status(404).json({ message: "Listing not found" });
  }

  // increment views for visible listings
  if (!isBlocked) {
    listing.views = (listing.views || 0) + 1;
    await listing.save();
  }

  // Transform single listing to include full image URLs and correct field names
  const transformedListing = {
    ...listing._doc,
    imageUrls: listing.images.map(img => `${BASE_URL}${img}`),
    bedrooms: listing.beds,
    bathrooms: listing.baths,
    sqft: listing.sqft || 0
  };

  res.status(200).json(transformedListing);
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

  // Build query filter
  const filter = {
    name: { $regex: searchTerm, $options: "i" },
    offer,
    furnished,
    parking,
    type,
    $or: [{ status: "approved" }, { status: "pending" }, { status: { $exists: false } }],
  };

  // get total count for pagination
  const totalCount = await Listing.countDocuments(filter);

  // get paginated Listings
  const listings = await Listing.find(filter)
    .sort({ [sortField]: sortOrder })
    .limit(limit)
    .skip(startIndex);

  // Transform listings to include full image URLs and correct field names
  const transformedListings = listings.map(listing => ({
    ...listing._doc,
    imageUrls: listing.images.map(img => `${BASE_URL}${img}`),
    bedrooms: listing.beds,
    bathrooms: listing.baths,
    sqft: listing.sqft || 0 // Add default sqft if not present
  }));

  // send listings and total count
  return res.status(200).json({ listings: transformedListings, totalCount });
});

// Admin: get all listings regardless of status
export const adminGetAllListings = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const startIndex = parseInt(req.query.startIndex) || 0;
  const listings = await Listing.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);
  const totalCount = await Listing.countDocuments({});
  
  // Transform listings to include full image URLs and correct field names
  const transformedListings = listings.map(listing => ({
    ...listing._doc,
    imageUrls: listing.images.map(img => `${BASE_URL}${img}`),
    bedrooms: listing.beds,
    bathrooms: listing.baths,
    sqft: listing.sqft || 0
  }));
  
  return res.status(200).json({ listings: transformedListings, totalCount });
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
  listing.sqft = Number(req.body.sqft) || listing.sqft;

  // Handle new images if provided
  if (req.files && req.files.length > 0) {
    listing.images = req.files.map((file) => `/uploads/${file.filename}`);
  }

  const updatedListing = await listing.save();

  const BASE_URL = process.env.BASE_URL || "http://localhost:8000";
  res.status(200).json({
    ...updatedListing._doc,
    imageUrls: updatedListing.images.map((img) => `${BASE_URL}${img}`),
    bedrooms: updatedListing.beds,
    bathrooms: updatedListing.baths,
    sqft: updatedListing.sqft || 0
  });
});

// popular listings
export const getPopularListings = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;
  const listings = await Listing.find({ status: "approved" })
    .sort({ views: -1 })
    .limit(limit);
  
  // Transform listings to include full image URLs and correct field names
  const transformedListings = listings.map(listing => ({
    ...listing._doc,
    imageUrls: listing.images.map(img => `${BASE_URL}${img}`),
    bedrooms: listing.beds,
    bathrooms: listing.baths,
    sqft: listing.sqft || 0
  }));
  
  res.status(200).json(transformedListings);
});

// similar listings based on type and price range
export const getSimilarListings = catchAsync(async (req, res) => {
  const { id } = req.params;
  const current = await Listing.findById(id);
  if (!current) return res.status(404).json({ message: "Listing not found" });
  const price = current.discountedPrice > 0 ? current.discountedPrice : current.regularPrice;
  const delta = Math.max(5000, Math.round(price * 0.2));
  const listings = await Listing.find({
    _id: { $ne: id },
    status: "approved",
    type: current.type,
    $or: [
      { regularPrice: { $gte: price - delta, $lte: price + delta } },
      { discountedPrice: { $gte: price - delta, $lte: price + delta } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(6);
  
  // Transform listings to include full image URLs and correct field names
  const transformedListings = listings.map(listing => ({
    ...listing._doc,
    imageUrls: listing.images.map(img => `${BASE_URL}${img}`),
    bedrooms: listing.beds,
    bathrooms: listing.baths,
    sqft: listing.sqft || 0
  }));
  
  res.status(200).json(transformedListings);
});
