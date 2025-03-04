const Books = require("./../Models/bookModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../Utils/apiError");
const multer = require("multer");
const path = require("path");





const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join((__dirname, "bookCovers")));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + file.originalname;
        cb(null, uniqueSuffix)
    }
})
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Please upload only images'), false);
    }
};

exports.uploadCoverImage = multer({
    storage,
    fileFilter: multerFilter,
});

exports.getBooks = asyncHandler(async (req, res, next) => {
    const books = await Books.find();
    if (!books.length) {
        next(new ApiError("No books found", 404));
        return;
    }
    res.json({ length: books.length, books });

});

exports.createBook = asyncHandler(async (req, res, next) => {
    console.log(req.body.author);
    console.log(req.file);
    const book = await Books.create({
        title: req.body.title,
        author: req.body.author,
        price: req.body.price,
        stock: req.body.stock,
        coverImage: req.file.filename,
        image: req.file.filename,
        description: req.body.description,
    })
    res.status(201).json({
        book

    })

})

exports.deleteBook = asyncHandler(async (req, res, next) => {
    const book = await Books.findByIdAndDelete(req.params.id);
    console.log(book);
    if (!book) {
        next(new ApiError("No book found with that ID", 404));
        return;
    }
    res.json({ message: "Book deleted successfully" });

});

exports.getBookById = asyncHandler(async (req, res, next) => {
    const book = await Books.findById(req.params.id);
    if (!book) {
        next(new ApiError("No book found with that ID", 404));
        return;
    }
    res.json(book);
});

exports.updateBook = asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const book = await Books.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!book) {
        next(new ApiError("No book found with that ID", 404));
        return;
    }
    res.json(book);

});