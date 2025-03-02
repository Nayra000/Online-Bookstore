const express = require('express');

const { getBooks, createBook,
    uploadCoverImage, getBookById
    , deleteBook, updateBook } = require("../Controllers/bookController");
const authMiddleware = require("../Middlewares/authMiddleware");
const validateCreatedBook = require("../Validations/createdBookValidator");
const validateUpdatedBook = require("../Validations/updatedBookValidator");

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.allowedTo("admin"));

router.get("/", getBooks);

router.post("/", uploadCoverImage.single("coverImage"),
    validateCreatedBook.validateCreatedBook,
    createBook);

router.get("/:id", getBookById);

router.patch("/:id", validateUpdatedBook.validateUpdatedBook, updateBook);

router.delete("/:id", deleteBook);

module.exports = router;