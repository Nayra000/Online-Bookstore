const User = require("../Models/userModel");
const Book = require("../Models/bookModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../Utils/apiError");

exports.addToCart = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const cartItems = req.body; // Format: { "bookId": quantity, "bookId": quantity, ... }

  if (!cartItems || Object.keys(cartItems).length === 0) {
    return next(new ApiError("Cart cannot be empty.", 400));
  }

  // Validate book existence
  const bookIds = Object.keys(cartItems);
  const books = await Book.find({ _id: { $in: bookIds } });

  if (books.length !== bookIds.length) {
    return next(new ApiError("Some books do not exist.", 400));
  }

  // Get user cart
  const user = await User.findById(userId);
  if (!user) {
    return next(new ApiError("User not found.", 404));
  }

  const cart = user.cart;

  // Update cart logic
  bookIds.forEach((bookId) => {
    const quantity = cartItems[bookId] > 0 ? cartItems[bookId] : 1;

    const existingItem = cart.find((item) => item.book.toString() === bookId);

    if (existingItem) {
      existingItem.quantity += quantity; // Increment quantity
    } else {
      cart.push({ book: bookId, quantity }); // Add new book
    }
  });

  // Save the updated cart
  user.cart = cart;
  await user.save();

  // Populate cart with book details
  await user.populate("cart.book", "title price");

  res
    .status(200)
    .json({ message: "Cart updated successfully.", cart: user.cart });
});


exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const cartUpdates = req.body; // Format: { "bookId": quantity, "bookId": quantity, ... }

  if (!cartUpdates || Object.keys(cartUpdates).length === 0) {
    return next(new ApiError("Cart update data is required.", 400));
  }

  const user = await User.findById(userId);
  if (!user) return next(new ApiError("User not found.", 404));

  // Iterate over the cart updates
  Object.entries(cartUpdates).forEach(([bookId, quantity]) => {
    const bookIndex = user.cart.findIndex(
      (item) => item.book.toString() === bookId
    );

    if (bookIndex !== -1) {
      if (quantity > 0) {
        user.cart[bookIndex].quantity = quantity; // Update quantity
      } else {
        user.cart.splice(bookIndex, 1); // Remove book if quantity is 0
      }
    }
  });

  await user.save();
  await user.populate("cart.book", "title price");

  res
    .status(200)
    .json({ message: "Cart updated successfully.", cart: user.cart });
});



exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { id:bookId } = req.params;

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { cart: { book: bookId } } },
    { new: true }
  ).populate("cart.book", "title price");

  if (!user) return next(new ApiError("User not found.", 404));

  res.status(200).json({ message: "Book removed from cart.", cart: user.cart });
});


exports.viewCart = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId).populate("cart.book", "title price");

  if (!user) return next(new ApiError("User not found.", 404));

  res.status(200).json({ cart: user.cart, totalCost: user.totalCost });
});

exports.clearCart = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findByIdAndUpdate(
    userId,
    { cart: [] },
    { new: true }
  );

  if (!user) return next(new ApiError("User not found.", 404));

  res.status(200).json({ message: "Cart cleared successfully.", cart: user.cart });
});
