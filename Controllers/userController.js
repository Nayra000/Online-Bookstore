const User = require("../Models/userModel");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const ApiError = require("../Utils/apiError");
const createToken = require("../Utils/createToken");

// @route   GET /api/v1/users
exports.getUsers = asyncHandler(async (req, res, next) => {
  const { limit, skip, ...filter } = req.query;
  const limitValue = Number(limit) || 10;
  const skipValue = Number(skip) || 0;

  const users = await User.find(filter).skip(skipValue).limit(limitValue);
  res.status(200).json({
    results: users.length,
    limit: limitValue,
    skip: skipValue,
    data: users,
  });
});

// @route   GET /api/v1/users/:id
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: user });
});

// @route   PATCH /api/v1/users/:id
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @route   DELETE /api/v1/users/:id
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndDelete(req.params.id);
  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(202).json({
    status: "the User is deleted successfully ",
  });
});

//@route PATCH /api/v1/users/changePassword/:id
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @route   GET /api/v1/users/getMe
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @route   PATCH /api/v1/users/changeMyPassword
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user password based user payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  // 2) Generate token
  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});

// @route   PATCH  /api/v1/users/updateme
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    { new: true }
  );

  res.status(200).json({ data: updatedUser });
});

// @route   DELETE /api/v1/users/deleteMe
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: "Success" });
});
