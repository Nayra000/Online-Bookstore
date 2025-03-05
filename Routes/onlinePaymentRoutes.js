const express = require("express");
const path = require("path");

const router = express.Router();


router.get("/payment-successfully", (req, res) => {
  const filePath = path.join(__dirname, "../Utils/success.html");
  res.sendFile(filePath);
});
router.get("/payment-rejected", (req, res) => {
  const filePath = path.join(__dirname, "../Utils/cancel.html");
  res.sendFile(filePath);
});


module.exports = router;