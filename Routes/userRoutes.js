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
const { getMyOrders } = require("../Controllers/orderController");
const { getUserReviews } = require("../Controllers/reviewController");
const authMiddleware = require("../Middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.get("/getMe", authMiddleware.allowedTo("user"), getLoggedUserData, getUser);
router.patch("/changeMyPassword", authMiddleware.allowedTo("user"), updateLoggedUserPassword);
router.patch("/updateMe", authMiddleware.allowedTo("user"), updateLoggedUserValidator, updateLoggedUserData);
router.delete("/deleteMe", authMiddleware.allowedTo("user"), deleteLoggedUserData);
router.route("/myOrders").get(authMiddleware.allowedTo("user"), getMyOrders);
router.route("/myReviews").get(authMiddleware.allowedTo("user"), getUserReviews);

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
