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
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }
    ],
    image: {
        type: String,
    }
},
    {
        timestamps: true,

        toJSON: { virtuals: true },
    });


module.exports = mongoose.model("Book", bookSchema);