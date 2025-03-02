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

router.route("/")
    .get(getBooks)
    .post(uploadCoverImage.single("coverImage"),
        validateCreatedBook.validateCreatedBook,
        createBook);


router.route("/:id")
    .get(getBookById)
    .patch(uploadCoverImage.single("coverImage"),
        validateUpdatedBook.validateUpdatedBook,
        updateBook)
    .delete(deleteBook);

module.exports = router;