const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const CheckObjectId = (idToCheck) => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[idToCheck])) {
    return next(new AppError('Invalid ID, Please try again', 401));
  }
  next();
};

module.exports = CheckObjectId;
