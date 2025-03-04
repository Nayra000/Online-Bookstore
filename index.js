const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const dbConnection = require("./Configs/Database");
const cron = require("./Utils/cronJobs");
const ApiError = require("./Utils/apiError");
const globalError = require("./Middlewares/errorMidddleware");
const mountRoutes = require("./Routes/index");
dotenv.config({ path: "config.env" });

dbConnection();

const app = express();

app.use(express.json());
app.options("*", cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`node:${process.env.NODE_ENV}`);
}

// Mout Routes using function
mountRoutes(app);

// Handle 404 Errors
app.all("*", (req, res, next) => {
  next(new ApiError(`can't find this route:${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

// Handle rejections outside express
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Errors: ${err.name}|${err.message}`);
  server.close(() => {
    console.log("shutting down....");
    process.exit(1);
  });
});

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
