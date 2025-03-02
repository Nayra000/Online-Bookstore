const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required for the review"]
        },
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: [true, "Book ID is required for the review"]
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            maxlength: 500
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        },
        updatedAt: { 
            type: Date 
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
