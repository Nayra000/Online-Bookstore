const { Schema, model, Types } = require("mongoose");
const bookOrderedSchema = require("./bookOrderedModel");

const orderSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "out for delivery", "delivered", "canceled"],
    },
    paymentMethod: {
      type: String,
      default: "cash",
      enum: {
        values: ["cash", "visa"],
        message: "❌ {VALUE} is not a valid payment method",
      },
    },
    books: {
      type: [bookOrderedSchema],
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, "❌ Discount cannot be negative"],
      validate: {
        validator: function (value) {
          return value <= this.totalWithoutDiscount;
        },
        message: "❌ Discount cannot exceed the total price",
      },
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.virtual("totalWithoutDiscount").get(function () {
  return this.books.reduce(
    (sum, book) => sum + book.quantity * book.priceAtPurchase,
    0
  );
});
orderSchema.virtual("totalPayment").get(function () {
  return this.totalWithoutDiscount - this.discountAmount;
});

orderSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    ret.totalWithoutDiscount = doc.totalWithoutDiscount;
    ret.totalPayment = doc.totalPayment;
    return ret;
  },
});

module.exports = model("Order", orderSchema);
