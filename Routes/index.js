const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });

const userRouter = require("./userRoutes");
const authRouter = require("./authRoutes");

const mountRoutes = (app) => {
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/auth", authRouter);
};

module.exports = mountRoutes;
