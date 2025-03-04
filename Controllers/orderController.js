const User = require("../Models/userModel");
const Book = require("../Models/bookModel");
const Order = require("../Models/orderModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../Utils/apiError");

const validateUserAndCart = async (userId, session, next) => {
    const user = await User.findById(userId).session(session).exec();
    if (!user) return next(new ApiError("❌ User not found", 404));
    if (user.cart.length === 0) return next(new ApiError("❌ User cart is empty", 400));

    return user;
};

const checkStockAvailability = (userCart, booksMap, next) => {
    const errors = [];

    userCart.forEach(item => {
        const book = booksMap.get(item.book.toString());
        if (!book) {
            errors.push(`❌ Book with ID ${item.book} not found`);
        } else if (book.stock < item.quantity) {
            errors.push(`❌ Not enough stock for "${book.title}" (Requested: ${item.quantity}, Available: ${book.stock})`);
        }
    });

    if (errors.length > 0) {
        return next(new ApiError(errors.join("\n"), 400));
    }
};

const prepareBooksOrdered = (userCart, booksMap) => {
    return userCart.map(item => ({
        book: booksMap.get(item.book.toString())._id,
        quantity: item.quantity,
        priceAtPurchase: booksMap.get(item.book.toString()).price
    }));
};

const updateBookStock = async (userCart, session, status, next) => {
    const errors = [];

    await Promise.all(userCart.map(async item => {
        const book = await Book.findById(item.book).session(session).exec();
        if (!book) {
            errors.push(`❌ Book with ID: ${item.book} not found.`);
        } else if (book.stock < item.quantity) {
            errors.push(`❌ Not enough stock for "${book.title}" (Requested: ${item.quantity}, Available: ${book.stock})`);
        } else {
            if (status === 'create') {
                const updateResult = await Book.updateOne(
                    { _id: item.book, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity } },
                    { session }
                );

                if (updateResult.matchedCount === 0) {
                    errors.push(`❌ Stock update failed for "${book.title}".`);
                }
            } else if (status === 'canceled') {
                await Book.updateOne(
                    { _id: item.book },
                    { $inc: { stock: item.quantity } },
                    { session }
                );
            }
        }
    }));

    if (errors.length > 0) {
        return next(new ApiError(errors.join("\n"), 400));
    }
};

const createNewOrder = async (user, booksOrdered, paymentMethod, discountAmount, session) => {
    const newOrder = await new Order({
        user: user._id,
        books: booksOrdered,
        paymentMethod,
        discountAmount
    }).save({ session });
    return newOrder;
};

const getOrders = async (userId, res, next) => {
    const userExists = await User.exists({ _id: userId }).exec();
    if (!userExists) {
        return next(new ApiError("❌ User does not exist", 404));
    }

    const orders = await Order.find({ user: userId })
        .sort({ orderDate: -1 })
        .populate({
            path: "user",
            select: "name email"
        })
        .populate({
            path: "books.book",
            select: "title description author averageRating"
        }).exec();

    if (orders.length === 0) {
        return next(new ApiError("ℹ️ No orders found for this user", 404));
    }

    console.info("📦 Orders found:", orders);
    res.status(200).json({
        result: orders.length,
        message: "📦 Orders retrieved successfully!",
        data: orders,
    });
};


exports.createOrder = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { paymentMethod = 'cash', discountAmount = 0 } = req.body;

    const session = await Order.startSession();
    session.startTransaction();

    try {
        const user = await validateUserAndCart(userId, session, next);
        if (!user) return;

        const bookIds = user.cart.map(item => item.book);
        const books = await Book.find({ _id: { $in: bookIds } }).session(session).exec();
        const booksMap = new Map(books.map(book => [book._id.toString(), book]));

        const stockError = checkStockAvailability(user.cart, booksMap, next);
        if (stockError) return;

        const booksOrdered = prepareBooksOrdered(user.cart, booksMap);
        const newOrder = await createNewOrder(user, booksOrdered, paymentMethod, discountAmount, session);

        await updateBookStock(user.cart, session, "create", next);

        user.cart = [];
        await user.save({ session });

        await session.commitTransaction();
        console.info("✅ Order created successfully:", newOrder);
        res.status(201).json(newOrder);
    } catch (error) {
        await session.abortTransaction();
        console.error("❌ Transaction aborted due to error:", error.message || error);
        next(error instanceof ApiError ? error : new ApiError(error.message || "Internal Server Error", 500));
    } finally {
        session.endSession();
    }
});


exports.getAllOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.find()
        .sort({ orderDate: -1 })
        .populate({
            path: "user",
            select: "name email"
        })
        .populate({
            path: 'books.book',
            select: 'title description author averageRating'
        })
        .exec();

    if (!orders) {
        return next(new ApiError("❌ Orders not found", 404));
    }

    console.info("📦 All Orders!");
    res.status(200).json({ result: orders.length, data: orders });
});

exports.getOrderById = asyncHandler(async (req, res, next) => {
    const { id: orderId } = req.params;
    const order = await Order.findById(orderId)
        .populate({
            path: "user",
            select: "name email"
        })
        .populate({
            path: 'books.book',
            select: 'title description author averageRating'
        })
        .exec();

    if (!order) {
        return next(new ApiError("❌ Order not found", 404));
    }

    console.info("📦 Order found:", order);
    res.status(200).json(order);
});

exports.getOrdersByUserId = asyncHandler(async (req, res, next) => {
    const userId = req.params.id;
    return await getOrders(userId, res, next);
});

exports.getMyOrders = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    return await getOrders(userId, res, next);
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { id: orderId } = req.params;
    const { status } = req.body;

    const session = await Order.startSession();
    session.startTransaction();

    try {
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true, session }).exec();
        if (!order) {
            await session.abortTransaction();
            return next(new ApiError("❌ Order not found", 404));
        }

        if (status === "canceled") {
            await updateBookStock(order.books, session, "canceled", next);
        }

        await session.commitTransaction();
        console.info("✅ Order status updated successfully:", order);
        res.status(200).json(order);
    } catch (error) {
        await session.abortTransaction();
        console.error("❌ Transaction aborted due to error:", error.message || error);
        next(error instanceof ApiError ? error : new ApiError(error.message || "Internal Server Error", 500));
    } finally {
        session.endSession();
    }
});

