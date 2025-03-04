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
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

module.exports = mongoose.model("Review", reviewSchema);

//function to calculate average rating
reviewSchema.statics.calculateAverageRating = async function (bookId) {
    const stats = await this.aggregate([
      { $match: { book: bookId } },
      {
        $group: {
          _id: "$book",
          averageRating: { $avg: "$rating" },
          numReviews: { $sum: 1 },
        },
      },
    ]);
  
    if (stats.length > 0) {
      await Book.findByIdAndUpdate(bookId, {
        averageRating: stats[0].averageRating,
        numReviews: stats[0].numReviews,
      });
    } else {
      await Book.findByIdAndUpdate(bookId, { averageRating: 0, numReviews: 0 });
    }
  };
  reviewSchema.post('save' ,async function(){
    this.constructor.calculateAverageRating(this.book);
})
  