const Book = require("../models/bookModel");
const Review = require("../models/reviewModel");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");

// @desc    create a new review for a book
// @route   post /api/v1/books/:bookId/reviews
// @access  private
exports.createReview = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { bookId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  //check if the book exists
  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  //check if user already reviewed this book
  const existingReview = await Review.findOne({ book: bookId, user: userId });
  if (existingReview) {
    return res.status(400).json({ message: "You have already reviewed this book" });
  }

  //create a review
  const review = await Review.create({
    user: userId,
    book: bookId,
    rating,
    comment
  });

  //add review reference to book
  book.reviews.push(review._id);
  await book.save();

  res.status(201).json({ message: "Review added successfully", review });
});

// @desc    update an existing review
// @route   put /api/v1/reviews/:reviewId
// @access  private 
exports.updateReview = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  //find the review
  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  //check if the user owns the review
  if (review.user.toString() !== userId.toString()) {
    return res.status(403).json({ message: "You are not authorized to update this review" });
  }

  //update a review
  review.rating = rating;
  review.comment = comment;
  review.updatedAt = Date.now();
  await review.save();

  res.status(200).json({ message: "Review updated successfully", review });
});

// @desc    get a book and its reviews
// @route   get /api/v1/books/:bookId
// @access  public
exports.getBookWithReviews = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user?._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  //find the book
  const book = await Book.findById(bookId).populate({
    path: "reviews",
    populate: { path: "user", select: "name email" },
    options: { sort: { createdAt: -1 } }
  });

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  let reviews = book.reviews;

  //show logged-in user's review first for faster update/delete
  if (userId) {
    const userReview = reviews.find(r => r.user._id.toString() === userId.toString());
    if (userReview) {
      reviews = [userReview, ...reviews.filter(r => r !== userReview)];
    }
  }

  //added pagination
  const totalReviews = reviews.length;
  const paginatedReviews = reviews.slice(skip, skip + limit);

  res.status(200).json({
    book,
    reviews: paginatedReviews,
    totalReviews,
    page,
    totalPages: Math.ceil(totalReviews / limit)
  });
});

// @desc    delete a review
// @route   delete /api/v1/reviews/:reviewId
// @access  private (Review owner or Admin)
exports.deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  //find a review
  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  //check if the user is the owner or an admin
  if (review.user.toString() !== userId.toString() && userRole !== "admin") {
    return res.status(403).json({ message: "You are not authorized to delete this review" });
  }

  //remove reference from the book
  await Book.findByIdAndUpdate(review.book, { $pull: { reviews: review._id } });

  //delete the review
  await review.deleteOne();

  res.status(200).json({ message: "Review deleted successfully" });
});
