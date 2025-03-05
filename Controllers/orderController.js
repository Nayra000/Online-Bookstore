const User = require("../Models/userModel");
const Book = require("../Models/bookModel");
const Order = require("../Models/orderModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../Utils/apiError");
const sendEmail = require("../Utils/sendEmail");
const {
  getReceiptEmail,
  getStatusUpdateEmail,
} = require("../Utils/mailFormat");

const validateUserAndCart = async (userId, session) => {
  const user = await User.findById(userId).session(session).exec();
  if (!user) throw new ApiError("❌ User not found", 404);
  if (user.cart.length === 0) throw new ApiError("❌ User cart is empty", 400);
  return user;
};

const checkStockAvailability = (userCart, booksMap) => {
  const errors = [];

  userCart.forEach((item) => {
    const book = booksMap.get(item.book.toString());
    if (!book) {
      errors.push(`❌ Book with ID ${item.book} not found`);
    } else if (book.stock < item.quantity) {
      errors.push(
        `❌ Not enough stock for "${book.title}" (Requested: ${item.quantity}, Available: ${book.stock})`
      );
    }
  });

  if (errors.length > 0) {
    throw new ApiError(errors.join("\n"), 400);
  }
};

const prepareBooksOrdered = (userCart, booksMap) =>
  userCart.map((item) => ({
    book: booksMap.get(item.book.toString())._id,
    quantity: item.quantity,
    priceAtPurchase: booksMap.get(item.book.toString()).price,
  }));

const updateBookStock = async (userCart, session, status) => {
  const errors = [];

  await Promise.all(
    userCart.map(async (item) => {
      const book = await Book.findById(item.book).session(session).exec();
      if (!book) {
        errors.push(`❌ Book with ID: ${item.book} not found.`);
      } else if (book.stock < item.quantity) {
        errors.push(
          `❌ Not enough stock for "${book.title}" (Requested: ${item.quantity}, Available: ${book.stock})`
        );
      } else {
        if (status === "create") {
          const updateResult = await Book.updateOne(
            { _id: item.book, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { session }
          );

          if (updateResult.matchedCount === 0) {
            errors.push(`❌ Stock update failed for "${book.title}".`);
          }
        } else if (status === "canceled") {
          await Book.updateOne(
            { _id: item.book },
            { $inc: { stock: item.quantity } },
            { session }
          );
        }
      }
    })
  );

  if (errors.length > 0) {
    throw new ApiError(errors.join("\n"), 400);
  }
};

const createNewOrder = async (user, booksOrdered, paymentMethod, session) => {
  const newOrder = await new Order({
    user: user._id,
    books: booksOrdered,
    paymentMethod,
  }).save({ session });

  const populatedOrder = await Order.findById(newOrder._id)
    .populate({
      path: "books.book",
      select: "title", // Ensure only title is fetched
    })
    .session(session);

  return populatedOrder;
};

const getOrders = async (userId) => {
  const userExists = await User.exists({ _id: userId }).exec();
  if (!userExists) throw new ApiError("❌ User does not exist", 404);

  const orders = await Order.find({ user: userId })
    .sort({ orderDate: -1 })
    .populate("user", "name email")
    .populate("books.book", "title description author averageRating")
    .exec();

  if (orders.length === 0)
    throw new ApiError("ℹ️ No orders found for this user", 404);

  return orders;
};
exports.createOrder = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { paymentMethod = "cash" } = req.body;
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const user = await validateUserAndCart(userId, session);
    const bookIds = user.cart.map((item) => item.book);
    const books = await Book.find({ _id: { $in: bookIds } })
      .session(session)
      .exec();
    const booksMap = new Map(books.map((book) => [book._id.toString(), book]));

    checkStockAvailability(user.cart, booksMap);
    const booksOrdered = prepareBooksOrdered(user.cart, booksMap);

    const newOrder = await createNewOrder(
      user,
      booksOrdered,
      paymentMethod,
      session
    );

    await updateBookStock(user.cart, session, "create");

    user.cart = [];
    await user.save({ session });

    const receiptHtml = getReceiptEmail(req.user, newOrder);
    await sendEmail({
      email: req.user.email,
      subject: "Order Confirmation & Receipt",
      message: receiptHtml,
    });

    await newOrder.save({ session });

    await session.commitTransaction();
    res.status(201).json(newOrder);
  } catch (error) {
    await session.abortTransaction();
    next(new ApiError(error.message, 400));
  } finally {
    session.endSession();
  }
});

exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find()
    .populate("books.book", "title description author averageRating")
    .exec();
  if (!orders.length) next(new ApiError("❌ Orders not found", 404));
  res.status(200).json({ result: orders.length, data: orders });
});

exports.getOrderById = asyncHandler(async (req, res, next) => {
  const { id: orderId } = req.params;
  const order = await Order.findById(orderId)
    .populate("books.book", "title description author averageRating")
    .exec();
  if (!order) next(new ApiError("❌ Order not found", 404));
  res.status(200).json(order);
});

exports.getOrdersByUserId = asyncHandler(async (req, res, next) => {
  const orders = await getOrders(req.params.id);
  if (!orders) next(new ApiError("Order not found", 404));
  res.status(200).json({
    result: orders.length,
    message: "📦 Orders retrieved successfully!",
    data: orders,
  });
});

exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await getOrders(req.user._id);
  if (!orders) next(new ApiError("Order not found", 404));
  res.status(200).json({
    result: orders.length,
    message: "📦 Orders retrieved successfully!",
    data: orders,
  });
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { id: orderId } = req.params;
  const { status } = req.body;

  const session = await Order.startSession();
  session.startTransaction();

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, session }
    )
      .populate({
        path: "books.book",
        select: "title",
      })
      .populate({
        path: "user",
        select: "name email",
      })
      .exec();
    if (!order) next(new ApiError("❌ Order not found", 404));

    if (status === "canceled")
      await updateBookStock(order.books, session, "canceled");

    await session.commitTransaction();

    res.status(200).json(order);

    setImmediate(async () => {
      try {
        const statusUpdateHtml = getStatusUpdateEmail(order.user.name, order);
        await sendEmail({
          email: order.user.email,
          subject: `Order #${order._id} Status Update`,
          message: statusUpdateHtml,
        });
      } catch (err) {
        console.error("Email sending failed:", err);
      }
    });
  } catch (error) {
    await session.abortTransaction();
    next(new ApiError(error.message, 404));
  } finally {
    session.endSession();
  }
});
