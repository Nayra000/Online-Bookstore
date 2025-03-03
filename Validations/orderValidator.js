const { check, body } = require("express-validator");
const validatorMiddleware = require("../Middlewares/validatorMiddleware");
const User = require("../Models/userModel");
const Book = require("../Models/bookModel");
const Order = require("../Models/orderModel");
const ApiError = require("../Utils/apiError");

const isMongoId = check("id").isMongoId().withMessage("❌ Invalid ID format");

const validateUserId = body("user")
    .notEmpty()
    .withMessage("❌ User ID is required")
    .isMongoId()
    .withMessage("❌ Invalid User ID format")
    .custom(async (userId) => {
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            throw new Error("❌ User not found");
        }
    });

const validateBooks = body("books")
    .isArray({ min: 1 })
    .withMessage("❌ Books must be an array with at least one item")
    .custom(async (books) => {
        const bookIds = books.map((item) => item.book);
        const foundBooks = await Book.find({ _id: { $in: bookIds } });
        if (foundBooks.length !== bookIds.length) {
            throw new Error("❌ One or more books not found");
        }
    });

const validateBookItem = [
    body("books.*.book")
        .notEmpty()
        .withMessage("❌ Book ID is required")
        .isMongoId()
        .withMessage("❌ Invalid Book ID format"),
    body("books.*.quantity")
        .notEmpty()
        .withMessage("❌ Quantity is required")
        .isInt({ min: 1 })
        .withMessage("❌ Quantity must be a positive integer"),
    body("books.*.priceAtPurchase")
        .notEmpty()
        .withMessage("❌ Price at purchase is required")
        .isFloat({ min: 0 })
        .withMessage("❌ Price cannot be negative"),
];

const validatePaymentMethod = body("paymentMethod")
    .optional()
    .isIn(["cash", "visa"])
    .withMessage("❌ Invalid payment method");

const validateStatus = body("status")
    .optional()
    .custom(async (status, { req }) => {
        const allowedStatuses = ["pending", "out for delivery", "delivered", "canceled"];
        const userRole = req.user.role;
        const order = await Order.findById(req.params.id).exec();
        const currentStatus = order.status;

        if (!allowedStatuses.includes(status)) {
            throw new ApiError("❌ Invalid status", 400);
        }

        if (userRole === "admin") {
            return true;
        } else if (userRole === "user") {
            if (currentStatus === "pending" && status === "canceled") {
                return true;
            } else {
                throw new ApiError("❌ You can only change status from 'pending' to 'canceled'", 403);
            }
        } else {
            throw new ApiError("❌ Unauthorized role", 403);
        }
    });

const validateDiscountAmount = body("discountAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("❌ Discount must be a non-negative number")
    .custom((value, { req }) => {
        const totalWithoutDiscount = req.body.totalWithoutDiscount || 0;
        if (value > totalWithoutDiscount) {
            throw new Error("❌ Discount cannot exceed the total price");
        }
        return true;
    });

exports.createOrderValidator = [
    // validateUserId,
    validateBooks,
    ...validateBookItem,
    validatePaymentMethod,
    validateDiscountAmount,
    validatorMiddleware,
];

exports.updateOrderValidator = [
    isMongoId,
    validateStatus,
    validatorMiddleware,
];

exports.getOrderValidator = [isMongoId, validatorMiddleware];
