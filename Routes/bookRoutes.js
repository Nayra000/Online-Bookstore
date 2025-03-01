const express = require('express');

const { getBooks, createBook, uploadCoverImage } = require("../Controllers/bookController");
const authMiddleware = require("../Middlewares/authMiddleware");
const bookValidator = require("../Validations/bookValidator");

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.allowedTo("admin"));

router.get("/", getBooks);

router.post("/", uploadCoverImage.single("coverImage"), bookValidator.validateBook, createBook);

/* router.get("/:id",);

router.patch("/id:",);

router.delete("/:id",); */

module.exports = router;