const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name required"],
      minlength: [6, "Too short name"],
      maxlength: [15, "Too long name "],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address",
      ],
      lowercase: true,
      unique: [true, "Email already exists"],
    },
    cart: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    password: {
      type: String,
      required: [true, "password required"],
      minlength: [6, "Too short password"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Virtual property for totalCost
userSchema.virtual("totalCost").get(function () {
  if (!this.cart || this.cart.length === 0) return 0;

  return this.cart.reduce((acc, item) => {
    if (item.book && item.book.price) {
      return acc + item.book.price * item.quantity;
    }
    return acc;
  }, 0);
});

// Ensure totalCost appears inside the cart when sending JSON
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.cart = ret.cart || [];
    ret.totalCost = ret.totalCost || 0;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
