const expressAsyncHandler = require('express-async-handler');
const gravatar = require('gravatar');
const User = require('../models/User');
const AppError = require('../utils/AppError');

exports.register = expressAsyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    return next(new AppError('User already exists, please login.', 400));
  }

  const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });

  user = await User.create({ name, email, password, avatar });

  if (!user) {
    return next(new AppError('Unable to create user, please try again', 500));
  }

  const token = await user.getSignedJwtToken();

  res.status(201).json({ status: 'User Registered...', data: { user }, token });
});

exports.login = expressAsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide an email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(
      new AppError('User not exists, please check your credentials.', 400)
    );
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new AppError('Invalid Credentials', 401));
  }

  const token = await user.getSignedJwtToken();

  res.status(200).json({ status: 'User Logged In...', data: { user }, token });
});

exports.getMe = expressAsyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new Error('Please Login..', 400));
  }

  res.status(200).json({ status: 'Success', data: req.user });
});
