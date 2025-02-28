const express = require("express");
const { createReview, getReviewsByBook, updateReview, deleteReview } = require("../Controllers/reviewController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
//protected as the user must be logged in
router.post("/:bookId", protect, createReview);

router.get("/:bookId", getReviewsByBook);

router.put("/:bookId/:reviewId", protect, updateReview);

router.delete("/:bookId/:reviewId", protect, deleteReview);

module.exports = router;
