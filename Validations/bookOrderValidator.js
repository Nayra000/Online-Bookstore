const { check, body } = require("express-validator");
const validatorMiddleware = require("../Middlewares/validatorMiddleware");
const Book = require("../Models/bookModel");

const validateBookId = body("book")
    .notEmpty()
    .withMessage("❌ Book ID is required")
    .isMongoId()
    .withMessage("❌ Invalid Book ID format")
    .custom(async (bookId) => {
        const bookExists = await Book.exists({ _id: bookId });
        if (!bookExists) {
            throw new Error("❌ Book not found");
        }
    });

const validateQuantity = body("quantity")
    .notEmpty()
    .withMessage("❌ Quantity is required")
    .isInt({ min: 1 })
    .withMessage("❌ Quantity must be a positive integer of at least 1");

const validatePriceAtPurchase = body("priceAtPurchase")
    .notEmpty()
    .withMessage("❌ Price at purchase is required")
    .isFloat({ min: 0 })
    .withMessage("❌ Price cannot be negative");

exports.createBookOrderValidator = [
    validateBookId,
    validateQuantity,
    validatePriceAtPurchase,
    validatorMiddleware,
];
