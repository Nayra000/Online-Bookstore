const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const dbConnection = require("./Configs/Database");
require("./Utils/cronJobs");
const ApiError = require("./Utils/apiError");
const globalError = require("./Middlewares/errorMidddleware");
const mountRoutes = require("./Routes/index");
const logger = require('./logger');
const { webhookCheckout } = require("./Controllers/onlinePaymentController");
const path = require("path");


const logger = require('./logger');

dotenv.config({ path: "config.env" });


dbConnection();

const app = express();

app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

app.use(express.json());
app.options("*", cors());
app.use(express.static(path.join(__dirname, "bookCovers")));

const logFileStream = fs.createWriteStream(path.join(__dirname, "logs", "access.log"),
  { flags: 'a' });


if (process.env.NODE_ENV === "development") {
  morgan.format("customFormat", ':date[iso] | :method :url | Status: :status | :response-time ms | IP: :remote-addr');
  app.use(morgan("customFormat", { stream: logFileStream }));
  app.use(morgan("dev"));
  logger("app").info(`node:${process.env.NODE_ENV}`);
}

// Mout Routes using function
mountRoutes(app);

// Handle 404 Errors
app.all("*", (req, res, next) => {
  next(new ApiError(`can't find this route:${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

process.on("uncaughtException", (error) => {
  logger("error").error(error.message);
  server.close(() => {
    logger("app").info("shutting down....");
    setTimeout(() => process.exit(1), 500);
  })
});
// Handle rejections outside express
process.on("unhandledRejection", (error) => {
  logger("error").error(error.message);
  server.close(() => {
    logger("app").info("shutting down....");
    setTimeout(() => process.exit(1), 500);
  })
});

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  logger("app").info(`Server is running on port ${PORT}`);
});
module.exports = server;
