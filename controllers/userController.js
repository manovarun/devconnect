const expressAsyncHandler = require('express-async-handler');
const gravatar = require('gravatar');
const AppError = require('../utils/AppError');
const User = require('../models/User');

exports.getAllUsers = expressAsyncHandler(async (req, res, next) => {
  const users = await User.find();

  if (!users.length) {
    return next(new AppError('Users not found, please try again', 404));
  }

  res.status(200).json({ status: 'Success', data: { users } });
});

exports.createUser = expressAsyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    return next(new AppError('User already exists, please login.', 400));
  }

  const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });

  user = await User.create({ name, email, password, avatar });

  if (!user) {
    return next(new AppError('Unable to create user, please try again'));
  }

  res.status(201).json({ status: 'User Created', data: { user } });
});

exports.getUser = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found, please try again', 404));
  }

  res.status(201).json({ status: 'Success', data: { user } });
});

exports.updateUser = expressAsyncHandler(async (req, res, next) => {
  const userFound = await User.findById(req.params.id);

  if (!userFound) {
    return next(new AppError('User not found, please try again', 404));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json({ status: 'Success', data: user });
});

exports.deleteUser = expressAsyncHandler(async (req, res, next) => {
  const userFound = await User.findById(req.params.id);

  if (!userFound) {
    return next(new AppError('Invalid request, please try again', 400));
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(204).json({ status: 'Success', data: null });
});
