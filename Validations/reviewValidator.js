const { check, body } = require("express-validator");
const validatorMiddleware = require("../Middlewares/validatorMiddleware");
const Users = require("../Models/userModel");

const validateReviewUser = body('user')
    .isMongoId()
    .withMessage('You must provide a valid user id for the review')
    .custom(async (val) => {
        const user = await Users.findById(val);
        if (!user) {
            return Promise.reject('There is no user with that id');
        }
    });

const validateReviewRating = body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be a number between 1 and 5');

const validateReviewComment = body('comment')
    .trim()
    .notEmpty()
    .withMessage('You must provide a comment for the review');


const validateReviews = body('reviews')
    .optional()
    .isArray()
    .withMessage('Reviews must be an array');

exports.createReviewValidator = [
    validateReviewComment,
    validateReviews,
    validateReviewRating,
    validatorMiddleware,
    validateReviewUser
]