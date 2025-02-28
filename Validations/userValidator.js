const bcrypt = require("bcryptjs");
const { check, body } = require("express-validator");

const validatorMiddleware = require("../Middlewares/validatorMiddleware");
const User = require("../Models/userModel");

const isMongoId = check("id").isMongoId().withMessage("Invalid User ID format");

const validateName = body("name")
  .optional()
  .isLength({ min: 3 })
  .withMessage("User name too short")
  .isLength({ max: 15 })
  .withMessage("User name too long");

const validateEmail = body("email")
  .notEmpty()
  .withMessage("Email required")
  .isEmail()
  .withMessage("Invalid email address")
  .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  .withMessage("Invalid email format")
  .custom(async (email) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already in use");
    }
  });

const validatePassword = body("password")
  .notEmpty()
  .withMessage("Password required")
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters")
  .custom((password, { req }) => {
    if (password !== req.body.passwordConfirm) {
      throw new Error("Password confirmation incorrect");
    }
    return true;
  });

const validatePasswordConfirm = body("passwordConfirm")
  .notEmpty()
  .withMessage("Password confirmation required");

const validateRole = body("role")
  .optional()
  .isIn(["user", "admin"])
  .withMessage("Invalid user role");

const preventRoleChange = body("role")
  .isEmpty()
  .withMessage("Role cannot be changed");

// Validators
exports.updateUserValidator = [
  isMongoId,
  validateName,
  validateEmail,
  preventRoleChange,
  validatorMiddleware,
];
exports.createUserValidator = [
  validateName.notEmpty().withMessage("User name required"),
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateRole,
  validatorMiddleware,
];

exports.getUserValidator = [isMongoId, validatorMiddleware];

exports.deleteUserValidator = [isMongoId, validatorMiddleware];

exports.updateLoggedUserValidator = [
  validateName,
  validateEmail.optional(),
  preventRoleChange,
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  isMongoId,

  body("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),
  body("NewPasswordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirmation"),
  body("NewPassword")
    .notEmpty()
    .withMessage("You must enter a new password")
    .custom(async (newPassword, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("No user found with this ID");
      }

      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }

      if (newPassword !== req.body.NewPasswordConfirm) {
        throw new Error("Password confirmation does not match");
      }

      return true;
    }),
  validatorMiddleware,
];
