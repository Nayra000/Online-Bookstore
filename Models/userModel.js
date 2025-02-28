const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // - Users (name, email, password, role).
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
    },
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
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.set("toJSON", {
  transform: (doc, { __v, password, ...rest }) => {
    return rest;
  },
});

module.exports = mongoose.model("User", userSchema);
