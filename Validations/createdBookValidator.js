const { body } = require("express-validator");
const validatorMiddleware = require("../Middlewares/validatorMiddleware");



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





exports.validateCreatedBook = [
    validateTitle,
    validateAuthor,
    validatePrice,
    validateDescription,
    validateStock,
    validatorMiddleware
];
