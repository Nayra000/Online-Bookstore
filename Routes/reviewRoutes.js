const express = require("express");
const { createReview, updateReview, deleteReview } = require("../Controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

//only logged in users can create a review
router.post("/:bookId/reviews", protect, createReview);

//only the review owner can update the review
router.put("/reviews/:reviewId", protect, updateReview);

//review owner or admins can delete a review
router.delete("/reviews/:reviewId", protect, deleteReview);

module.exports = router;
