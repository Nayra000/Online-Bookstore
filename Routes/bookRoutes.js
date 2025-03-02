const express = require("express");

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
    .get(authMiddleware.allowedTo("admin", "user"), getBooks)
    .post(
        authMiddleware.allowedTo("admin"),
        uploadCoverImage.single("coverImage"),
        validateCreatedBook.validateCreatedBook,
        createBook
    );

router
    .route("/:id")
    .get(authMiddleware.allowedTo("admin", "user"), getBookById)
    .patch(
        authMiddleware.allowedTo("admin"),
        validateUpdatedBook.validateUpdatedBook,
        updateBook
    )
    .delete(authMiddleware.allowedTo("admin"), deleteBook);

module.exports = router;

