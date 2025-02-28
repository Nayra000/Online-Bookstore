const express = require("express");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../Validations/userValidator");

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
} = require("../Controllers/userController");

const authMiddleware = require("../Middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

// router.use(authMiddleware.allowedTo("user"));

router.get("/getMe", authMiddleware.allowedTo("user"),getLoggedUserData, getUser);
router.patch("/changeMyPassword", authMiddleware.allowedTo("user"),updateLoggedUserPassword);
router.patch("/updateMe",authMiddleware.allowedTo("user"), updateLoggedUserValidator, updateLoggedUserData);
router.delete("/deleteMe",authMiddleware.allowedTo("user"), deleteLoggedUserData);

// Admin
router.use(authMiddleware.allowedTo("admin"));
router.patch(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);
router.route("/").get(getUsers);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .patch(updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
