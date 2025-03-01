const Book = require("../models/bookModel");
const asyncHandler = require("express-async-handler");
const Joi = require("joi");

//used Joi for validation; rating is btween 1-5, and the comment is not more than 500 characters
const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5),
  comment: Joi.string().max(500)
});

//merged the creation and updating functions in one; as the user can only have one review per book
exports.createOrUpdateReview = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  //validate the input
  const { error } = reviewSchema.validate({ rating, comment });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  //find the book
  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  //check if user already made a review for this book
  const existingReviewIndex = book.reviews.findIndex(r => r.user.toString() === userId.toString());

  if (existingReviewIndex !== -1) {
    //user can update his review
    book.reviews[existingReviewIndex].rating = rating;
    book.reviews[existingReviewIndex].comment = comment;
    book.reviews[existingReviewIndex].updatedAt = Date.now();
  } else {
    //adding a new review
    book.reviews.push({
      user: userId,
      rating,
      comment,
      createdAt: Date.now()
    });
  }

  //recalculate the average rating
  book.averageRating = (
    book.reviews.reduce((acc, r) => acc + r.rating, 0) / book.reviews.length
  ).toFixed(1);

  await book.save();
  res.status(201).json({ message: "Review added/updated successfully", reviews: book.reviews });
});

//get the book
exports.getBook = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user?._id;

  const book = await Book.findById(bookId).populate("reviews.user", "name email");
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  let reviews = book.reviews;

  //display the logged in user's review first for easier deletion/update
  if (userId) {
    const userReview = reviews.find(r => r.user._id.toString() === userId.toString());
    if (userReview) {
      reviews = [userReview, ...reviews.filter(r => r !== userReview)];
    }
  }

  res.status(200).json({ book, reviews });
});

//deleting a review can only be done by admins or the user who made the review
exports.deleteReview = asyncHandler(async (req, res) => {
  const { bookId, reviewId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  //find the book
  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  

  //get the review index
  const reviewIndex = book.reviews.findIndex(r => r._id.toString() === reviewId);

    if (reviewIndex === -1) {
        return res.status(404).json({ message: "Review not found" });
    }
    //check if the user is an admin or the review's owner
    if (book.reviews[reviewIndex].user.toString() !== userId.toString() && userRole !== "admin") {
      return res.status(403).json({ message: "You are not authorized to delete this review" });
  }

  //delete the review
  book.reviews.splice(reviewIndex, 1);

  // recalculate the avreg rate after review deletion
  book.averageRating = book.reviews.length
    ? (book.reviews.reduce((acc, r) => acc + r.rating, 0) / book.reviews.length).toFixed(1)
    : 0;

  await book.save();
  res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
});
