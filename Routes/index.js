const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });

const userRouter = require("./userRoutes");
const authRouter = require("./authRoutes");
const bookRouter = require("./bookRoutes");

const mountRoutes = (app) => {
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/books", bookRouter);
};

module.exports = mountRoutes;
