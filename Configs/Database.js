const mongoose = require("mongoose");
const logger = require("../logger")

const dbConnection = () => {
  mongoose.connect(process.env.DB_URI).then((conn) => {
    logger("app").info(`Database connected: ${conn.connection.host}`);
  }).catch((err) => {
    logger("error").error(`Error connecting to the database: ${err.message}`);
    // Ensure logs are flushed before exiting
    setTimeout(() => process.exit(1), 500);
  });
};

mongoose.connection.on("disconnected", () => {
  logger("app").warn("MongoDB connection lost. Attempting to reconnect...");
});
module.exports = dbConnection;
