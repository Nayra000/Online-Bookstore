const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

const ApiError = require("../Utils/apiError");
const createToken = require("../Utils/createToken");
const User = require("../Models/userModel");
const { getWelcomeMessage } = require("../Utils/mailFormat");
const sendEmail = require("../Utils/sendEmail");
const logger = require("../logger");

const sendMail = async (user) => {
  try {
    const message = getWelcomeMessage(user);

    await sendEmail({
      email: user.email,
      subject: "Welcome to Bookstore!",
      message,
    });

    logger("auth").info("Welcome email sent successfully to:", user.email);
  } catch (error) {
    logger("auth").error("Failed to send welcome email:", error);
    throw new ApiError("Failed to send email", 500);
  }
};

exports.signup = asyncHandler(async (req, res, next) => {
  // 1- Create user
  const user = await User.create(req.body);

  // 2- Generate token
  const token = createToken(user._id);

  // 3- Send email (does not block response)
  sendMail(user).catch((err) => logger("auth").error("Email sending failed:", err));

  // 4- Send response
  logger("auth").info(`User sign up: ${user.email}`);
  res.status(201).json({ data: user, token });
});



exports.login = asyncHandler(async (req, res, next) => {
  // 1) check if password and email in the body (validation)
  // 2) check if user exist & check if password is correct
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    logger("auth").warn(`Failed login attempt for user: ${req.body.email}`);
    return next(new ApiError("Incorrect email or password", 401));
  }
  // 3) generate token
  const token = createToken(user._id);

  // Delete password from response
  delete user._doc.password;
  // 4) send response to client side
  logger("auth").info(`User logged in: ${req.body.email}`);
  res.status(200).json({ data: user, token });
});

exports.logout = asyncHandler(async (req, res, next) => {
  logger("auth").info(`User(Email :${req.body.email}) logged out`);

  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully.",
    token: null, // only for testing on postman
  });
});
