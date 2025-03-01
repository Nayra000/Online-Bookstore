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
        reviews: req.body.reviews,
        image: req.file.filename,
        description: req.body.description,
    })
    res.status(201).json({
        book

    })

})