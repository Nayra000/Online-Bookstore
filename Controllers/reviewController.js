const Book = require("../models/bookModel");

//creating a new review
exports.createReview = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const existingReview = book.reviews.find((r) => r.userId.toString() === userId);
    if (existingReview) return res.status(400).json({ message: "You have already reviewed this book" });

    const newReview = { userId, rating, comment };
    book.reviews.push(newReview);
    await book.save();

    res.status(201).json({ message: "Review added successfully", review: newReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//getting reviews for a specified book
exports.getReviewsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId).populate("reviews.userId", "name");

    if (!book) return res.status(404).json({ message: "Book not found" });

    res.status(200).json(book.reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//updating a review
exports.updateReview = async (req, res) => {
  try {
    const { bookId, reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const review = book.reviews.find((r) => r._id.toString() === reviewId);
    if (!review || review.userId.toString() !== userId) return res.status(403).json({ message: "Not authorized to update this review" });

    review.rating = rating;
    review.comment = comment;
    await book.save();

    res.status(200).json({ message: "Review updated successfully", review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//deleting a review
exports.deleteReview = async (req, res) => {
  try {
    const { bookId, reviewId } = req.params;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const reviewIndex = book.reviews.findIndex((r) => r._id.toString() === reviewId);
    if (reviewIndex === -1 || book.reviews[reviewIndex].userId.toString() !== userId) return res.status(403).json({ message: "You are not authorized to delete this review" });

    book.reviews.splice(reviewIndex, 1);
    await book.save();

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
