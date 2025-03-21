const express = require("express");
const {cacheBooks ,cacheBookById} = require("../Middlewares/cacheMiddleware")
const {
    getBooks,
    createBook,
    uploadCoverImage,
    getBookById,
    deleteBook,
    updateBook,
} = require("../Controllers/bookController");

const authMiddleware = require("../Middlewares/authMiddleware");
const validateCreatedBook = require("../Validations/createdBookValidator");
const validateUpdatedBook = require("../Validations/updatedBookValidator");

const router = express.Router();

router.use(authMiddleware.protect);

router
    .route("/")
    .get(authMiddleware.allowedTo("admin", "user"),cacheBooks ,getBooks)
    .post(
        authMiddleware.allowedTo("admin"),
        uploadCoverImage.single("coverImage"),
        validateCreatedBook.validateCreatedBook,
        createBook
    );

router
    .route("/:id")
    .get(authMiddleware.allowedTo("admin", "user"),cacheBookById, getBookById)
    .patch(
        authMiddleware.allowedTo("admin"),
        validateUpdatedBook.validateUpdatedBook,
        updateBook
    )
    .delete(authMiddleware.allowedTo("admin"), deleteBook);

module.exports = router;

