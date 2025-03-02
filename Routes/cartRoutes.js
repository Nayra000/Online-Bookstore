const express = require("express");
const {
  viewCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  addToCart,
} = require("../Controllers/cartController");

const authMiddleware = require("../Middlewares/authMiddleware");
const {
  validateAddToCart,
  validateUpdateCartItem,
  validateRemoveFromCart,
  validateClearCart,
} = require("../Validations/cartValidator");

const router = express.Router();

router.use(authMiddleware.protect);

router
  .route("/")
  .get(viewCart)
  .post(validateAddToCart, addToCart)
  .patch(validateUpdateCartItem, updateCartItem);

router.route("/clear").delete(validateClearCart, clearCart);

router.route("/book/:id").delete(validateRemoveFromCart, removeFromCart);

module.exports = router;
