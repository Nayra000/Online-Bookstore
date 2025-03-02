const { check, param,body } = require("express-validator");
const validatorMiddleware = require("../Middlewares/validatorMiddleware");
const ApiError = require("../Utils/apiError");

exports.validateAddToCart = [
    body() .custom((value, { req }) => {
      // console.log(typeof value);
    if (
      !value ||
      typeof value !== "object" ||
      Object.keys(value).length === 0
    ) {
      throw new ApiError("Cart cannot be empty and must be an object.", 400);
    }

    for (const [bookId, quantity] of Object.entries(value)) {
      if (!/^[0-9a-fA-F]{24}$/.test(bookId)) {
        throw new ApiError(`Invalid book ID: ${bookId}`, 400);
      }
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new ApiError(
          `Quantity for book ${bookId} must be a positive integer.`,
          400
        );
      }
    }

    return true;
  }),
  validatorMiddleware,
];

exports.validateUpdateCartItem = [
  body().custom((value) => {
    if (
      !value ||
      typeof value !== "object" ||
      Object.keys(value).length === 0
    ) {
      throw new ApiError(
        "Cart update data is required and must be an object.",
        400
      );
    }

    for (const [bookId, quantity] of Object.entries(value)) {
      if (!bookId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError(`Invalid book ID: ${bookId}`, 400);
      }
      if (!Number.isInteger(quantity) || quantity < 0) {
        throw new ApiError(
          `Quantity for book ${bookId} must be a non-negative integer.`,
          400
        );
      }
    }
    return true;
  }),
  validatorMiddleware,
];

exports.validateRemoveFromCart = [
  param("id").isMongoId().withMessage("Invalid book ID."),
  validatorMiddleware,
];

exports.validateClearCart = [
  (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("User authentication required.", 401));
    }
    next();
  },
];
