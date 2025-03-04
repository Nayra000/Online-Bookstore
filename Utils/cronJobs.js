const cron = require("node-cron");
const User = require("../Models/userModel");

// Schedule a job to run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("🕒 Running cart cleanup...");

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2); 

  const result = await User.updateMany(
    { cartUpdatedAt: { $lte: twoDaysAgo } }, 
    { $set: { cart: [], cartUpdatedAt: Date.now() } }
  );

  console.log(`🧹 Cleared carts for ${result.modifiedCount} users.`);
});

console.log("🕒 Cart cleanup cron job scheduled.");


module.exports = cron;
