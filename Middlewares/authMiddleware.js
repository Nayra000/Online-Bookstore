const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../Models/userModel");
const ApiError = require("../Utils/apiError");
const logger = require("../logger")("auth");


// Extract token from request headers
const extractToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

// Validate user existence and password change
const validateUser = async (decoded) => {
  const user = await User.findById(decoded.userId);
  if (!user) {
    logger.warn(`Invalid token used: User (ID: ${decoded.userId}) no longer exists.`);
    throw new ApiError("User associated with this token no longer exists.", 401);
  }

  if (user.passwordChangedAt) {
    const passChangedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (passChangedTimestamp > decoded.iat) {
      logger.warn(`User (Email: ${user.email}) attempted login with an outdated token.`);
      throw new ApiError("Your password has been changed recently. Please log in again.", 401);
    }
  }

  return user;
};

// Protect middleware
exports.protect = asyncHandler(async (req, res, next) => {
  try {
    // 1) Extract and verify token
    const token = extractToken(req);
    if (token == "null" || !token) {
      logger.warn(`Unauthorized access attempt to ${req.originalUrl} from IP: ${req.ip}`);
      throw new ApiError("Access denied. Please log in to continue.", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await validateUser(decoded);

    logger.info(`User (Email: ${req.user.email}) authenticated successfully for ${req.originalUrl}`);
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    next(error);
  }
});

// Authorization middleware
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.warn(`User (Email: ${req.user.email}, Role: ${req.user.role}) tried to access ${req.originalUrl} without permission.`);
      return next(new ApiError("You are not allowed to access this route", 403));
    }

    logger.info(`User (Email: ${req.user.email}, Role: ${req.user.role}) authorized for ${req.originalUrl}`);
    next();
  });
