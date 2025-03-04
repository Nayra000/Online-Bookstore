const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });

const userRouter = require("./userRoutes");
const authRouter = require("./authRoutes");
const orderRouter = require("./orderRoutes");
const bookRouter = require("./bookRoutes");
const cartRoutes = require("./cartRoutes");
const reviewRouter = require("./reviewRoutes");

const mountRoutes = (app) => {
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/reviews", reviewRouter);
  app.use("/api/v1/orders", orderRouter);
  app.use("/api/v1/books", bookRouter);
  app.use("/api/v1/cart", cartRoutes);
};

module.exports = mountRoutes;
