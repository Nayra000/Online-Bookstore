const cron = require("node-cron");
const User = require("../Models/userModel");
const logger = require("../logger");

// Schedule a job to run every day at midnight
cron.schedule("0 0 * * *", async () => {
  logger("app").info("🕒 Running cart cleanup...");

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const result = await User.updateMany(
    { cartUpdatedAt: { $lte: twoDaysAgo } },
    { $set: { cart: [], cartUpdatedAt: Date.now() } }
  );

  logger("app").info(`🧹 Cleared carts for ${result.modifiedCount} users.`);
});

logger("app").info("🕒 Cart cleanup cron job scheduled.");


module.exports = cron;
