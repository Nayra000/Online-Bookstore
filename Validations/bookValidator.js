const { body } = require("express-validator");
const validatorMiddleware = require("../Middlewares/validatorMiddleware");
const Users = require("../Models/userModel");


const validateTitle = body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required");

const validateAuthor = body("author")
    .trim()
    .notEmpty()
    .withMessage("Author is required");

const validatePrice = body("price")
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than 0');

const validateDescription = body("description")
    .trim()
    .notEmpty()
    .withMessage('You must provide a description for the book')

const validateStock = body("stock")
    .isInt({ min: 0 })
    .withMessage('Stock must be a number greater than 0');

const validateReviews = body('reviews')
    .optional()
    .isArray()
    .withMessage('Reviews must be an array');

const validateReviewUser = body('reviews.*.user_id')
    .optional()
    .isMongoId()
    .withMessage('You must provide a valid user id for the review')
    .custom(async (val) => {
        if (val) {
            const user = await Users.findById(val);
            if (!user) {
                return Promise.reject('There is no user with that id');
            }
        }
    });

const validateReviewRating = body('reviews.*.rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be a number between 1 and 5');

const validateReviewComment = body('reviews.*.comment')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('You must provide a comment for the review');

exports.validateBook = [
    validateTitle,
    validateAuthor,
    validatePrice,
    validateDescription,
    validateStock,
    validateReviews,
    validateReviewUser,
    validateReviewRating,
    validateReviewComment,
    validatorMiddleware
];
