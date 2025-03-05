const stripe = require("stripe")(process.env.STRIPE_SECRET);
const asyncHandler = require("express-async-handler");
const ApiError = require("../Utils/apiError");
const User = require("../Models/userModel");
const Order = require("../Models/orderModel");
const { path } = require("../Models/bookOrderedModel");
const { createOrder } = require("./orderController");

// @desc    Get checkout session from stripe and send it as response
// @route   GET /api/v1/orders/online-payment/
// @access  Protected/User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  const shippingPrice = 20;

  // 1) Get user's cart with book details
  const cart = await User.findById(req.user._id)
    .select("cart totalCost")
    .populate({
      path: "cart.book",
      select: "title image price",
    });

  if (!cart) {
    return next(new ApiError(`There is no such cart for you`, 404));
  }

  // Ensure totalCost is defined
  const cartPrice = cart.totalCost || 0;
  const totalOrderPrice = cartPrice + shippingPrice;

  //   // Convert cart books to an array of IDs
  //   const cartItemsIds = cart.cart
  //     .map((item) => item.book._id.toString())
  //     .join(",");

  // ✅ Create line items for Stripe
  const lineItems = cart.cart.map((item) => ({
    price_data: {
      currency: "egp",
      product_data: {
        name: item.book.title,
        images: [item.book.image],
      },
      unit_amount: item.book.price * 100,
    },
    quantity: item.quantity,
  }));

  lineItems.push({
    price_data: {
      currency: "egp",
      product_data: {
        name: "Shipping",
        images: [
          "https://firebasestorage.googleapis.com/v0/b/clinic-square.appspot.com/o/uploads%2Fdownload.png?alt=media&token=7c49907c-780d-4788-8111-f4ca30488139",
        ],
      },
      unit_amount: shippingPrice * 100,
    },
    quantity: 1,
  });

  // 3) Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/api/v1/orders/payment-successfully`,
    cancel_url: `${req.protocol}://${req.get(
      "host"
    )}/api/v1/orders/payment-rejected`,
    customer_email: req.user.email,
    client_reference_id: req.user._id,
  });

  // 4) Send session to response
  res.status(200).json({ status: "success", session });
});

const createCardOrder = async (session) => {
  const userId = session.client_reference_id;
  const orderPrice = session.amount_total / 100;

  const user = await User.findById(userId).select("cart email");
  if (!user || !user.cart.length) {
    throw new ApiError("User not found or cart is empty", 404);
  }
  const fakeReq = {
    user,
    body: { paymentMethod: "visa" },
  };
  await createOrder(fakeReq, {}, () => {});
};

exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    createCardOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});
