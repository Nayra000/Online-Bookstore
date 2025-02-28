const express = require("express");
const {
  signupValidator,
  loginValidator,
} = require("../Validations/authValidator");

const { signup, login, logout } = require("../Controllers/authController");

const router = express.Router();

router.post("/signup", signupValidator, signup);

router.post("/login", loginValidator, login);

router.post("/logout", logout);

module.exports = router;
