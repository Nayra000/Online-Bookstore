const express = require("express");
const { createReview, updateReview, deleteReview, getBookWithReviews, getAllReviews } = require("../Controllers/reviewController");
const { protect, allowedTo } = require("../Middlewares/authMiddleware");
const { createReviewValidator } = require("../Validations/reviewValidator");

const router = express.Router();
router.use(protect);
/////////////////// get reviews 
router.route("/")
    .get(getAllReviews);
    
router.route("/:id")
    .get(
        getBookWithReviews
    );

//only logged-in users can create a review (Done)
router.post(
    "/book/:id",
    allowedTo("user"),
    createReviewValidator,
    createReview
);


router.route("/:id")
    .patch(allowedTo("user"), updateReview)
    .delete(allowedTo("user", "admin"), deleteReview);


module.exports = router;
