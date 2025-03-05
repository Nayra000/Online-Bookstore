const mongoose = require('mongoose');


const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "You must provide a title the book"]
    },
    author: {
        type: String,
        required: [true, "You must provide an author name the book"]
    },
    price: {
        type: Number,
        required: [true, "You must provide a price the book"]
    },
    description: {
        type: String,
        required: [true, "You must provide a description for the book"]
    },
    stock: {
        type: Number,
        required: [true, "You must provide a stock number for the book"],
        min: 0
    },
    // reviews: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Review"
    // }
    // ],
    image: {
        type: String,
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be above or equal 1.0'],
        max: [5, 'Rating must be below or equal 5.0'],
    },
    numReviews: {
        type: Number,
        default: 0,
    },
},

    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    });

bookSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'book',
    localField: '_id',
});

module.exports = mongoose.model("Book", bookSchema);