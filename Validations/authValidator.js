const { check } = require("express-validator");
const validatorMiddleware = require("../Middlewares/validatorMiddleware");
const User = require("../Models/userModel");

const validateName = check("name")
  .notEmpty()
  .withMessage("User required")
  .isLength({ min: 3 })
  .withMessage("Too short User name");

const validateEmail = check("email")
  .notEmpty()
  .withMessage("Email required")
  .isEmail()
  .withMessage("Invalid email address");

const validateUniqueEmail = check("email").custom(async (val) => {
  const user = await User.findOne({ email: val });
  if (user) {
    return Promise.reject("E-mail already in use");
  }
});

const validatePassword = check("password")
  .notEmpty()
  .withMessage("Password required")
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters");

const validatePasswordConfirm = check("passwordConfirm")
  .notEmpty()
  .withMessage("Password confirmation required")
  .custom((passwordConfirm, { req }) => {
    if (passwordConfirm !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  });

exports.signupValidator = [
  validateName,
  validateEmail,
  validateUniqueEmail,
  validatePassword,
  validatePasswordConfirm,
  validatorMiddleware,
];

exports.loginValidator = [validateEmail, validatePassword, validatorMiddleware];
